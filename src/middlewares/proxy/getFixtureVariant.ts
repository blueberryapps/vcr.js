import {Request} from 'express';
import {encodeUrlParams} from '../../encodeUrlParams';

export default function getFixtureVariant(
  req: Request,
  defaultVariant: string = 'default',
  cookieName: string = 'record_fixture_variant'
): string {
  // const foundFixturePath = foundEndpoint && findFixture(req, foundEndpoint);
  const queryVariant = (req.query && Object.keys(req.query).length > 0) ? encodeUrlParams(req.query) : null;
  return req.cookies[cookieName] || queryVariant || defaultVariant;
}
