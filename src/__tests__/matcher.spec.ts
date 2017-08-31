import matcher, { extract, findEndpoint, findFixture, extractVariant } from '../matcher';
import { Endpoint } from '../endpoints';
import { Request } from 'express';

interface TestCase {
  [key: string]: string[];
}

const testCasesMatches: TestCase = {
  '/jobs/{id}': [
    '/jobs/foo',
    '/jobs/100',
    '/jobs/0',
  ],
  '/jobs/{id}/site': [
    '/jobs/foo/site',
    '/jobs/100/site',
    '/jobs/0/site',
  ],
  '/jobs/1/site': [
    '/jobs/1/site',
  ]
};

const testCasesNotMatches: TestCase = {
  '/jobs/{id}': [
    '/jobs/foo/sites',
    '/jobs/100/sites',
    '/jobs/0/sites',
    '/v2/jobs/0/sites',
    '/v2/jobs/0',
  ],
  '/jobs/{id}/site': [
    '/jobs/foo/sites',
    '/v2/jobs/0/site',
  ],
  '/jobs/1/site': [
    '/v2/jobs/1/site',
    '/jobs/1/sites',
  ]
};

const truthyWithMessage = (test: boolean, message: string): void => {
  if (!test) console.error(message);
  expect(test).toEqual(true);
};

it('matcher matches request urls', () => {
  Object.keys(testCasesMatches).map(pattern =>
    testCasesMatches[pattern].map(reqPath =>
      truthyWithMessage(matcher(pattern, reqPath), `Should Match: ${pattern} === ${reqPath}`)
    )
  );
});

it('matcher does not match request urls', () => {
  Object.keys(testCasesNotMatches).map(pattern =>
    testCasesNotMatches[pattern].map(reqPath =>
      truthyWithMessage(!matcher(pattern, reqPath), `Should Not Match: ${pattern} === ${reqPath}`)
    )
  );
});

it('extracts params from path', () => {
  expect(extract('/jobs/{id}/site', '/jobs/100/site')).toEqual({ id: '100' });
  expect(extract('/jobs/{id}/site/{siteId}', '/jobs/101/site/3d')).toEqual({ id: '101', siteId: '3d' });
  expect(extract('/jobs/{id}/site/{id}', '/jobs/100/site/123')).toEqual({ id: '123' });
  expect(extract('/jobs/site', '/jobs/site')).toEqual({ });
});

const endpoints = [
  {
    'endpoint': '/foo/1',
    'method': 'GET',
    'variants': {
      'default': '/absolutePat/foo/1/GET.default.json',
      'param1=foo&param2=bar': '/absolutePat/foo/1/GET.param1=foo&param2=bar.json',
      'unathorized': '/absolutePat/foo/1/GET.unathorized.json'
    }
  },
  {
    'endpoint': '/foo/{id}',
    'method': 'GET',
    'variants': {
      'default': '/absolutePat/foo/{id}/GET.default.json'
    }
  },
  {
    'endpoint': '/foo/1',
    'method': 'POST',
    'variants': {
      'default': '/absolutePat/foo/1/POST.default.json'
    }
  }
];

const findTestFixture = (allEndpoints: Endpoint[], request: Request): string | null => {
  return findFixture(request, findEndpoint(allEndpoints, request));
};
it('should return fixture path for request', () => {
  expect(findTestFixture(endpoints, {path: '/foo/1', method: 'GET'} as Request)).toBe('/absolutePat/foo/1/GET.default.json');
});

it('should return fixture path for request with query', () => {
  expect(findTestFixture(endpoints, {path: '/foo/1', query: { param2: 'bar', param1: 'foo' }, method: 'GET'} as Request)).toBe('/absolutePat/foo/1/GET.param1=foo&param2=bar.json');
});

it('should return fixture path for request with dynamic path', () => {
  expect(findTestFixture(endpoints, {path: '/foo/10', method: 'GET'} as Request)).toBe('/absolutePat/foo/{id}/GET.default.json');
});

it('should return false when fixture for request not found by method', () => {
  expect(findTestFixture(endpoints, {path: '/foo/1', method: 'PUT'} as Request)).toBe(null);
});

it('should return false when fixture for request not found', () => {
  expect(findTestFixture(endpoints, {path: '/foo', method: 'GET'} as Request)).toBe(null);
});

it('should return fixture variant for request', () => {
  expect(
    findTestFixture(endpoints, {path: '/foo/1', method: 'GET', cookies: {variants: '/foo/1/GET.unathorized,/foo/2/GET.other'}} as Request)
  ).toBe('/absolutePat/foo/1/GET.unathorized.json');
});

it('should return fixture default variant for request with unknown variant', () => {
  expect(
    findTestFixture(endpoints, {path: '/foo/1', method: 'GET', cookies: {variants: '/foo/1/GET.unknown'}} as Request)
  ).toBe('/absolutePat/foo/1/GET.default.json');
});

const testCases = [
  {
    endpoint: '/foo',
    cookies: {variants: '/otherEndpoint/GET.unauthorized'},
    path: '/foo',
    method: 'GET',
    variant: 'default',
  },
  {
    endpoint: '/foo/{id}',
    cookies: {variants: '/foo/{id}/GET.unauthorized'},
    path: '/foo/1',
    method: 'GET',
    variant: 'unauthorized',
  },
  {
    endpoint: '/foo/1',
    cookies: {variants: '/foo/1/GET.unauthorized'},
    path: '/foo/1',
    method: 'GET',
    variant: 'unauthorized',
  },
  {
    endpoint: '/foo/{id}',
    cookies: {variants: '/foo/1/GET.unauthorized'},
    path: '/foo/1',
    method: 'GET',
    variant: 'unauthorized',
  },
  {
    endpoint: '/foo/1',
    cookies: {variants: '/foo/{id}/GET.unauthorized'},
    path: '/foo/1',
    method: 'GET',
    variant: 'unauthorized',
  },
  {
    endpoint: '/foo',
    cookies: {variants: '/foo/GET.unauthorized'},
    path: '/foo',
    method: 'GET',
    variant: 'unauthorized',
  },
  {
    endpoint: '/foo',
    cookies: {variants: '/foo/POST.unauthorized'},
    path: '/foo',
    method: 'GET',
    variant: 'default',
  },
  {
    endpoint: '/foo',
    cookies: {variants: '/foo/GET.unauthorized'},
    path: '/foo',
    method: 'POST',
    variant: 'default',
  },
  {
    endpoint: '/noVariants',
    cookies: {},
    path: '/noVariants',
    method: 'GET',
    variant: 'default',
  },
  {
    endpoint: '/staticOverDynamicSorting/{dynamic}',
    cookies: {variants: '/staticOverDynamicSorting/{dynamic}/GET.dynamic,/staticOverDynamicSorting/static/GET.static'},
    path: '/staticOverDynamicSorting/static',
    method: 'GET',
    variant: 'static',
  },
];

const equalWithMessage = (test: string, result: string, message: string): void => {
  if (test !== result) console.error(message);
  expect(test).toEqual(result);
};

it('extractVariant returns correct variant', () => {
  testCases.map(({endpoint, cookies, path, method, variant}) => {
    const result = extractVariant({ endpoint } as Endpoint, {cookies, path, method} as Request);

    equalWithMessage(
      result,
      variant,
      `testing: ${path}/${method} should return ${variant} but got ${result} COOKIES: ${JSON.stringify(cookies)}`
    );
  });
});
