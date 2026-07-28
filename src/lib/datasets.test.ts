import { describe, it, expect } from 'vitest';
import { startups, featurePresets } from './datasets';

describe('startups dataset', () => {
  it('contains exactly 50 records', () => {
    expect(startups).toHaveLength(50);
  });

  it('each record has the expected numeric and categorical fields', () => {
    startups.forEach((record) => {
      expect(typeof record.rdSpend).toBe('number');
      expect(typeof record.administration).toBe('number');
      expect(typeof record.marketingSpend).toBe('number');
      expect(typeof record.state).toBe('string');
      expect(typeof record.profit).toBe('number');
    });
  });

  it('R&D Spend correlates strongly with Profit (sanity check against known dataset properties)', () => {
    const rd = startups.map((s) => s.rdSpend);
    const profit = startups.map((s) => s.profit);
    const meanRd = rd.reduce((a, b) => a + b, 0) / rd.length;
    const meanProfit = profit.reduce((a, b) => a + b, 0) / profit.length;
    const cov = rd.reduce((sum, v, i) => sum + (v - meanRd) * (profit[i] - meanProfit), 0);
    const stdRd = Math.sqrt(rd.reduce((sum, v) => sum + (v - meanRd) ** 2, 0));
    const stdProfit = Math.sqrt(profit.reduce((sum, v) => sum + (v - meanProfit) ** 2, 0));
    const correlation = cov / (stdRd * stdProfit);

    // 開發者提供的參考資料（pic/CRISPDM.png）顯示此資料集 R&D vs Profit 相關係數 ≈ 0.97
    expect(correlation).toBeGreaterThan(0.9);
  });
});

describe('featurePresets', () => {
  it('defines three preset feature combinations', () => {
    expect(featurePresets).toHaveLength(3);
  });
});
