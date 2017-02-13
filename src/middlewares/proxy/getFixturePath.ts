import * as path from 'path';
import getFixtureVariant from './getFixtureVariant';
import {Request} from 'express';

export default function getFixturePath(req: Request, outputDir: string): string {
  const variant = getFixtureVariant(req);
  const dirName = req.path.replace(/^\//, '');
  const fileName = `${req.method.toUpperCase()}.${variant}.json`;

  return path.join(outputDir, dirName, fileName);
}
