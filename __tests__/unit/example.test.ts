import { sum } from '../src/utils/math'; // Assuming you have a math utility

describe('sum', () => {
  it('should add two numbers correctly', () => {
    expect(sum(1, 2)).toBe(3);
  });
});
