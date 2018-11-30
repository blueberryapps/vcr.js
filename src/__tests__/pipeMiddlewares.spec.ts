import pipeMiddlewares from '../pipeMiddlewares';
import * as express from 'express';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const middlewareMock = (req: any, res: any, nextFn: any) => nextFn();

describe('pipeMiddlewares', () => {
    it('should do nothing when called without middlewares', () => {
        const req = {} as express.Request;
        const res = {} as express.Response;
        const next = jest.fn() as express.NextFunction;
        expect(() => pipeMiddlewares([])(req, res, next)).not.toThrow();
    });

    it('with one middleware should call it with provided handler arguments', () => {
        const req = {} as express.Request;
        const res = {} as express.Response;
        const next = jest.fn() as express.NextFunction;
        const m1 = jest.fn();
        pipeMiddlewares([m1])(req, res, next);

        expect(m1).toBeCalledWith(req, res, next);
    });

    it('should call last middleware with provided handler arguments', () => {
        const req = {} as express.Request;
        const res = {} as express.Response;
        const next = jest.fn() as express.NextFunction;
        const m1 = jest.fn(middlewareMock);
        const m2 = jest.fn(middlewareMock);
        pipeMiddlewares([m1, m2])(req, res, next);

        expect(m2).toBeCalledWith(req, res, next);
    });

    it('should call middlewares sequentially', () => new Promise((resolve) => {
        const stack: number[] = [];
        const createStubMiddleware = (ms: number) => jest.fn(async (rq, rs, nextFn) => {
            await delay(ms);
            stack.push(ms);
            nextFn();
        });
        const m1 = createStubMiddleware(150);
        const m2 = createStubMiddleware(100);
        const m3 = createStubMiddleware(50);

        pipeMiddlewares([m1, m2, m3])({} as express.Request, {} as express.Response, () => {
            expect(stack).toEqual([150, 100, 50]);
            resolve();
        });
    }));

    it('should call next with error when occured', () => {
        const error = new Error('First middleware errored');
        const next = jest.fn() as express.NextFunction;
        const m1 = jest.fn((_, __, m1Next) => m1Next(error));
        const m2 = jest.fn(middlewareMock);
        pipeMiddlewares([m1, m2])({} as express.Request, {} as express.Response, next);

        expect(m2).not.toBeCalled();
        expect(next).toBeCalledWith(error);
    });
});
 