import * as endpoints from '../endpoints';

const testCases = [
  {
    input: {
      relative: 'foo/{id}/jobs/GET.default.json',
      absolute: '/absolutePat/foo/{id}/jobs/GET.default.json'
    },
    output: {
      endpoint: '/foo/{id}/jobs',
      method: 'GET',
      variants: {
        default: '/absolutePat/foo/{id}/jobs/GET.default.json'
      }
    }
  },
  {
    input: {
      relative: 'foo/1/GET.default.json',
      absolute: '/absolutePat/foo/1/GET.default.json'
    },
    output: {
      endpoint: '/foo/1',
      method: 'GET',
      variants: {
        default: '/absolutePat/foo/1/GET.default.json'
      }
    }
  },
  {
    input: {
      relative: 'foo/1/GET.param1=foo&param2=bar.json',
      absolute: '/absolutePat/foo/1/GET.param1=foo&param2=bar.json'
    },
    output: {
      endpoint: '/foo/1',
      method: 'GET',
      variants: {
        'param1=foo&param2=bar': '/absolutePat/foo/1/GET.param1=foo&param2=bar.json'
      }
    }
  },
  {
    input: {
      relative: 'foo/1/GET.param1=1.1&param2=2.2.json',
      absolute: '/absolutePat/foo/1/GET.param1=1.1&param2=2.2.json'
    },
    output: {
      endpoint: '/foo/1',
      method: 'GET',
      variants: {
        'param1=1.1&param2=2.2': '/absolutePat/foo/1/GET.param1=1.1&param2=2.2.json'
      }
    }
  },
  {
    input: {
      relative: 'foo/1/POST.default.json',
      absolute: '/absolutePat/foo/1/POST.default.json'
    },
    output: {
      endpoint: '/foo/1',
      method: 'POST',
      variants: {
        default: '/absolutePat/foo/1/POST.default.json'
      }
    }
  },
  {
    input: {
      relative: 'foo/1/GET.unathorized.json',
      absolute: '/absolutePat/foo/1/GET.unathorized.json'
    },
    output: {
      endpoint: '/foo/1',
      method: 'GET',
      variants: {
        unathorized: '/absolutePat/foo/1/GET.unathorized.json'
      }
    }
  }
];

it('should convert fixture to endpoint', () => {
  testCases.map(testCase =>
  expect(endpoints.endpoint(testCase.input.relative, testCase.input.absolute))
    .toEqual(testCase.output));
});

it('should convert fixtures to endpoints', () => {
  expect(endpoints.extractEndpoints({
    'foo/1/GET.unathorized.json': '/absolutePat/foo/1/GET.unathorized.json',
    'foo/1/POST.default.json': '/absolutePat/foo/1/POST.default.json',
    'foo/1/GET.default.json': '/absolutePat/foo/1/GET.default.json',
  })).toEqual([
    {
      'endpoint': '/foo/1',
      'method': 'GET',
      'variants': {
        'default': '/absolutePat/foo/1/GET.default.json',
        'unathorized': '/absolutePat/foo/1/GET.unathorized.json'
      }
    },
    {
      'endpoint': '/foo/1',
      'method': 'POST',
      'variants': {
        'default': '/absolutePat/foo/1/POST.default.json'
      }
    }
  ]);
});
