/**
 * Carbon Calculation Engine for CarbonMind AI
 * Provides modular functions to compute monthly and yearly CO2e (Carbon Dioxide Equivalent) 
 * emissions in kilograms (kg) based on lifestyle choices.
 */

// Global Emission Factors (measured in kg CO2e per unit)
export const EMISSION_FACTORS = {
  transport: {
    // Annual average baseline emissions in kg CO2e
    car: 2400,
    hybrid: 1200,
    ev: 500,
    bus: 800,
    metro: 400,
    public_transit: 400, // alias for metro
    bike: 0,
    walking: 0,
    active: 0, // alias for bike/walking
  },
  food: {
    // Annual average baseline emissions in kg CO2e
    'high meat': 2200,
    heavy_meat: 2200, // alias
    mixed: 1200,
    vegetarian: 600,
    vegan: 300,
  },
  energy: {
    // kg CO2e per kWh (India grid intensity index)
    electricity_per_kwh: 0.82,
  },
  shopping: {
    // kg CO2e per generic consumer item purchased
    item_purchased: 10,
  },
  waste: {
    // Annual average baseline emissions in kg CO2e
    no_recycling: 800,
    partial_recycling: 400,
    full_recycling: 150,
    zero_waste: 30,
  }
};

/**
 * Calculates Transport emissions.
 * @param {string} mode - transport habit key
 * @returns {Object} { monthly, yearly } emissions in kg CO2e
 */
export function calculateTransportEmission(mode) {
  const modeKey = String(mode).toLowerCase().trim();
  const yearly = EMISSION_FACTORS.transport[modeKey] ?? EMISSION_FACTORS.transport.car;
  return {
    yearly,
    monthly: Math.round((yearly / 12) * 100) / 100
  };
}

/**
 * Calculates Food consumption emissions.
 * @param {string} diet - food habit key
 * @returns {Object} { monthly, yearly } emissions in kg CO2e
 */
export function calculateFoodEmission(diet) {
  const dietKey = String(diet).toLowerCase().trim();
  const yearly = EMISSION_FACTORS.food[dietKey] ?? EMISSION_FACTORS.food.mixed;
  return {
    yearly,
    monthly: Math.round((yearly / 12) * 100) / 100
  };
}

/**
 * Calculates Energy (Electricity) emissions.
 * @param {number} kwh - monthly electrical usage in kWh
 * @returns {Object} { monthly, yearly } emissions in kg CO2e
 */
export function calculateEnergyEmission(kwh) {
  const usage = Number(kwh) || 0;
  const monthly = usage * EMISSION_FACTORS.energy.electricity_per_kwh;
  return {
    monthly: Math.round(monthly * 100) / 100,
    yearly: Math.round(monthly * 12 * 100) / 100
  };
}

/**
 * Calculates Shopping emissions.
 * @param {number} itemsCount - items purchased monthly
 * @returns {Object} { monthly, yearly } emissions in kg CO2e
 */
export function calculateShoppingEmission(itemsCount) {
  const count = Number(itemsCount) || 0;
  const monthly = count * EMISSION_FACTORS.shopping.item_purchased;
  return {
    monthly: Math.round(monthly * 100) / 100,
    yearly: Math.round(monthly * 12 * 100) / 100
  };
}

/**
 * Calculates Waste management emissions.
 * @param {string} wasteHabit - waste sorting level key
 * @returns {Object} { monthly, yearly } emissions in kg CO2e
 */
export function calculateWasteEmission(wasteHabit) {
  const wasteKey = String(wasteHabit).toLowerCase().trim();
  const yearly = EMISSION_FACTORS.waste[wasteKey] ?? EMISSION_FACTORS.waste.partial_recycling;
  return {
    yearly,
    monthly: Math.round((yearly / 12) * 100) / 100
  };
}

/**
 * Main function to compile the lifestyle profile and generate detailed emission breakdowns.
 * @param {Object} profile - User lifestyle profile JSON
 * @returns {Object} Calculated emission report breakdown
 */
export function calculateFootprint(profile) {
  if (!profile) {
    throw new Error("Profile object is required");
  }

  const transport = calculateTransportEmission(profile.transport);
  const food = calculateFoodEmission(profile.food);
  const energy = calculateEnergyEmission(profile.electricity);
  const shopping = calculateShoppingEmission(profile.shopping);
  const waste = calculateWasteEmission(profile.waste);

  const totalMonthly = transport.monthly + food.monthly + energy.monthly + shopping.monthly + waste.monthly;
  const totalYearly = transport.yearly + food.yearly + energy.yearly + shopping.yearly + waste.yearly;

  return {
    transportEmission: {
      monthly: transport.monthly,
      yearly: transport.yearly
    },
    foodEmission: {
      monthly: food.monthly,
      yearly: food.yearly
    },
    energyEmission: {
      monthly: energy.monthly,
      yearly: energy.yearly
    },
    shoppingEmission: {
      monthly: shopping.monthly,
      yearly: shopping.yearly
    },
    wasteEmission: {
      monthly: waste.monthly,
      yearly: waste.yearly
    },
    totalEmission: {
      monthly: Math.round(totalMonthly * 100) / 100,
      yearly: Math.round(totalYearly * 100) / 100
    }
  };
}
