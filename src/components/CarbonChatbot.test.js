import { describe, it, expect } from 'vitest';
import {
  generateResponse,
  generateAdvice,
  generateCarbonExplanation
} from '../utils/chatbotHelpers';

describe('CarbonMind AI - Assistant Chatbot Logic Tests', () => {
  const mockContext = {
    userProfile: {
      transport: 'car',
      food: 'mixed',
      electricity: 350,
      shopping: 4,
      waste: 'partial_recycling'
    },
    emissionBreakdown: {
      transportEmission: { yearly: 2400 },
      foodEmission: { yearly: 1200 },
      energyEmission: { yearly: 1596 },
      shoppingEmission: { yearly: 480 },
      wasteEmission: { yearly: 400 },
      totalEmission: { yearly: 6076 }
    },
    recommendations: [
      {
        recommendation: 'Replace two weekly car trips with public transit',
        reductionKg: 960,
        difficulty: 'Medium',
        cost: 'Low',
        impactScore: 82,
        reason: 'Reduces gasoline car usage directly.'
      }
    ]
  };

  describe('generateAdvice()', () => {
    it('should generate correct transport advice for car commuters', () => {
      const advice = generateAdvice('transport', mockContext);
      expect(advice).toContain('Your travel footprint is high at 2400 kg CO₂e');
    });

    it('should generate correct diet advice', () => {
      const advice = generateAdvice('food', mockContext);
      expect(advice).toContain('Your diet choice (mixed) keeps food footprint at a low 1200 kg');
    });
  });

  describe('generateCarbonExplanation()', () => {
    it('should calculate correct percentage of emissions for electricity', () => {
      const explanation = generateCarbonExplanation('electricity', mockContext);
      // 1596 / 6076 = 26%
      expect(explanation).toContain('electricity usage accounts for 1596 kg CO₂e/year (26%');
    });
  });

  describe('generateResponse()', () => {
    it('should answer questions about biggest emissions source', () => {
      const response = generateResponse('What is my biggest carbon source?', mockContext);
      expect(response).toContain('biggest source of carbon emissions is Transportation, contributing 2400 kg CO₂e');
    });

    it('should answer queries about reduction opportunities', () => {
      const response = generateResponse('How can I reduce my emissions?', mockContext);
      expect(response).toContain('Replace two weekly car trips with public transit');
      expect(response).toContain('960 kg CO₂e');
    });

    it('should explain sustainability terms like co2e', () => {
      const response = generateResponse('explain what co2e means', mockContext);
      expect(response).toContain('stands for Carbon Dioxide Equivalent');
    });
  });
});
