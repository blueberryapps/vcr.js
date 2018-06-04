import * as zlib from 'zlib';
import * as Stream from 'stream';
import * as through from 'through';
import {Request, Response} from 'express';

export const STATUS_TO_RESPONSE = {
  '201': null,
  '401': { message: 'unauthorized' },
  '404': { message: 'not found' },
  '500': { message: 'internal server error' },
  DEFAULT: {
    message: 'success',
    info: 'From simple JSON server with encoding!',
    answer: 42,
  }
};

// append request headers to affect returned stub
export const HEADERS = {
  STATUS: 'x-stub-status', // affects response status code
};

const getJson$ = (statusCode: number): Stream.Readable => {
  const status = statusCode.toString();
  const body = status in STATUS_TO_RESPONSE ? STATUS_TO_RESPONSE[status] : STATUS_TO_RESPONSE.DEFAULT;
  const json$ = new Stream.Readable;

  if (!!body) json$.push(JSON.stringify(body));

  json$.push(null);
  // json$.pipe(process.stdout);

  return json$;
};
const parseEncoding = (acceptEncodingHeader: string = ''): {encoding: string, encoder: Stream.Transform} => {
  const matched = acceptEncodingHeader.match(/(gzip)|(deflate)/);
  const encoding = matched && matched[0] || '';
  const encoder: Stream.Transform = {
    'gzip':    zlib.createGzip(),
    'deflate': zlib.createDeflate(),
  }[encoding] || through();

  return {encoding, encoder};
};

const assembleHeaders = (encoding: string) => {
  return {
    'Content-Type': 'application/json',
    'content-encoding': encoding
  };
};

export default async function(req: Request, res: Response) {
  const statusCode = parseInt(req.headers[HEADERS.STATUS], 10) || 200;

  if (req.method === 'POST') {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    req.pipe(res);
  } else {
    const { encoder, encoding } = parseEncoding(req.headers['accept-encoding']);
    const json$ = getJson$(statusCode);
    const encoded$: Stream.Transform = json$.pipe(encoder);

    res.writeHead(statusCode, assembleHeaders(encoding));
    encoded$.pipe(res);
  }
  // encoded$.pipe(process.stdout);
}
