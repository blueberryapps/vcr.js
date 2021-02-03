import * as chalk from 'chalk';
import * as fs from 'fs';

function requireUncached(mod: string): any {
    delete require.cache[require.resolve(mod)];
    return require(mod);
}

export default function loadFixture(filePath: string): any {
  let fixture;
  try {
    if (filePath.split('.').pop() === 'txt')
      return fs.readFileSync(filePath, 'utf8');

    fixture = requireUncached(filePath);
    if (fixture.default && typeof fixture.default === 'function') return fixture.default;
    return fixture;
  } catch (e) {
    console.error(`${chalk.magenta('[Stub server]')} ERROR in loadFixture: ${chalk.red(e.message)}`);
    console.error(e.stack);
    throw e;
  }
}
