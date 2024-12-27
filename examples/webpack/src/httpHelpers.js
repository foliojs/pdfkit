function createFetchError(fileURL, error) {
  const result = new Error(`Fetching "${fileURL}" failed: ${error}`);
  result.name = 'FetchError';
  return result;
}

export function fetchFile(fileURL, { type = 'arraybuffer' } = {}) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('GET', fileURL, true);
    request.responseType = type;

    request.onload = function(e) {
      if (request.status === 200) {
        resolve(request.response);
      } else {
        reject(createFetchError(fileURL, request.statusText));
      }
    };

    request.onerror = error => reject(createFetchError(fileURL, error));

    request.send();
  });
}
