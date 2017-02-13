import * as express from 'express';
import handleMockRequest from './handleMockRequest';
const app = express();

app.use(handleMockRequest);

app.listen(5000, function(err: Error) {
  if (err) {
    return console.error(err);
  }

  console.log(`listening at http://localhost:5000/`);
});

export default app;
