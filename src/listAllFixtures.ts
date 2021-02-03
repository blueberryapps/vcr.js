import * as fs from 'fs';
import * as path from 'path';

export interface FixturesMap {[key: string]: string; };

const SUPPORTED_METHODS = new Set(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);

const isDir = (dir: string): boolean => {
  try {
    if (fs.statSync(dir).isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

// List all files in a directory in Node.js recursively in a synchronous fashion
const walkSync = function(dir: string, filelist: string[] = []): string[] {
  if (!isDir(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  files.forEach((file: string) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      filelist = walkSync(filePath, filelist);
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
};

const isFixture = (absolutePath: string): boolean => {
  const extensionSupported = /\.(js|json|txt)$/.test(absolutePath);

  const fixtureMethod = path.basename(absolutePath).split('.')[0].toUpperCase();
  const methodSupported = SUPPORTED_METHODS.has(fixtureMethod);

  return extensionSupported && methodSupported;
};

export const listDirectoryFixtures = (basePath: string): FixturesMap =>
 walkSync(basePath)
  .filter(isFixture)
  .reduce((acc, absolute) => ({...acc, [path.relative(basePath, absolute).replace(/\\/g, '/')]: absolute}), {});

const listAllFixtures = (dirs: string | string[]): FixturesMap =>
  ([] as string[]).concat(dirs)
    .reduce((acc, dir) => ({...acc, ...listDirectoryFixtures(dir)}), {});

export default listAllFixtures;
