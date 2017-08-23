import { encodeUrlParams } from '../encodeUrlParams';

it('encodeUrlParams', () => {
  expect(encodeUrlParams({foo: 'bar'})).toEqual('foo=bar');
  expect(encodeUrlParams({foo: 'bar foo'})).toEqual('foo=bar%20foo');
  expect(encodeUrlParams({bar: 'foo', foo: 'bar'})).toEqual('bar=foo&foo=bar');
});

it('encodeUrlParams with sorted keys', () => {
  expect(encodeUrlParams({c: 'c', a: 'a', b: 'b'})).toEqual('a=a&b=b&c=c');
});

it('encodeUrlParams works without any data', () => {
  expect(encodeUrlParams()).toEqual('');
});
