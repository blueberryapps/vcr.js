import * as path from 'path';
import {FixturesMap} from './listAllFixtures';

export interface Endpoint {
  endpoint: string;
  method: string;
  variants: {
    [key: string]: string
  };
}

function joinEndpointVariants(acc: Object, val: Endpoint) {
  const key = `${val.endpoint} ${val.method}`;
  return {
    [key]: {
      ...val,
      variants: {
        ...(acc[key] || {}).variants,
        ...val.variants
      }
    }
  };
}

export function extractEndpointsIntoObject(fixtures: FixturesMap): {[key: string]: Endpoint} {
  return Object
    .keys(fixtures)
    .map(relative => endpoint(relative, fixtures[relative]))
    .reduce((acc, val) => ({...acc, ...joinEndpointVariants(acc, val)}), {});
}

export function extractEndpoints(fixtures: FixturesMap): Endpoint[] {
  const endpoints = extractEndpointsIntoObject(fixtures);
  return Object.keys(endpoints).map(key => endpoints[key]);
}

export function endpoint(relativePath: string, absolutePath: string): Endpoint {
  const [method, variant] = path.basename(relativePath).split('.');
  const endpoint = `/${path.dirname(relativePath)}`;

  return {
    endpoint,
    method: method,
    variants: {
      [variant]: absolutePath,
    }
  };
}
