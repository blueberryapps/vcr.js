import {Request, Response, NextFunction} from 'express';

export default function (req: Request, res: Response, next: NextFunction): void {
  if (req.params.id === 'returnError') {
    throw new Error('Something went wrong in fixture');
  }
  res.json({id: req.params.id});
}
