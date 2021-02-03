import * as path from 'path';
import getFixtureVariant from './getFixtureVariant';
import {Request} from 'express';
import { IncomingMessage } from 'http';

export default function getFixturePath(req: Request, outputDir: string, proxyRes?: IncomingMessage): string {
  const variant = getFixtureVariant(req);
  const dirName = req.path.replace(/^\//, '');
  let ext = 'json';
  if ((proxyRes && proxyRes.headers && proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/plain')) || proxyRes && proxyRes.statusCode === 204)
    ext = 'txt';

  const fileName = `${req.method.toUpperCase()}.${variant}.${ext}`;

  return path.join(outputDir, dirName, fileName);
}
