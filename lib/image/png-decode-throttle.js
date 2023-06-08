//
// PNG decode throttling
//
// Use an event queue coroutine to hold back decoding and defer it 
// to avoid running out of memory.
//
// There are two producer-consumer lists:
//   - Decode list: The first keeps the low-memory pending-to-decode requests
//     and starts decoding as soon as there is available memory. After decoding
//     one it adds it to the process list.
//   - Process list: This is deferred so some decoding buffers can get out of
//     scope and freed. It also serializes final processing between events.
//     to allow the GC to work before starting the next one.
//

// Stack of pending inflates, these occupy low memory (still deflated)
let _pendingDecode = [];

// These are already deflated and should be processed ASAP.
// Limit to popping only one per event loop to alleviate memory load.
// Once inflated and decoded processing is relatively fast, but takes memory.
const _pendingProcess = [];

// processed / added to know if we can stop the worker setImmediate loop.
let _processed = 0;
let _added = 0;

// Max memory quota limit
let _memoryQuota = undefined;

// Used memory to avoid exceeding the limit
let _usedMemoryAccumulator = 0;

// Do we have a coroutine running already?
let _corroutineHandle = undefined;

export function pngDecodePixelsThrottle(pngImagePdfElement, pixelsCallback) {
  const maxMemoryMegabytes =
    pngImagePdfElement.document.options.maxPNGParallelDecodeMegaBytes;
  if (maxMemoryMegabytes === undefined) {
    // No throttle
    pngImagePdfElement.image.decodePixels(pixelsCallback);
    return;
  }

  // Update memory quota
  const wantedMemoryQuota = maxMemoryMegabytes * 1024 * 1024;
  if (_memoryQuota === undefined) {
    _memoryQuota = wantedMemoryQuota;
  } else if (_memoryQuota != wantedMemoryQuota) {
    console.warn(
      `Trying to change PNG decode throttling memory limit, using the lowest from now on. Wanted ${wantedMemoryQuota} had ${_memoryQuota}`
    );
    _memoryQuota = Math.min(wantedMemoryQuota, _memoryQuota);
  }

  // Worst inflate cost is what pngjs decodePixels can take:
  //  1. zlib buffer chunks (summing about the same as a full one)
  //  2. zlib unified buffer
  //  3. PNG decoded buffer
  // As these 3 buffers coexist, to err on the side of caution we calculate the worst memory footprint
  // SIDE NOTE: There's an open issue regarding a zlib buffer bug https://github.com/nodejs/node/issues/45303
  const worstInflateCost =
    pngImagePdfElement.width * pngImagePdfElement.height * 4 * 3;
  if (worstInflateCost > _memoryQuota) {
    throw new Error(
      'Trying to decode an image that would never fit the throttling memory quota'
    );
  }

  // Add to the pending list
  _pendingDecode.push({
    pngImagePdfElement,
    pixelsCallback,
    cost: worstInflateCost
  });
  _added++;

  // If there is no worker, launch one
  if (!_corroutineHandle) {
    const throttleCoroutine = () => {
      let lastGcMillis = Date.now();
      _corroutineHandle = setTimeout(() => {
        // Only if the GC is exposed by Node, we're over 75% usage and 1/2 second elapsed
        // then suggest it's time to free some memory
        if (global.gc && _usedMemoryAccumulator > 0.75 * _memoryQuota) {
          const now = Date.now();
          if (now - lastGcMillis > 500) {
            lastGcMillis = now;
            global.gc();
          }
        }

        // Start as many decodes as possible which fit in our memory quota
        const newPendingDecode = [];
        for (const pending of _pendingDecode) {
          if (_usedMemoryAccumulator + pending.cost >= _memoryQuota) {
            // Not enough memory for this one, maybe next round
            newPendingDecode.push(pending);
          } else {
            // Decode it
            const { pngImagePdfElement, pixelsCallback, cost } = pending;
            _usedMemoryAccumulator += cost;
            pngImagePdfElement.image.decodePixels(pixels => {
              _pendingProcess.push({
                cost,
                pixels,
                pixelsCallback
              });
            });
          }
        }
        _pendingDecode = newPendingDecode;

        // The worker calls only one processing callback per event loop.
        // This is a safety measure giving the garbage collector some room to
        // free stuff, so the extra buffer needed during processing of a single
        // image is not overloaded by more images that finished inflating at the
        // same time.
        if (_pendingProcess.length > 0) {
          (() => {
            const { cost, pixels, pixelsCallback } = _pendingProcess.pop();
            _usedMemoryAccumulator -= cost;
            _processed++;
            pixelsCallback(pixels);
          })();
        }

        // If there is more work, check next event loop
        if (_processed < _added) {
          throttleCoroutine();
        } else {
          // Finished processing, don't enqueue to loop again.
          _memoryQuota = undefined;
          _corroutineHandle = undefined;
        }
      }, 0);
    };
    throttleCoroutine();
  }
}
