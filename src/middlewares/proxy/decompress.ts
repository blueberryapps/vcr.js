import * as through from 'through';
import * as zlib from 'zlib';
// import jsf from 'json-stream-formatter';

import {Transform} from 'stream';

const decompress = (encoding: string): Transform => {
  switch (encoding) {
    // or, just use zlib.createUnzip() to handle both cases
    case 'gzip':    return zlib.createGunzip();
    case 'deflate': return zlib.createInflate();
    default: return through();
  }
};

export const prettyPrint = (contentType: string): Transform => {
  switch (contentType) {
    // or, just use zlib.createUnzip() to handle both cases
    // case 'application/json': return jsf.prettyPrint();
    default: return through();
  }
};

export default decompress;
