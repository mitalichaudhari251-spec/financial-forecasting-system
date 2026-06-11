import { formatPercent, formatCurrency, formatNumber, formatConfidence } from '../../src/lib/formatting';

describe('formatting utilities', () => {
  test('formatPercent formats positive numbers with + sign', () => {
    expect(formatPercent(12.5)).toBe('+12.5%');
  });
  test('formatPercent formats negative numbers correctly', () => {
    expect(formatPercent(-5.3)).toBe('-5.3%');
  });
  test('formatCurrency formats USD values', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  test('formatNumber abbreviates millions', () => {
    expect(formatNumber(1_500_000)).toBe('1.5M');
  });
  test('formatConfidence appends %', () => {
    expect(formatConfidence(84.2)).toBe('84.2%');
  });
});
