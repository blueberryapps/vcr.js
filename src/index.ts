import * as chalk from 'chalk';
import * as express from 'express';
import * as path from 'path';
import server from './server';

const app = express();
const PORT = process.env.PORT || 3000;

// const realApiUrl = 'https://js-developer-second-round.herokuapp.com/api/v1';

const options = {
  realApiBaseUrl: 'http://localhost:5000',
  outputDir: path.join(__dirname, 'generatedFixtures'),
  proxyFailedResponses: false,
};

app.use(server([path.join(__dirname, 'fixtures')], options));

app.listen(PORT, function(err: Error) {
  if (err) {
    return console.error(err);
  }

  console.log(`${chalk.magenta('[Stub server]')} listening at http://localhost:${chalk.cyan(PORT)}/`);
});

export default app;
