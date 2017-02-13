import * as through from 'through';
import * as zlib from 'zlib';
import {Transform} from 'stream';

const decompress = (encoding: string): Transform => {
  switch (encoding) {
    // or, just use zlib.createUnzip() to handle both cases
    case 'gzip':    return zlib.createGunzip();
    case 'deflate': return zlib.createInflate();
    default: return through();
  }
};

export default decompress;
