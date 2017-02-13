import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import decompress from './decompress';
import {IncomingMessage} from 'http';
import {NextFunction} from 'express';

// const outputPath = path.join(outputDir, req.path);
export default function writeFixture(fullPath: string, proxyRes: IncomingMessage, next: NextFunction) {
  console.log(`${chalk.magenta('[Stub server]')} Writing fixture to: ${fullPath}`);
  try {
    // fs.accessSync(fullPath, 'wx')
    if (fs.existsSync(fullPath))
      return next(Error(`[Stub server] Can not write fixture, file exists: ${fullPath}`));

    fs.mkdirpSync(path.dirname(fullPath));
    const write$ = fs.createWriteStream(fullPath);
    write$.on('error', (e: Error) => {console.log('write$ error'); next(e); });
    // write$.on('close', () => {console.log('write$ close')})

    proxyRes
      .pipe(decompress(proxyRes.headers['content-encoding']))
      .pipe(write$);

  } catch (e) {
    console.error(`[Stub server] fixture from api NOT written at path ${fullPath}`);
    next(e);
  }
}
