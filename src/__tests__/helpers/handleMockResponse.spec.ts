import * as request from 'supertest';
import * as http from 'http';
import handleMockRequest, {HEADERS} from './handleMockRequest';

const realApiServer = http.createServer(handleMockRequest);

describe('Real api mock server', async () => {
  it('should respond with gzip encoding ', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set('accept-encoding', 'gzip')
      .expect(200)
      .expect('content-encoding', 'gzip')
      .then((res: request.Response) => {});
  });

  it('should respond with deflate encoding ', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set('accept-encoding', 'deflate')
      .expect(200)
      .expect('content-encoding', 'deflate')
      .then((res: request.Response) => {});
  });

  it('should respond with no encoding ', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set('accept-encoding', '')
      .expect(200)
      .expect('content-encoding', '')
      .then((res: request.Response) => {});
  });

  it('should return status specified by header', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set(HEADERS.STATUS, '401')
      .expect(401)
      .then((res: request.Response) => {
        expect(res.body.message).toBe('unauthorized');
      });
  });

  it('should return empty body for status 201', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set(HEADERS.STATUS, '201')
      .expect(201)
      .then((res: request.Response) => {
        expect(res.body).toBe('');
      });
  });

  it('should return body.message not found for status 404', async () => {
    await request.agent(realApiServer)
      .get('/mocked')
      .set(HEADERS.STATUS, '404')
      .expect(404)
      .then((res: request.Response) => {
        expect(res.body.message).toBe('not found');
      });
  });

  it('should mirror request body for POST', async () => {
    await request.agent(realApiServer)
      .post('/mocked')
      .send({ bodyProp: 42 })
      .set(HEADERS.STATUS, '200')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body).toEqual({bodyProp: 42});
      });
  });
});
