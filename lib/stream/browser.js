import EventEmitter from '../event_emitter';

/**
 * A readable stream with just enough of the Node API for a PDF document:
 * `on('data')`, `on('end')`, `pipe()` and async iteration.
 *
 * ponytail: no `read()`, `setEncoding()`, `destroy()` or `error`/`close`
 * events. The document is built in memory and never applies backpressure to
 * its own producer, so the only backpressure that matters is the `drain` of
 * the pipe destination.
 */
class Readable extends EventEmitter {
  constructor() {
    super();
    this._buffer = [];
    this._flowing = false;
    this._scheduled = false;
    this._finished = false;
    this._endEmitted = false;
  }

  on(event, listener) {
    super.on(event, listener);
    if (event === 'data') this.resume();
    return this;
  }

  push(chunk) {
    if (chunk === null) {
      this._finished = true;
    } else {
      this._buffer.push(chunk);
    }
    this._schedule();
    return true;
  }

  resume() {
    this._flowing = true;
    this._schedule();
    return this;
  }

  pause() {
    this._flowing = false;
    return this;
  }

  pipe(destination) {
    this.on('data', (chunk) => {
      if (destination.write(chunk) === false) {
        this.pause();
        destination.once('drain', () => this.resume());
      }
    });
    this.on('end', () => destination.end());
    return destination;
  }

  // Chunks pushed before a listener is attached are replayed on a microtask so
  // that `on('data')` followed by `on('end')` sees both events.
  _schedule() {
    if (this._scheduled || !this._flowing) return;
    this._scheduled = true;
    queueMicrotask(() => {
      this._scheduled = false;
      this._drain();
    });
  }

  _drain() {
    while (this._flowing && this._buffer.length > 0) {
      this.emit('data', this._buffer.shift());
    }

    if (this._flowing && this._finished && !this._endEmitted) {
      this._endEmitted = true;
      this.emit('end');
    }
  }

  async *[Symbol.asyncIterator]() {
    const chunks = [];
    let ended = false;
    let notify = null;
    const wake = () => {
      const resolve = notify;
      notify = null;
      if (resolve) resolve();
    };

    this.on('data', (chunk) => {
      chunks.push(chunk);
      wake();
    });
    this.on('end', () => {
      ended = true;
      wake();
    });

    for (;;) {
      while (chunks.length > 0) yield chunks.shift();
      if (ended) return;
      await new Promise((resolve) => {
        notify = resolve;
      });
    }
  }
}

export default Readable;
