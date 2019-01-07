import * as express from 'express';

const pipeMiddlewares = ([head, ...tail]: express.Handler[]) =>
    (req: express.Request, res: express.Response, next: express.NextFunction) => {
        if (!head) {
            // empty middlewares array
            return;
        }

        const nextMiddleware = (err?: Error) =>
            err ? next(err) : pipeMiddlewares(tail)(req, res, next);

        head(req, res, !tail.length ? next : nextMiddleware);
    };

export default pipeMiddlewares;
