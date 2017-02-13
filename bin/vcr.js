#! /usr/bin/env node
var path = require('path');
var express = require('express');
var chalk = require('chalk');
var server = require('../lib/server').default;

var argv = require('yargs')
    .usage('Usage: \nyarn vcr -- --fixturesDir [./fixtures]')
    .help('h')
    .alias('h', 'help')

    .default('fixturesDir', './fixtures')
    .alias('f', 'fixturesDir')
    .describe('f', 'Directory where to load fixtures')
    .nargs('f', 1)

    .alias('p', 'proxy')
    .describe('p', 'URL to real API')
    .nargs('p', 1)

    .boolean('record')
    .alias('r', 'record')
    .describe('r', 'Record proxied responses to fixtures dir')

    .default('port', 8100)

    .example('-f ./fixtures -p https://ur.l/base -r', 'Load fixtures from directory, proxy not found fixtures to ur.l/base and success responses record back to fixtures directory')
    .argv;

var app = express();
var fixturesDir = path.join(process.cwd(), argv.fixturesDir);

app.use(server([fixturesDir], argv.proxy, argv.record && fixturesDir))
app.listen(argv.port, function(err) {
  if (err) {
    return console.error(err);
  }
  console.log(chalk.magenta('[Stub server]') +' listening at http://localhost:'+chalk.cyan(argv.port));
})
