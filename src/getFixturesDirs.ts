import { Request } from 'express';

export default ({ cookies = {} }: Request, defaultDirs: string[]) => cookies.casette ? [cookies.casette] : defaultDirs;
