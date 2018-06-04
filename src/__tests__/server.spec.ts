import * as request from 'supertest';
import server from '../server';
import * as path from 'path';
import listAllFixtures from '../listAllFixtures';
import { emptyDirSync } from 'fs-extra';
import { spawn, ChildProcess } from 'child_process';
import * as BluebirdPromise from 'bluebird';
import kill from './helpers/killProcessTree';

let mockServer: ChildProcess;

beforeAll(async () => {
  if (mockServer) return;
  mockServer = spawn('yarn', ['ts-node', '--', 'src/__tests__/helpers/server.ts'], { stdio: [0, 1, 2] });
  console.log('Started mock server process, PID: ', mockServer.pid);
  await BluebirdPromise.delay(3000);
});

afterAll(async () => {
  console.log('Stopping mock server process, PID: ', mockServer.pid);
  kill(mockServer.pid, 'SIGKILL');
  await BluebirdPromise.delay(1000);
});

describe('Stub server', () => {
  const app = server([path.join(__dirname, 'fixtures')], 'https://jsonplaceholder.typicode.com');

  it('should respond with index', async () =>
    await request(app)
      .get('/')
      .expect(404)
      .then((res: request.Response) =>
        expect(res.body.message).toEqual('STUB SERVER: Sorry but we couldn\'t find any fixture by GET /')
      )
  );

  it('should respond with list of possible endpoints', async () =>
    await request(app)
      .get('/')
      .expect(404)
      .then((res: request.Response) => {
        expect(res.body.endpoints).toEqual([
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites/1',
            method: 'GET',
            variants: {
              default: path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/1/GET.default.json')
            }
          },
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites',
            method: 'GET',
            variants: {
              'page=5&size=10': path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/GET.page=5&size=10.json'),
            }
          },
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites/{id}',
            method: 'GET',
            variants: {
              default: path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/{id}/GET.default.js')
            }
          },
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dtm/events',
            method: 'GET',
            variants: {
              default: path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dtm/events/GET.default.json')
            }
          }

        ]);
      })
  );

  it('should respond with empty list matched endpoints when nothing found', async () =>
    await request(app)
      .get('/nonexistingEndpoint')
      .expect(404)
      .then((res: request.Response) => {
        expect(res.body.matchedEndpoints).toEqual([]);
      })
  );

  it('should respond with list of matched endpoints for existing ones', async () =>
    await request(app)
      .get('/cnx-gbl-org-quality/qa/v1/dm/jobsites')
      .expect(404)
      .then((res: request.Response) => {
        expect(res.body.matchedEndpoints).toEqual([
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites/1',
            method: 'GET',
            variants: {
              default: path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/1/GET.default.json')
            }
          },
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites',
            method: 'GET',
            variants: {
              'page=5&size=10': path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/GET.page=5&size=10.json'),
            }
          },
          {
            endpoint: '/cnx-gbl-org-quality/qa/v1/dm/jobsites/{id}',
            method: 'GET',
            variants: {
              default: path.join(__dirname, 'fixtures/cnx-gbl-org-quality/qa/v1/dm/jobsites/{id}/GET.default.js')
            }
          },
        ]);
      })
  );

  it('should return default fixture', async () => {
    await request(app)
      .get('/cnx-gbl-org-quality/qa/v1/dm/jobsites/10')
      .expect(200)
      .then((res: request.Response) => expect(res.body).toEqual({ id: '10' }));
  });

  it('should return fixture based on url params', async () => {
    await request(app)
      .get('/cnx-gbl-org-quality/qa/v1/dm/jobsites?size=10&page=5')
      .expect(200)
      .then((res: request.Response) => expect(res.body).toEqual({ jobsites: [{ id: 1 }, { id: 2 }, { id: 3 }] }));
  });

  it('should return error when error in fixture', async () => {
    await request(app)
      .get('/cnx-gbl-org-quality/qa/v1/dm/jobsites/returnError')
      .expect(500)
      .then((res: request.Response) =>
        expect(res.body.error.message).toEqual('Something went wrong in fixture')
      );
  });

  it('should return all setted variants', async () => {
    await request.agent(app)
      .get('/variants')
      .set('Cookie', 'variants=/foo/bar/GET.unauthorized')
      .expect(200)
      .then((res: request.Response) =>
        expect(res.body.variants).toEqual(['/foo/bar/GET.unauthorized'])
      );
  });

  it('should return all possible variants', async () => {
    await request(app)
      .get('/variants')
      .expect(200)
      .then((res: request.Response) =>
        expect(res.body.possibleVariants).toEqual([
          '/cnx-gbl-org-quality/qa/v1/dm/jobsites/1/GET.default',
          '/cnx-gbl-org-quality/qa/v1/dm/jobsites/GET.page=5&size=10',
          '/cnx-gbl-org-quality/qa/v1/dm/jobsites/{id}/GET.default',
          '/cnx-gbl-org-quality/qa/v1/dtm/events/GET.default'
        ])
      );
  });

  it('should add variant to cookie by calling variants endpoint', async () => {
    await request.agent(app)
      .get('/variants?add=/fooBar/GET.blacklisted')
      .set('Cookie', 'variants=/foo/bar/GET.unauthorized')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body.variants).toEqual(['/foo/bar/GET.unauthorized', '/fooBar/GET.blacklisted']);
        expect(res.header['set-cookie'][0]).toEqual(`variants=/foo/bar/GET.unauthorized,/fooBar/GET.blacklisted; Path=/`);
      });
  });

  it('should clear variants in cookie by calling variants endpoint with clear flag', async () => {
    await request.agent(app)
      .get('/variants?clear=t')
      .set('Cookie', 'variants=/foo/bar/GET.unauthorized')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body.variants).toEqual([]);
        expect(res.header['set-cookie'][0]).toEqual(`variants=; Path=/`);
      });
  });

  it('should overwrite variants cookie by calling variants endpoint', async () => {
    await request.agent(app)
      .get('/variants?set=/fooBar/GET.blacklisted,/foo/GET.blacklisted')
      .set('Cookie', 'variants=/foo/bar/GET.unauthorized')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body.variants).toEqual(['/fooBar/GET.blacklisted', '/foo/GET.blacklisted']);
        expect(res.header['set-cookie'][0]).toEqual(`variants=/fooBar/GET.blacklisted,/foo/GET.blacklisted; Path=/`);
      });
  });

  it('should remove duplicate variants when adding new', async () => {
    await request.agent(app)
      .get('/variants?add=/fooBar/GET.unauthorized')
      .set('Cookie', 'variants=/fooBar/GET.blacklisted,/foo/bar/GET.unauthorized')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body.variants).toEqual(['/foo/bar/GET.unauthorized', '/fooBar/GET.unauthorized']);
        expect(res.header['set-cookie'][0]).toEqual(`variants=/foo/bar/GET.unauthorized,/fooBar/GET.unauthorized; Path=/`);

      });
  });

  it('should pass GET not matched request by proxy real api', async () => {
    await request.agent(app)
      .get('/users')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.body.length).toEqual(10); // should return 10 users
        expect(res.body[0].id).toEqual(1); // should return id 1 for first user
        expect(res.body[0].username).toEqual('Bret'); // should return id 1 for first user
      });
  });
});

