import * as chalk from 'chalk';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import * as cors from 'cors';
import * as morgan from 'morgan';
import listAllFixtures from './listAllFixtures';
import loadFixture from './loadFixture';
import proxyMiddleware from './middlewares/proxy';
import {cleanupVariantsConflicts} from './variants';
import {Endpoint, extractEndpoints} from './endpoints';
import {findEndpoint, findFixture, extract, extractVariantsFromRequest} from './matcher';
import {Request, Response, NextFunction} from 'express';

interface Options {
  realApiBaseUrl?: string;
  outputDir?: string;
  proxyFailedResponses?: boolean;
}

export default (fixtureDirs: string[] = [], { realApiBaseUrl, outputDir, proxyFailedResponses }: Options = {}) => {
  const app = express();
  app.use((req, res, next) => {
    // needed for ajax requests from app - fetch init.credentials must be set to pass cookies with ajax
    // without following cors setup client blocks response
    cors({origin: req.get('Origin'), credentials: true})(req, res, next);
  });
  app.use(cookieParser());
  app.use(morgan(`${chalk.magenta('[Stub server]')} ${chalk.green(':method')} :url ${chalk.magenta(':status')} ${chalk.cyan(':response-time ms')} HTTP/:http-version :date[iso]`));

  console.log(`${chalk.magenta('[Stub server]')} looking for fixtures in:`);
  console.log(chalk.yellow(fixtureDirs.join(',')));
  console.log(`${chalk.magenta('[Stub server]')} found fixtures:`);
  console.log(extractEndpoints(listAllFixtures(fixtureDirs)).map(e =>
      `${chalk.green(e.method)} ${e.endpoint} { ${chalk.yellow(Object.keys(e.variants).join(', '))} }`
    ).join('\n')
  );

  if (realApiBaseUrl) {
    console.log(`${chalk.magenta('[Stub server]')} not found fixtures are handled by:`);
    console.log(chalk.yellow(realApiBaseUrl));
    if (outputDir) {
      console.log(`${chalk.magenta('[Stub server]')} resolved fixtures from proxy will be saved to:`);
      console.log(chalk.yellow(outputDir));
    }
  }

  // Variants handler
  app.get('/variants', (req: Request, res: Response, next: NextFunction): void => {
    let variants = extractVariantsFromRequest(req);

    if (req.query.set)
      variants = req.query.set.split(',');
    else if (req.query.add)
      variants = cleanupVariantsConflicts(variants.concat(req.query.add.split(',')));
    else if (req.query.clear)
      variants = [];
    res
      .cookie('variants', variants.join(','))
      .json({
        variants,
        possibleVariants: extractEndpoints(listAllFixtures(fixtureDirs)).reduce((acc: string[], endpoint: Endpoint) =>
          acc.concat(
            Object.keys(endpoint.variants).map(variant => `${endpoint.endpoint}/${endpoint.method}.${variant}`)
          )
        ,                                                                       [])
      });
  });

  // Resolve fixture
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const endpoints = extractEndpoints(listAllFixtures(fixtureDirs));
    const foundEndpoint = findEndpoint(endpoints, req);
    const foundFixturePath = foundEndpoint && findFixture(req, foundEndpoint);

    if (foundEndpoint && foundFixturePath) {
      const fixture = loadFixture(foundFixturePath);
      req.params = { ...req.params, ...extract(foundEndpoint.endpoint, req.path)};
      console.log(`${chalk.magenta('[Stub server]')} using fixture from ${chalk.yellow(foundFixturePath)}`);
      typeof fixture === 'function' ? fixture(req, res, next) : res.json(fixture);
    } else {
      next();
    }
  });

  // Proxy to real API
  if (realApiBaseUrl) {
    app.use(proxyMiddleware(realApiBaseUrl, outputDir, proxyFailedResponses));
  }

  // Fallback path for displaying all possible endpoints
  app.use((req: Request, res: Response, next: NextFunction): void => {
    const endpoints = extractEndpoints(listAllFixtures(fixtureDirs));
    const matchedEndpoints = endpoints.filter(e => e.method === req.method && e.endpoint.indexOf(req.path) > -1);

    res.status(404).json({
      message: `STUB SERVER: Sorry but we couldn't find any fixture by ${req.method} ${req.path}`,
      matchedEndpoints,
      endpoints,
      proxyTo: realApiBaseUrl,
      outputDirForProxied: outputDir,
      usingVariantsFromCookie: extractVariantsFromRequest(req),
    });
  });

  // Error handler
  app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(error);
    res.status(500);
    res.json({
      request: {
        path: req.path,
        params: req.params,
        query: req.query,
        method: req.method,
        cookies: req.cookies,
      },
      error: {
        message: error.message || error,
        stack: `${error.stack}`.split('\n')
      }
    });
  });

  return app;
};
