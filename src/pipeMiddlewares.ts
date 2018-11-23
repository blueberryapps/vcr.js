import * as express from 'express';

const pipeMiddlewares = (middlewares: express.Handler[]) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const [head, ...tail] = middlewares;
    head(req, res, tail.length ? () => pipeMiddlewares(tail)(req, res, next) : next);
};

export default pipeMiddlewares;
