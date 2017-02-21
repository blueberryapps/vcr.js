import * as url from 'url';
import * as path from 'path';
import {CoreOptions} from 'request';
import {Request} from 'express';

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
  delete options.headers['accept-encoding']; // tslint:disable-line:no-string-literal

  return (options as CoreOptions);
}
