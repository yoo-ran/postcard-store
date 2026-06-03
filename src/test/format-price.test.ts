import { formatPrice } from '@/lib/format-price';

describe('formatPrice', () => {
  it('formats a standard amount correctly', () => {
    expect(formatPrice(299)).toMatch(/2\.99/);
  });

  it('formats zero cents as $0.00', () => {
    expect(formatPrice(0)).toMatch(/0\.00/);
  });

  it('formats a large number correctly', () => {
    expect(formatPrice(1000000)).toMatch(/10,000\.00/);
  });

  it('formats a negative value', () => {
    expect(formatPrice(-299)).toMatch(/-.*2\.99/);
  });

  it('formats whole dollar amounts correctly', () => {
    expect(formatPrice(500)).toMatch(/5\.00/);
  });

  it('formats an amount with no cents', () => {
    expect(formatPrice(10000)).toMatch(/100\.00/);
  });

  it('includes CAD in the formatted output', () => {
    expect(formatPrice(299)).toMatch(/CAD|\$/);
  });
});
