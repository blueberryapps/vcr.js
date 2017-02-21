import * as url from 'url';
import * as path from 'path';
import {CoreOptions} from 'request';
import {Request} from 'express';

const allowedEncodings = ['deflate', 'gzip'];

export default function createProxyRequestOptions(req: Request, realApiBaseUrl: string): CoreOptions {
  // create options for request to real API
  const uri = url.parse(realApiBaseUrl, true);
  const options = {
    ...uri,
    method: req.method,
    rejectUnauthorized: false,
    requestCert: false,
    path: path.join(uri.path as string, req.url),
    headers: req.headers,
    port: parseInt(uri.port || '', 10) || undefined,
  };
  delete options.headers['host']; // tslint:disable-line:no-string-literal

  const givenEncodings = `${options.headers['accept-encoding']}`.split(',').map(x => x.trim()); // tslint:disable-line:no-string-literal
  options.headers['accept-encoding'] = allowedEncodings.filter(e => givenEncodings.indexOf(e) !== -1)[0];

  return (options as CoreOptions);
}
