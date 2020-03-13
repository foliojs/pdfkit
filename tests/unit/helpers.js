export function logData(doc) {
  const loggedData = [];
  const originalMethod = doc._write;
  doc._write = function(data) {
    loggedData.push(data);
    originalMethod.call(this, data);
  };
  return loggedData;
}
