import exifr from 'exifr'
import zlib from 'zlib';
async function getICC(input){
  const exr = new exifr.Exifr({icc: {multiSegment: true}, mergeOutput: false, silentErrors: true});
  let _input=input;
  if(input instanceof Buffer && !(input instanceof Uint8Array)) _input=new Uint8Array(input);
  await exr.read(_input);
  let output=await exr.parse();
  if(!output.icc)return;
  const result={data:output.icc};
  let segments=[]
  if(exr.fileParser.appSegments)segments.push(...exr.fileParser.appSegments);//JPEG
  if(exr.fileParser.metaChunks)segments.push(...exr.fileParser.metaChunks);//PNG
  let icc=[];
  for (let segment of segments) {
    if(segment.type=='icc'){//JPEG
      icc.push(input.slice(segment.offset+18, segment.end));
    }else if(segment.type=='iccp'){//PNG
      let {chunk} = segment;
      let chunkHead = chunk.getUint8Array(0, 81);
      // icc profile has variable length (up to 80B) followed by null terminator.
      let nameLength = 0;
      // Get length of the profile name by looking for the null terminator.
      while (nameLength < 80 && chunkHead[nameLength] !== 0) nameLength++;
      // Recalculate actual ICC data position.
      let iccpHeaderLength = nameLength + 2 // 1 byte null terminator, + 1 byte compression
      // ICC data is zlib compressed by default. Spec doesn't even allow raw data.
      let dataChunk = chunk.getUint8Array(iccpHeaderLength);
      dataChunk = zlib.inflateSync(dataChunk);
      result.buffer=icc.push(dataChunk);
    }
  }
  result.buffer=Buffer.concat(icc);
  if(icc.length==0 || !result.buffer)return;
  return result;
}
export {getICC}