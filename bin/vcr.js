#! /usr/bin/env node
var path = require('path');
var express = require('express');
var chalk = require('chalk');
var server = require('../lib/server').default;
var canUsePort = require('../lib/canUsePort').default;

var DEFAULT_PORT = 8100;

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
    .implies('r', 'p')
    .describe('r', 'Record proxied responses to fixtures dir')

    .number('port')
    .default('port', DEFAULT_PORT)

    .example('-f ./fixtures -p https://ur.l/base -r', 'Load fixtures from directory, proxy not found fixtures to ur.l/base and success responses record back to fixtures directory')
    .argv;

var app = express();
var fixturesDir = path.join(process.cwd(), argv.fixturesDir);
var port = canUsePort(argv.port) ? argv.port : DEFAULT_PORT;

//this is a fix for azure systems
port = process.env.PORT || port;

app.use(server([fixturesDir], argv.proxy, argv.record && fixturesDir))
app.listen(port, '0.0.0.0', function(err) {
  if (err) {
    return console.error(err);
  }
  console.log(chalk.magenta('[Stub server]') +' listening at http://localhost:'+chalk.cyan(argv.port));
})
