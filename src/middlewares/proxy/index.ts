import * as chalk from 'chalk';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { IncomingMessage } from 'http';
import * as request from 'request';
import getFixturesDirs from '../../getFixturesDirs';
import createProxyRequestOptions from './createProxyRequestOptions';
import getFixturePath from './getFixturePath';
import getProxyResponseHeaders from './getProxyResponseHeaders';
import writeFixture from './writeFixture';

export default (realApiBaseUrl: string, outputDir?: string): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/') return next();

    const apiReqURL = `${realApiBaseUrl}${req.originalUrl}`;
    const outputCassette = getFixturesDirs(req, outputDir ? [outputDir] : [])[0];

    // pipe request from stub server to real API
    req
      .pipe(request(apiReqURL, createProxyRequestOptions(req, realApiBaseUrl)))
      .on('error', (e: Error) => next(e))
      .on('response', (proxyRes: IncomingMessage) => {
        // response from real API, if not OK, pass control to next
        if (!proxyRes.statusCode || proxyRes.statusCode < 200 || proxyRes.statusCode >= 300) {
          console.log(`${chalk.magenta('[Stub server]')} proxy request to ${chalk.yellow(realApiBaseUrl + req.originalUrl)} ended up with ${chalk.red(`${proxyRes.statusCode}`)}`);
          // console.log(`${chalk.magenta('[Stub server]')} request headers: ${JSON.stringify(req.headers, null, 2)}`);
          // console.log(`${chalk.magenta('[Stub server]')} response headers: ${JSON.stringify(proxyRes.headers, null, 2)}`);
          return next();
        }
          // console.log(`${chalk.blue('[Stub server]')} request headers: ${JSON.stringify(req.headers, null, 2)}`);
          // console.log(`${chalk.blue('[Stub server]')} response status: ${proxyRes.statusCode} headers: ${JSON.stringify(proxyRes.headers, null, 2)}`);

        // response from API is OK
        console.log(`${chalk.magenta('[Stub server]')} proxy request to ${chalk.yellow(realApiBaseUrl + req.originalUrl)} ended up with ${chalk.green(`${proxyRes.statusCode}`)} returning its response`);
        const headers = {...proxyRes.headers, ...getProxyResponseHeaders(req, apiReqURL, outputCassette)};
        res.writeHead(proxyRes.statusCode || 500, headers);

        // pipe API response to client till the 'end'
        proxyRes.pipe(res);
        proxyRes.on('error', (e: Error) => {console.log('proxyRes.on error', e); next(e); });
        proxyRes.on('end', () => { res.end(); });

        // write response as fixture on the disc
        if (outputCassette) {
          const fullPath = getFixturePath(req, outputCassette, proxyRes);
          writeFixture(fullPath, proxyRes, next);
        }
      });
  };
