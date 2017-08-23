import * as path from 'path';
import {Endpoint} from './endpoints';
import {named} from 'named-regexp';
import {Request} from 'express';
import {encodeUrlParams} from './encodeUrlParams';

interface Params { [key: string]: string; }

export function convertEndpointToPatternMatcher(endpoint: string): string {
  return endpoint.indexOf('{') > -1
    ? endpoint.replace(/\{/gi, '(:<').replace(/\}/gi, '>[^\/]+)')
    : endpoint;
}

export default function matcher(pattern: string, path: string): boolean {
  return named(new RegExp(`^${convertEndpointToPatternMatcher(pattern)}$`)).test(path);
}

export function extract(pattern: string, path: string): Params {
  const matched = named(new RegExp(`^${convertEndpointToPatternMatcher(pattern)}$`)).exec(path);
  if (!matched) return {};

  const captures = matched.captures;
  return Object.keys(captures).reduce(
    (acc, key) => ({ ...acc, [key]: matched.capture(key) }),
    {}
  );
}

export function extractVariantsFromRequest(req: Request): string[] {
  return ((req.cookies || {}).variants || '').split(',').sort();
}
export function extractVariant(foundEndpoint: Endpoint, req: Request): string {

  if (req.query && Object.keys(req.query).length > 0) {
    const queryVariant = encodeUrlParams(req.query);
    if (Object.keys(foundEndpoint.variants).indexOf(queryVariant) !== -1) {
      return queryVariant;
    }
  }

  // endpoint      /foo/{id}
  // cookieVariant /foo/{id}/GET.variantName
  return extractVariantsFromRequest(req)
    .map((cookieVariant: string): string | null => {
      const cookiePath = path.dirname(cookieVariant);
      const [method, variant] = path.basename(cookieVariant).split('.');

      return ((
          matcher(foundEndpoint.endpoint, cookiePath) ||
          matcher(cookiePath, req.path) ||
          foundEndpoint.endpoint === cookiePath
      ) && method === req.method )
        ? variant
        : null;
    })
    .filter((x: string | null): boolean => !!x)
    [0] || 'default';
}

export function findEndpoint(endpoints: Endpoint[], req: Request): Endpoint | undefined {
  return endpoints.find(e => e.method === req.method && matcher(e.endpoint, req.path));
}

export function findFixture(req: Request, foundEndpoint?: Endpoint): string | null {
  if (!foundEndpoint) return null;
  const variant = extractVariant(foundEndpoint, req);

  return foundEndpoint.variants[variant] || foundEndpoint.variants['default'] || null;
}