describe('Stub server in proxy mode', async () => {
  const outputFixturesDir = path.join(__dirname, 'generatedFixtures');
  const fixtureDirs = [path.join(__dirname, 'fixtures')];

  beforeEach(() => {
    // console.log('=======', listAllFixtures(outputFixturesDir));
    emptyDirSync(outputFixturesDir);
  });

  afterEach(() => {
    emptyDirSync(outputFixturesDir);
  });

  it('should proxy requests and keep correct encoding - gzip', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);
    await request.agent(appserver)
      .get('/mocked')
      .set('accept-encoding', 'gzip')
      .expect(200)
      .expect('content-encoding', 'gzip')
      .then((res: request.Response) => { });
  });

  it('should proxy requests and keep correct encoding - deflate', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);
    await request.agent(appserver)
      .get('/mocked')
      .set('accept-encoding', 'deflate')
      .expect(200)
      .expect('content-encoding', 'deflate')
      .then((res: request.Response) => { });
  });

  it('should proxy requests and keep correct encoding - gzip, deflate', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);
    await request.agent(appserver)
      .get('/mocked')
      .set('accept-encoding', 'deflate, gzip')
      .expect(200)
      .expect('content-encoding', 'deflate')
      .then((res: request.Response) => { });
  });

  it('should save correctly decoded fixture to fixturePath ', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);

    await request.agent(appserver)
      .get('/mocked')
      .expect(200)
      .then((res: request.Response) => {
        const fixturesMap = listAllFixtures(outputFixturesDir);
        expect(Object.keys(fixturesMap).length).toBe(1);

        const fixtureName = Object.keys(fixturesMap)[0];
        const fixturePath = fixturesMap[fixtureName];
        const fixture = require(fixturePath);
        expect(fixtureName.search(/mocked/) > -1).toBeTruthy();
        expect(fixture.answer).toBe(42);
      });
  });

  it('should proxy and save custom variant when cookie record_fixture_variant is set but default fixture is present', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);

    await request.agent(appserver)
      .get('/mocked')
      .expect(200)
      .then((res: request.Response) => {
        const fixturesMap = listAllFixtures(outputFixturesDir);
        expect(Object.keys(fixturesMap).length).toBe(1);

        const fixtureName = Object.keys(fixturesMap)[0];
        const fixturePath = fixturesMap[fixtureName];
        const fixture = require(fixturePath);
        expect(fixtureName.search(/default/) > -1).toBeTruthy();
        expect(fixture.answer).toBe(42);
      });

    await request.agent(appserver)
      .get('/mocked')
      .set('Cookie', 'record_fixture_variant=someVariant')
      .expect(200)
      .then((res: request.Response) => {
        const fixturesMap = listAllFixtures(outputFixturesDir);
        expect(Object.keys(fixturesMap).length).toBe(2);

        const fixtureName = Object.keys(fixturesMap)[1];
        const fixturePath = fixturesMap[fixtureName];
        const fixture = require(fixturePath);
        expect(fixtureName.search(/someVariant/) > -1).toBeTruthy();
        expect(fixture.answer).toBe(42);
      });
  });

  it('should proxy and save variant derived from request query when no variant specified in cookie', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);

    await request.agent(appserver)
      .get('/mocked?size=10&page=3')
      .expect(200)
      .then((res: request.Response) => {
        const fixturesMap = listAllFixtures(outputFixturesDir);
        expect(Object.keys(fixturesMap).length).toBe(1);

        const fixtureName = Object.keys(fixturesMap)[0];
        const fixturePath = fixturesMap[fixtureName];
        const fixture = require(fixturePath);
        expect(fixtureName.search(/page=3&size=10/) > -1).toBeTruthy();
        expect(fixture.answer).toBe(42);
      });
  });

  it('should proxy requests and keep query params', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);
    await request.agent(appserver)
      .get('/mocked?query=1')
      .expect(200)
      .then((res: request.Response) => {
        expect(res.header['x-proxied-to']).toBe('http://localhost:5000/mocked?query=1');
      });
  });

  it('should save correctly decoded fixture to fixturePath for POST request ', async () => {
    const appserver = server(fixtureDirs, 'http://localhost:5000', outputFixturesDir);

    await request.agent(appserver)
      .post('/mocked')
      .send({ bodyProp: 42 })
      .expect(200)
      .then((res: request.Response) => {
        const fixturesMap = listAllFixtures(outputFixturesDir);
        expect(Object.keys(fixturesMap).length).toBe(1);

        const fixtureName = Object.keys(fixturesMap)[0];
        const fixturePath = fixturesMap[fixtureName];
        const fixture = require(fixturePath);
        expect(fixtureName.search(/POST/) > -1).toBeTruthy();
        expect(fixture.bodyProp).toBe(42);
      });
  });

});
