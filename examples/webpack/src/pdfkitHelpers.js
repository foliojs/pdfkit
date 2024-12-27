export const waitForData = async doc => {
  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const pdfBase64 = pdfBuffer.toString('base64');
      resolve(`data:application/pdf;base64,${pdfBase64}`);
    });
    doc.on('error', reject);
  });
};
