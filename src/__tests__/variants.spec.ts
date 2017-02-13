import { cleanupVariantsConflicts } from '../variants';

it('should resolve correctly conflicts', () => {
  const input = ['/foo/bar/GET.unauthorized', '/fooBar/GET.blacklisted', '/fooBar/GET.unauthorized'];
  const output = ['/foo/bar/GET.unauthorized', '/fooBar/GET.unauthorized'];
  expect(cleanupVariantsConflicts(input)).toEqual(output);
});
