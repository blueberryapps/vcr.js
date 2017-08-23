import * as chalk from 'chalk';
import * as request from 'request';
import createProxyRequestOptions from './createProxyRequestOptions';
import getFixturePath from './getFixturePath';
import getProxyResponseHeaders from './getProxyResponseHeaders';
import writeFixture from './writeFixture';
import {IncomingMessage} from 'http';
import {Request, Response, NextFunction, RequestHandler} from 'express';

export default (realApiBaseUrl: string, outputDir?: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/') return next();

    const apiReqURL = `${realApiBaseUrl}${req.originalUrl}`;

    // pipe request from stub server to real API
    req
      .pipe(request(apiReqURL, createProxyRequestOptions(req, realApiBaseUrl)))
      .on('error', (e: Error) => next(e))
      .on('response', (proxyRes: IncomingMessage) => {
        // response from real API, if not OK, pass control to next
        if (!proxyRes.statusCode || proxyRes.statusCode < 200 || proxyRes.statusCode >= 300) {
          console.log(`${chalk.magenta('[Stub server]')} proxy request to ${chalk.yellow(realApiBaseUrl + req.originalUrl)} ended up with ${chalk.red(`${proxyRes.statusCode}`)}`);
          return next();
        }

        // response from API is OK
        console.log(`${chalk.magenta('[Stub server]')} proxy request to ${chalk.yellow(realApiBaseUrl + req.originalUrl)} ended up with ${chalk.green(`${proxyRes.statusCode}`)} returning its response`);
        const headers = {...proxyRes.headers, ...getProxyResponseHeaders(req, apiReqURL, outputDir)};
        res.writeHead(proxyRes.statusCode || 500, headers);

        // pipe API response to client till the 'end'
        proxyRes.pipe(res);
        proxyRes.on('error', (e: Error) => {console.log('proxyRes.on error', e); next(e); });
        proxyRes.on('end', () => { res.end(); });

        // write response as fixture on the disc
        if (outputDir) {
          const fullPath = getFixturePath(req, outputDir);
          writeFixture(fullPath, proxyRes, next);
        }
      });
  };
