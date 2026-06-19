import { describe, it, expect } from 'vitest';
import {
  calculateTransportEmission,
  calculateFoodEmission,
  calculateEnergyEmission,
  calculateShoppingEmission,
  calculateWasteEmission,
  calculateFootprint,
} from './carbonEngine';

describe('CarbonMind AI - Carbon Calculation Engine Tests', () => {
  
  describe('calculateTransportEmission()', () => {
    it('should calculate correct emissions for car', () => {
      const result = calculateTransportEmission('car');
      expect(result.yearly).toBe(2400);
      expect(result.monthly).toBe(200);
    });

    it('should calculate correct emissions for ev', () => {
      const result = calculateTransportEmission('ev');
      expect(result.yearly).toBe(500);
      expect(result.monthly).toBeCloseTo(41.67, 1);
    });

    it('should return default car emissions on invalid transport mode', () => {
      const result = calculateTransportEmission('rocket');
      expect(result.yearly).toBe(2400);
    });
  });

  describe('calculateFoodEmission()', () => {
    it('should calculate correct emissions for mixed diet', () => {
      const result = calculateFoodEmission('mixed');
      expect(result.yearly).toBe(1200);
      expect(result.monthly).toBe(100);
    });

    it('should calculate correct emissions for vegetarian diet', () => {
      const result = calculateFoodEmission('vegetarian');
      expect(result.yearly).toBe(600);
      expect(result.monthly).toBe(50);
    });
  });

  describe('calculateEnergyEmission()', () => {
    it('should calculate correct emissions for 350 kWh usage', () => {
      const result = calculateEnergyEmission(350);
      expect(result.monthly).toBe(287); // 350 * 0.82
      expect(result.yearly).toBe(3444); // 287 * 12
    });

    it('should handle zero or empty values gracefully', () => {
      const result = calculateEnergyEmission(0);
      expect(result.monthly).toBe(0);
      expect(result.yearly).toBe(0);
    });
  });

  describe('calculateShoppingEmission()', () => {
    it('should calculate correct emissions for 4 items purchased', () => {
      const result = calculateShoppingEmission(4);
      expect(result.monthly).toBe(40); // 4 * 10
      expect(result.yearly).toBe(480); // 40 * 12
    });
  });

  describe('calculateWasteEmission()', () => {
    it('should calculate correct emissions for partial_recycling', () => {
      const result = calculateWasteEmission('partial_recycling');
      expect(result.yearly).toBe(400);
      expect(result.monthly).toBeCloseTo(33.33, 1);
    });
  });

  describe('calculateFootprint() overall integration', () => {
    it('should compile lifestyle profile into correct total emission report', () => {
      const mockProfile = {
        transport: 'car',
        food: 'mixed',
        electricity: 350,
        shopping: 4,
        waste: 'partial_recycling'
      };

      const report = calculateFootprint(mockProfile);

      expect(report.transportEmission.yearly).toBe(2400);
      expect(report.foodEmission.yearly).toBe(1200);
      expect(report.energyEmission.yearly).toBe(3444);
      expect(report.shoppingEmission.yearly).toBe(480);
      expect(report.wasteEmission.yearly).toBe(400);
      
      // Totals
      expect(report.totalEmission.yearly).toBe(2400 + 1200 + 3444 + 480 + 400);
    });
  });
});
