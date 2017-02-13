import {Request} from 'express';

export default function getFixtureVariant(
  req: Request,
  defaultVariant: string = 'default',
  cookieName: string = 'record_fixture_variant'
): string {
  // const foundFixturePath = foundEndpoint && findFixture(req, foundEndpoint);
  return req.cookies[cookieName] || defaultVariant;
}
