/**
 * Weekly Challenge Generator for CarbonMind AI
 * Creates, ranks, and evaluates personalized sustainability challenges based on user footprint profiles.
 */

/**
 * Calculates difficulty level dynamically based on user profile habits.
 * 
 * @param {string} category - Footprint category
 * @param {Object} userProfile - User habits
 * @returns {string} "Low" | "Medium" | "High"
 */
export function generateDifficultyLevel(category, userProfile) {
  if (category === 'Transport') {
    return userProfile.transport === 'car' ? 'Medium' : 'Low';
  }
  if (category === 'Food') {
    return userProfile.food === 'heavy_meat' ? 'High' : 'Low';
  }
  if (category === 'Electricity') {
    return userProfile.electricity > 400 ? 'Medium' : 'Low';
  }
  return 'Low';
}

/**
 * Computes estimated CO2 savings for the weekly challenge.
 * 
 * @param {string} category - Footprint category
 * @param {Object} emissionBreakdown - Emissions breakdown
 * @returns {number} estimated saved kg CO2e
 */
export function calculatePotentialImpact(category, emissionBreakdown) {
  const yearlyVal = emissionBreakdown[category === 'Transport' ? 'transportEmission' :
                                      category === 'Food' ? 'foodEmission' :
                                      category === 'Electricity' ? 'energyEmission' :
                                      category === 'Shopping' ? 'shoppingEmission' : 'wasteEmission']?.yearly || 500;
  
  // Weekly baseline is yearly divided by 52
  const weeklyBaseline = yearlyVal / 52;
  
  // Target a realistic 10% weekly optimization reduction
  return Math.round(weeklyBaseline * 0.10);
}

/**
 * Generates a weekly personalized sustainability challenge.
 * 
 * @param {Object} context - { userProfile, emissionBreakdown, recommendations }
 * @returns {Object} { challenge, difficulty, estimatedCO2Reduction, completionReward }
 */
export function generateWeeklyChallenge(context) {
  const { userProfile, emissionBreakdown } = context;

  // Identify primary emission category
  const sources = [
    { name: 'Transport', val: emissionBreakdown.transportEmission.yearly },
    { name: 'Food', val: emissionBreakdown.foodEmission.yearly },
    { name: 'Electricity', val: emissionBreakdown.energyEmission.yearly },
    { name: 'Shopping', val: emissionBreakdown.shoppingEmission.yearly },
    { name: 'Waste', val: emissionBreakdown.wasteEmission.yearly }
  ].sort((a, b) => b.val - a.val);

  const primary = sources[0].name;

  const difficulty = generateDifficultyLevel(primary, userProfile);
  const impactKg = calculatePotentialImpact(primary, emissionBreakdown) || 10;
  const reward = impactKg * 10; // 10 points per kg CO2 saved

  let challengeText = "Set up a organic sorting station at home.";
  if (primary === 'Transport') {
    challengeText = userProfile.transport === 'car' 
      ? "Use public transport twice this week instead of driving" 
      : "Walk or bike for short trips under 2 km this week";
  } else if (primary === 'Food') {
    challengeText = userProfile.food === 'heavy_meat'
      ? "Eat three vegetarian meals this week"
      : "Adopt plant-based milk alternatives for your coffee this week";
  } else if (primary === 'Electricity') {
    challengeText = "Reduce household electricity usage by 5% this week by unplugging standby devices";
  } else if (primary === 'Shopping') {
    challengeText = "Avoid making any non-essential online shopping purchases this week";
  } else if (primary === 'Waste') {
    challengeText = "Compost all organic kitchen waste scraps for the next 7 days";
  }

  return {
    challenge: challengeText,
    difficulty,
    estimatedCO2Reduction: `${impactKg} kg`,
    completionReward: reward
  };
}
