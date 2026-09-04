import { zlibSync, unzlibSync } from 'fflate';

export default {
  deflateSync: (data) => zlibSync(data),
  inflateSync: (data) => unzlibSync(data),
};
