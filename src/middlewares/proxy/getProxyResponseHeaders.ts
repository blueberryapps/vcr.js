import getFixturePath from './getFixturePath';
import {Request} from 'express';

export default function getProxyResponseHeaders(req: Request, apiReqURL: string, outputDir?: string) {
  const proxyHeaders = {
    'x-proxied-by': 'Stub server proxy middleware',
    'x-proxied-to': apiReqURL,
    'x-write-fixture-on-the-disc': !!outputDir ? 'ENABLED' : 'DISABLED',
  };

  if (!!outputDir)
    proxyHeaders['x-write-fixture-attempt-path'] = getFixturePath(req, outputDir);

  return proxyHeaders;
};
