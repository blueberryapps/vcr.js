import * as chalk from 'chalk';
import {Request, Response, NextFunction, RequestHandler} from 'express';

export default (): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    if (req.path === '/') return next();

    if (true) {
        const timeout = 1000;
        console.log(`${chalk.magenta('[Stub server]')} Delay middleware is waiting for ${chalk.yellow(timeout + '')}ms on path ${req.path}`);
        setTimeout(() => {
            console.log(`${chalk.magenta('[Stub server]')} Delay middleware finished waiting ${chalk.yellow(timeout + '')}ms on path ${req.path}`);
            next()
        }, timeout);
    }
  }
