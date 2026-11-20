import { zlibSync } from 'fflate';

export default {
  deflateSync: (data) => zlibSync(data),
};
