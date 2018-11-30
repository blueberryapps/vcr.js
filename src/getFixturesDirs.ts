import { Request } from 'express';

export default ({ cookies = {} }: Request, defaultDirs: string[]) => cookies.cassette ? [cookies.cassette] : defaultDirs;
