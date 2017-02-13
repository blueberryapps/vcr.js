import * as chalk from 'chalk';

function requireUncached(mod: string): any {
    delete require.cache[require.resolve(mod)];
    return require(mod);
}

export default function loadFixture(filePath: string): any {
  let fixture;
  try {
    fixture = requireUncached(filePath);
    if (fixture.default && typeof fixture.default === 'function') return fixture.default;
    return fixture;
  } catch (e) {
    console.error(`${chalk.magenta('[Stub server]')} ERROR in loadFixture: ${chalk.red(e.message)}`);
    console.error(e.stack);
    throw e;
  }
}
