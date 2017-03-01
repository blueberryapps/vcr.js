import canUsePort from '../canUsePort';

describe('canUsePort()', () => {
  const testCases = [
    { port: 8000,        expectedResult: true },
    { port: '8000',      expectedResult: true },
    { port: undefined,   expectedResult: false },
    { port: null,        expectedResult: false },
    { port: NaN,         expectedResult: false },
    { port: 'something', expectedResult: false },
    { port: 'omg3000',   expectedResult: false },
  ];

  testCases.forEach((testCase) => {
    it(`should return ${testCase.expectedResult} for ${testCase.port}`, () => {
      expect(canUsePort(testCase.port)).toBe(testCase.expectedResult);
    });
  });
});
