import { describe, it, expect } from 'vitest';
import {
  calculateImpactScore,
  analyzeEmissionSources,
  generateReasoning,
  rankRecommendations,
  runInsightEngine
} from './aiEngine';

describe('CarbonMind AI - Explainable AI Insight & Decision Engine Tests', () => {

  describe('calculateImpactScore()', () => {
    it('should compute valid scores between 1 and 100', () => {
      // 0 reduction, High difficulty
      const lowScore = calculateImpactScore(0, 'High');
      expect(lowScore).toBe(12); // (0 * 0.7) + (40 * 0.3) = 12

      // 1500 reduction (normalized to 100), Low difficulty
      const highScore = calculateImpactScore(1500, 'Low');
      expect(highScore).toBe(100); // (100 * 0.7) + (100 * 0.3) = 100
    });
  });

  describe('analyzeEmissionSources()', () => {
    it('should correctly identify Transport as primary source', () => {
      const mockEmissions = {
        transportEmission: { yearly: 2400 },
        foodEmission: { yearly: 600 },
        energyEmission: { yearly: 500 },
        shoppingEmission: { yearly: 200 },
        wasteEmission: { yearly: 150 },
        totalEmission: { yearly: 3850 }
      };

      const analysis = analyzeEmissionSources(mockEmissions);
      expect(analysis.primarySource).toBe('Transport');
      expect(analysis.percentage).toBe(62); // 2400 / 3850 = 62%
    });
  });

  describe('generateReasoning()', () => {
    it('should produce the correct explainable text structure', () => {
      const reason = generateReasoning('Transport', 58);
      expect(reason).toBe('Transportation contributes 58% of your total emissions');
    });
  });

  describe('rankRecommendations()', () => {
    it('should order items descending by impactScore', () => {
      const list = [
        { recommendation: 'A', impactScore: 40 },
        { recommendation: 'B', impactScore: 90 },
        { recommendation: 'C', impactScore: 75 }
      ];
      const sorted = rankRecommendations(list);
      expect(sorted[0].recommendation).toBe('B');
      expect(sorted[1].recommendation).toBe('C');
      expect(sorted[2].recommendation).toBe('A');
    });
  });

  describe('runInsightEngine() overall logic', () => {
    it('should generate at least 5 recommendations formatted correctly', () => {
      const mockEmissions = {
        transportEmission: { yearly: 2400 },
        foodEmission: { yearly: 1200 },
        energyEmission: { yearly: 1596 },
        shoppingEmission: { yearly: 480 },
        wasteEmission: { yearly: 400 },
        totalEmission: { yearly: 6076 }
      };

      const results = runInsightEngine(mockEmissions);
      expect(results.profile.primarySource).toBe('Transport');
      expect(results.recommendations.length).toBeGreaterThanOrEqual(5);

      const firstRec = results.recommendations[0];
      expect(firstRec.recommendation).toBeDefined();
      expect(firstRec.reason).toBeDefined();
      expect(firstRec.primaryEmissionSource).toBeDefined();
      expect(firstRec.impactScore).toBeDefined();
      expect(firstRec.difficulty).toBeDefined();
      expect(firstRec.estimatedReduction).toBeDefined();
    });
  });
});
