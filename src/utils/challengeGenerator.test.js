import { describe, it, expect } from 'vitest';
import {
  generateWeeklyChallenge,
  generateDifficultyLevel,
  calculatePotentialImpact
} from './challengeGenerator';

describe('CarbonMind AI - Weekly Challenge Generator Tests', () => {
  const mockContext = {
    userProfile: {
      transport: 'car',
      food: 'heavy_meat',
      electricity: 350,
      shopping: 4,
      waste: 'partial_recycling'
    },
    emissionBreakdown: {
      transportEmission: { yearly: 2400 },
      foodEmission: { yearly: 2200 },
      energyEmission: { yearly: 1596 },
      shoppingEmission: { yearly: 480 },
      wasteEmission: { yearly: 400 },
      totalEmission: { yearly: 7076 }
    }
  };

  describe('generateDifficultyLevel()', () => {
    it('should assign Medium difficulty for car commuters', () => {
      const difficulty = generateDifficultyLevel('Transport', mockContext.userProfile);
      expect(difficulty).toBe('Medium');
    });

    it('should assign High difficulty for heavy meat eaters', () => {
      const difficulty = generateDifficultyLevel('Food', mockContext.userProfile);
      expect(difficulty).toBe('High');
    });
  });

  describe('calculatePotentialImpact()', () => {
    it('should estimate ~10% of weekly emissions as potential savings', () => {
      const impact = calculatePotentialImpact('Transport', mockContext.emissionBreakdown);
      // Weekly transport emissions = 2400 / 52 = 46.15 kg. 10% is 4.6 kg => rounded to 5 kg.
      expect(impact).toBe(5);
    });
  });

  describe('generateWeeklyChallenge()', () => {
    it('should generate transport challenges when transport is primary emission', () => {
      const result = generateWeeklyChallenge(mockContext);
      expect(result.challenge).toBe('Use public transport twice this week instead of driving');
      expect(result.difficulty).toBe('Medium');
      expect(result.estimatedCO2Reduction).toBe('5 kg'); // wait, Math.round(2400 / 52 * 0.1) = 5
      expect(result.completionReward).toBe(50);
    });
  });
});
