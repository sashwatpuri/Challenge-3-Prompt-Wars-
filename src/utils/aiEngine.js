/**
 * Explainable AI Insight & Decision Engine for CarbonMind AI
 * Computes transparent, auditable sustainability recommendations.
 */

// Difficulty values for scoring computation (Low is best, High incurs penalty)
export const DIFFICULTY_FACTORS = { Low: 100, Medium: 70, High: 40 };

/**
 * Calculates a transparent impact score out of 100.
 * Formula: (Carbon Reduction Weight) * 0.7 + (Difficulty Weight) * 0.3
 * 
 * @param {number} reduction - estimated carbon reduction in kg CO2e
 * @param {string} difficulty - "Low", "Medium", or "High"
 * @returns {number} impactScore as an integer between 1 and 100
 */
export function calculateImpactScore(reduction, difficulty) {
  // Normalize reduction against a high baseline reduction of 1500 kg CO2e
  const reductionScore = Math.min(100, (reduction / 1500) * 100);
  const difficultyScore = DIFFICULTY_FACTORS[difficulty] || 70;

  const score = (reductionScore * 0.7) + (difficultyScore * 0.3);
  return Math.max(1, Math.min(100, Math.round(score)));
}

/**
 * Identifies the largest emission source and percentage contribution.
 * 
 * @param {Object} emissions - Breakdown output from Carbon Calculation Engine
 * @returns {Object} { primarySource, percentage, total }
 */
export function analyzeEmissionSources(emissions) {
  const total = emissions.totalEmission?.yearly || 1;
  const sources = [
    { name: 'Transport', val: emissions.transportEmission?.yearly || 0 },
    { name: 'Food', val: emissions.foodEmission?.yearly || 0 },
    { name: 'Electricity', val: emissions.energyEmission?.yearly || 0 },
    { name: 'Shopping', val: emissions.shoppingEmission?.yearly || 0 },
    { name: 'Waste', val: emissions.wasteEmission?.yearly || 0 }
  ];

  // Find primary
  sources.sort((a, b) => b.val - a.val);
  const primary = sources[0];
  const percentage = Math.round((primary.val / total) * 100);

  return {
    primarySource: primary.name,
    percentage,
    total
  };
}

/**
 * Generates an explainable reasoning string.
 * 
 * @param {string} category - Category name (e.g. "Transport")
 * @param {number} percentage - Percentage of total emissions
 * @returns {string} Explanatory reasoning
 */
export function generateReasoning(category, percentage) {
  const nameMapping = {
    Transport: 'Transportation',
    Food: 'Food consumption',
    Electricity: 'Home electricity consumption',
    Shopping: 'Shopping habits',
    Waste: 'Waste management'
  };
  const label = nameMapping[category] || category;
  return `${label} contributes ${percentage}% of your total emissions`;
}

/**
 * Ranks recommendations from highest impact score to lowest.
 * 
 * @param {Array<Object>} recommendations 
 * @returns {Array<Object>} Sorted list
 */
export function rankRecommendations(recommendations) {
  return [...recommendations].sort((a, b) => b.impactScore - a.impactScore);
}

/**
 * Main entrance function to compile user footprint into ranked explainable recommendations.
 * Generates at least 5 recommendations.
 * 
 * @param {Object} emissions - Breakdown output from Carbon Calculation Engine
 * @returns {Object} Report containing user profile, insights, and explainable recommendations list
 */
export function runInsightEngine(emissions) {
  const { primarySource, percentage, total } = analyzeEmissionSources(emissions);

  // Helper to get percentage of specific category
  const getCategoryPct = (val) => Math.round((val / total) * 100);

  const rawRecommendations = [
    // 1. Transit Recommendation
    {
      recommendation: "Replace two weekly car trips with public transport",
      reason: generateReasoning("Transport", getCategoryPct(emissions.transportEmission.yearly)),
      primaryEmissionSource: "Transport",
      difficulty: "Low",
      reductionKg: Math.round(emissions.transportEmission.yearly * 0.15)
    },
    // 2. EV Recommendation
    {
      recommendation: "Transition to a Battery Electric Vehicle (EV)",
      reason: generateReasoning("Transport", getCategoryPct(emissions.transportEmission.yearly)),
      primaryEmissionSource: "Transport",
      difficulty: "High",
      reductionKg: Math.round(emissions.transportEmission.yearly * 0.70)
    },
    // 3. Diet Recommendation
    {
      recommendation: "Adopt a Vegetarian Diet",
      reason: generateReasoning("Food", getCategoryPct(emissions.foodEmission.yearly)),
      primaryEmissionSource: "Food",
      difficulty: "Medium",
      reductionKg: Math.round(emissions.foodEmission.yearly * 0.50)
    },
    // 4. Energy Recommendation
    {
      recommendation: "Switch to a certified Green Electricity Plan",
      reason: generateReasoning("Electricity", getCategoryPct(emissions.energyEmission.yearly)),
      primaryEmissionSource: "Electricity",
      difficulty: "Low",
      reductionKg: Math.round(emissions.energyEmission.yearly * 0.80)
    },
    // 5. Shopping Recommendation
    {
      recommendation: "Shop non-essentials from secondhand or thrift stores",
      reason: generateReasoning("Shopping", getCategoryPct(emissions.shoppingEmission.yearly)),
      primaryEmissionSource: "Shopping",
      difficulty: "Low",
      reductionKg: Math.round(emissions.shoppingEmission.yearly * 0.40)
    },
    // 6. Waste Recommendation
    {
      recommendation: "Start organic kitchen waste composting",
      reason: generateReasoning("Waste", getCategoryPct(emissions.wasteEmission.yearly)),
      primaryEmissionSource: "Waste",
      difficulty: "Medium",
      reductionKg: Math.round(emissions.wasteEmission.yearly * 0.40)
    }
  ];

  // Map scores and formatted reduction percentages
  const processedRecommendations = rawRecommendations.map(item => {
    const impactScore = calculateImpactScore(item.reductionKg, item.difficulty);
    const reductionPct = total > 0 ? Math.round((item.reductionKg / total) * 100) : 0;

    return {
      recommendation: item.recommendation,
      reason: item.reason,
      primaryEmissionSource: item.primaryEmissionSource,
      impactScore,
      difficulty: item.difficulty,
      estimatedReduction: `${reductionPct}%`
    };
  });

  const ranked = rankRecommendations(processedRecommendations);

  // Construct general user profile
  let risk = "Low";
  if (total > 5500) {
    risk = "High";
  } else if (total > 2500) {
    risk = "Moderate";
  }

  const profile = {
    type: `High ${primarySource} User`,
    risk,
    primarySource
  };

  const insight = `${primarySource} contributes ${percentage}% of your emissions. Focusing here represents your highest-leverage path to reducing your climate impact.`;

  return {
    profile,
    recommendations: ranked,
    insight
  };
}
