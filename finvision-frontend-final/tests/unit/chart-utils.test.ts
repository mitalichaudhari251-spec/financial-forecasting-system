import { generateMockOHLCV, generateEquityCurve, generateRewardCurve } from '../../src/lib/chart-utils';

describe('chart utilities', () => {
  test('generateMockOHLCV returns correct length', () => {
    const data = generateMockOHLCV('AAPL', 30);
    expect(data.length).toBe(31);
  });
  test('OHLCV bars have required fields', () => {
    const data = generateMockOHLCV('AAPL', 5);
    data.forEach(bar => {
      expect(bar).toHaveProperty('date');
      expect(bar).toHaveProperty('open');
      expect(bar).toHaveProperty('high');
      expect(bar).toHaveProperty('low');
      expect(bar).toHaveProperty('close');
      expect(bar).toHaveProperty('volume');
      expect(bar.high).toBeGreaterThanOrEqual(bar.low);
    });
  });
  test('generateEquityCurve returns correct length', () => {
    const data = generateEquityCurve(90);
    expect(data.length).toBe(91);
  });
});
