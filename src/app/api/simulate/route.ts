type PlayerChoices = {
	irrigationMmPerDay: number;
	fertilizerKgPerHa: number;
	livestockDensityPerHa: number;
	cropType?: string;
	soilType?: string;
	farmingMethod?: string;
};

type SimulationResult = {
	yieldScore: number;
	sustainabilityScore: number;
	soilHealthScore: number;
	waterEfficiencyScore: number;
	carbonFootprint: number;
	economicViability: number;
	insights: string[];
	recommendations: Recommendation[];
	comparison: ComparisonData;
	livestockImpact: LivestockAnalysis;
	irrigationAnalysis: IrrigationAnalysis;
	soilHealthMetrics: SoilHealthMetrics;
};

type Recommendation = {
	category: string;
	priority: "High" | "Medium" | "Low";
	action: string;
	impact: string;
	implementation: string;
};

type ComparisonData = {
	baseline: number;
	current: number;
	improvement: number;
	benchmark: string;
};

type LivestockAnalysis = {
	soilCompaction: number;
	nutrientCycling: number;
	waterConsumption: number;
	greenhouseGasEmissions: number;
	benefits: string[];
	concerns: string[];
};

type IrrigationAnalysis = {
	efficiency: number;
	waterStress: string;
	optimalTiming: string;
	recommendedMethod: string;
	waterSavings: number;
};

type SoilHealthMetrics = {
	organicMatter: number;
	pH: number;
	nutrientLevel: string;
	moistureRetention: number;
	compactionRisk: string;
};

export async function POST(request: Request) {
	const body = (await request.json()) as PlayerChoices | undefined;
	if (!body) {
		return Response.json({ error: "Missing request body" }, { status: 400 });
	}

	const { 
		irrigationMmPerDay, 
		fertilizerKgPerHa, 
		livestockDensityPerHa,
		cropType = "Corn",
		soilType = "Loam",
		farmingMethod = "Conventional"
	} = body;

	try {
		// Fetch NASA data for context
		const nasaResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/nasaData?lat=40.7128&lon=-74.0060`);
		const nasaData = await nasaResponse.json();

		// Run comprehensive simulation
		const result = await runComprehensiveSimulation(
			{ irrigationMmPerDay, fertilizerKgPerHa, livestockDensityPerHa, cropType, soilType, farmingMethod },
			nasaData
		);

		return Response.json(result);
	} catch (error) {
		return Response.json(
			{ error: "Simulation failed", details: error },
			{ status: 500 }
		);
	}
}

async function runComprehensiveSimulation(choices: PlayerChoices, nasaData: any): Promise<SimulationResult> {
	const { irrigationMmPerDay, fertilizerKgPerHa, livestockDensityPerHa, cropType, soilType, farmingMethod } = choices;

	// Base calculations with NASA data integration
	const baseYield = calculateBaseYield(cropType || "Corn", soilType || "Loam", nasaData);
	const irrigationImpact = calculateIrrigationImpact(irrigationMmPerDay, nasaData);
	const fertilizerImpact = calculateFertilizerImpact(fertilizerKgPerHa, soilType || "Loam");
	const livestockImpact = calculateLivestockImpact(livestockDensityPerHa, nasaData);
	
	// Comprehensive scoring
	const yieldScore = Math.max(0, baseYield + irrigationImpact.yieldBoost + fertilizerImpact.yieldBoost - livestockImpact.yieldReduction);
	const sustainabilityScore = calculateSustainabilityScore(choices, nasaData);
	const soilHealthScore = calculateSoilHealthScore(choices, nasaData);
	const waterEfficiencyScore = calculateWaterEfficiencyScore(irrigationMmPerDay, nasaData);
	const carbonFootprint = calculateCarbonFootprint(choices);
	const economicViability = calculateEconomicViability(choices, yieldScore);

	// Generate insights and recommendations
	const insights = generateComprehensiveInsights(choices, nasaData, {
		yieldScore, sustainabilityScore, soilHealthScore, waterEfficiencyScore
	});

	const recommendations = generateDetailedRecommendations(choices, nasaData, {
		yieldScore, sustainabilityScore, soilHealthScore, waterEfficiencyScore
	});

	return {
		yieldScore: Math.round(yieldScore),
		sustainabilityScore: Math.round(sustainabilityScore),
		soilHealthScore: Math.round(soilHealthScore),
		waterEfficiencyScore: Math.round(waterEfficiencyScore),
		carbonFootprint: Math.round(carbonFootprint),
		economicViability: Math.round(economicViability),
		insights,
		recommendations,
		comparison: generateComparisonData(choices, yieldScore),
		livestockImpact: analyzeLivestockEffects(livestockDensityPerHa, nasaData),
		irrigationAnalysis: analyzeIrrigationEffects(irrigationMmPerDay, nasaData),
		soilHealthMetrics: analyzeSoilHealth(choices, nasaData)
	};
}

function calculateBaseYield(cropType: string, soilType: string, nasaData: any): number {
	const cropMultipliers = { Corn: 100, Wheat: 80, Soybeans: 90, Rice: 85 };
	const soilMultipliers = { Loam: 1.0, Clay: 0.8, Sand: 0.7, Silt: 0.9 };
	
	const baseYield = cropMultipliers[cropType as keyof typeof cropMultipliers] || 100;
	const soilFactor = soilMultipliers[soilType as keyof typeof soilMultipliers] || 1.0;
	const weatherFactor = nasaData?.data?.power?.temperature2m > 25 ? 0.9 : 1.1;
	
	return baseYield * soilFactor * weatherFactor;
}

function calculateIrrigationImpact(irrigationMm: number, nasaData: any): { yieldBoost: number; waterEfficiency: number } {
	const optimalIrrigation = 5; // mm/day
	const nasaSoilMoisture = nasaData?.data?.smap?.soilMoistureRootZone || 0.3;
	
	let yieldBoost = 0;
	if (irrigationMm > 0) {
		const efficiency = nasaSoilMoisture > 0.25 ? 0.8 : 0.6;
		yieldBoost = Math.min(irrigationMm * 2 * efficiency, 20); // Cap at 20% boost
	}
	
	const waterEfficiency = irrigationMm > optimalIrrigation ? 
		Math.max(0.5, 1 - (irrigationMm - optimalIrrigation) * 0.1) : 1.0;
	
	return { yieldBoost, waterEfficiency };
}

function calculateFertilizerImpact(fertilizerKg: number, soilType: string): { yieldBoost: number; soilImpact: number } {
	const soilNutrientRetention = { Loam: 0.8, Clay: 0.9, Sand: 0.5, Silt: 0.7 };
	const retention = soilNutrientRetention[soilType as keyof typeof soilNutrientRetention] || 0.8;
	
	const yieldBoost = Math.min(fertilizerKg * 0.5 * retention, 15); // Cap at 15% boost
	const soilImpact = fertilizerKg > 20 ? -5 : fertilizerKg > 10 ? -2 : 0; // Negative impact for overuse
	
	return { yieldBoost, soilImpact };
}

function calculateLivestockImpact(density: number, nasaData: any): { yieldReduction: number; soilCompaction: number } {
	const yieldReduction = density * 0.5; // 0.5% reduction per animal per hectare
	const soilCompaction = density * 2; // Compaction risk increases with density
	
	return { yieldReduction, soilCompaction };
}

function calculateSustainabilityScore(choices: PlayerChoices, nasaData: any): number {
	let score = 100;
	
	// Water usage penalty
	if (choices.irrigationMmPerDay > 8) score -= 15;
	else if (choices.irrigationMmPerDay > 5) score -= 8;
	
	// Fertilizer overuse penalty
	if (choices.fertilizerKgPerHa > 30) score -= 20;
	else if (choices.fertilizerKgPerHa > 20) score -= 10;
	
	// Livestock density impact
	if (choices.livestockDensityPerHa > 5) score -= 10;
	else if (choices.livestockDensityPerHa > 3) score -= 5;
	
	// NASA data bonuses
	if (nasaData?.data?.modis?.ndvi > 0.7) score += 5;
	if (nasaData?.data?.smap?.soilMoistureRootZone > 0.3) score += 3;
	
	return Math.max(0, Math.min(100, score));
}

function calculateSoilHealthScore(choices: PlayerChoices, nasaData: any): number {
	let score = 80; // Base soil health
	
	// Fertilizer impact
	if (choices.fertilizerKgPerHa > 25) score -= 10;
	else if (choices.fertilizerKgPerHa < 5) score -= 5;
	
	// Livestock impact
	score -= choices.livestockDensityPerHa * 2;
	
	// Irrigation impact
	if (choices.irrigationMmPerDay > 10) score -= 8; // Over-irrigation can harm soil
	
	// NASA soil moisture bonus
	const soilMoisture = nasaData?.data?.smap?.soilMoistureRootZone || 0.3;
	if (soilMoisture > 0.3) score += 5;
	else if (soilMoisture < 0.2) score -= 10;
	
	return Math.max(0, Math.min(100, score));
}

function calculateWaterEfficiencyScore(irrigationMm: number, nasaData: any): number {
	const optimalRange = { min: 3, max: 7 };
	const nasaPrecipitation = nasaData?.data?.power?.precipitation || 15;
	
	let score = 100;
	
	if (irrigationMm < optimalRange.min) {
		score -= (optimalRange.min - irrigationMm) * 5;
	} else if (irrigationMm > optimalRange.max) {
		score -= (irrigationMm - optimalRange.max) * 8;
	}
	
	// Bonus for matching natural precipitation
	const precipitationMatch = Math.abs(irrigationMm - nasaPrecipitation / 30); // Daily equivalent
	if (precipitationMatch < 2) score += 10;
	
	return Math.max(0, Math.min(100, score));
}

function calculateCarbonFootprint(choices: PlayerChoices): number {
	let footprint = 50; // Base carbon footprint (kg CO2/ha/year)
	
	footprint += choices.fertilizerKgPerHa * 2; // Fertilizer emissions
	footprint += choices.irrigationMmPerDay * 365 * 0.1; // Irrigation energy
	footprint += choices.livestockDensityPerHa * 15; // Livestock methane
	
	return Math.round(footprint);
}

function calculateEconomicViability(choices: PlayerChoices, yieldScore: number): number {
	const revenue = yieldScore * 0.5; // $0.50 per yield point
	const costs = choices.fertilizerKgPerHa * 0.8 + choices.irrigationMmPerDay * 365 * 0.05 + choices.livestockDensityPerHa * 20;
	
	return Math.round(Math.max(0, revenue - costs));
}

function generateComprehensiveInsights(choices: PlayerChoices, nasaData: any, scores: any): string[] {
	const insights = [];
	
	// Irrigation insights
	if (choices.irrigationMmPerDay > 8) {
		insights.push("High irrigation levels detected - consider water conservation strategies");
	} else if (choices.irrigationMmPerDay < 3) {
		insights.push("Low irrigation may limit crop growth - monitor soil moisture closely");
	}
	
	// Fertilizer insights
	if (choices.fertilizerKgPerHa > 25) {
		insights.push("High fertilizer use may cause nutrient runoff and soil degradation");
	} else if (choices.fertilizerKgPerHa < 10) {
		insights.push("Consider soil testing to optimize fertilizer application");
	}
	
	// Livestock insights
	if (choices.livestockDensityPerHa > 4) {
		insights.push("High livestock density increases soil compaction risk");
	} else if (choices.livestockDensityPerHa > 0) {
		insights.push("Livestock can provide natural fertilizer through manure");
	}
	
	// NASA data insights
	if (nasaData?.data?.drought?.droughtCategory !== "None") {
		insights.push(`Drought conditions detected (${nasaData.data.drought.droughtCategory}) - prioritize water conservation`);
	}
	
	if (nasaData?.data?.modis?.ndvi > 0.7) {
		insights.push("Excellent vegetation health detected - current practices are effective");
	}
	
	return insights;
}

function generateDetailedRecommendations(choices: PlayerChoices, nasaData: any, scores: any): Recommendation[] {
	const recommendations = [];
	
	// Irrigation recommendations
	if (scores.waterEfficiencyScore < 70) {
		recommendations.push({
			category: "Water Management",
			priority: "High" as const,
			action: "Optimize irrigation schedule",
			impact: "Improve water efficiency by 15-20%",
			implementation: "Use soil moisture sensors and irrigate during early morning"
		});
	}
	
	// Fertilizer recommendations
	if (choices.fertilizerKgPerHa > 20) {
		recommendations.push({
			category: "Nutrient Management",
			priority: "Medium" as const,
			action: "Reduce fertilizer application",
			impact: "Lower costs and reduce environmental impact",
			implementation: "Conduct soil test and apply fertilizer based on crop needs"
		});
	}
	
	// Livestock recommendations
	if (choices.livestockDensityPerHa > 3) {
		recommendations.push({
			category: "Livestock Management",
			priority: "Medium" as const,
			action: "Implement rotational grazing",
			impact: "Reduce soil compaction and improve pasture health",
			implementation: "Rotate livestock every 7-14 days to allow pasture recovery"
		});
	}
	
	return recommendations;
}

function generateComparisonData(choices: PlayerChoices, yieldScore: number): ComparisonData {
	const baselineYield = 100;
	const improvement = ((yieldScore - baselineYield) / baselineYield) * 100;
	
	return {
		baseline: baselineYield,
		current: yieldScore,
		improvement: Math.round(improvement),
		benchmark: improvement > 10 ? "Above Average" : improvement > 0 ? "Average" : "Below Average"
	};
}

function analyzeLivestockEffects(density: number, nasaData: any): LivestockAnalysis {
	return {
		soilCompaction: density * 15, // Percentage
		nutrientCycling: density * 8, // Positive effect
		waterConsumption: density * 50, // Liters per day
		greenhouseGasEmissions: density * 12, // kg CO2 equivalent per year
		benefits: density > 0 ? [
			"Natural fertilizer through manure",
			"Increased soil organic matter",
			"Diversified income streams"
		] : [],
		concerns: density > 3 ? [
			"Increased soil compaction",
			"Higher water consumption",
			"Potential overgrazing"
		] : []
	};
}

function analyzeIrrigationEffects(irrigationMm: number, nasaData: any): IrrigationAnalysis {
	const nasaSoilMoisture = nasaData?.data?.smap?.soilMoistureSurface || 0.3;
	
	return {
		efficiency: nasaSoilMoisture > 0.25 ? 85 : 70,
		waterStress: irrigationMm > 8 ? "High" : irrigationMm > 5 ? "Moderate" : "Low",
		optimalTiming: "Early morning (6-8 AM)",
		recommendedMethod: irrigationMm > 6 ? "Drip Irrigation" : "Sprinkler System",
		waterSavings: irrigationMm > 7 ? 20 : 0 // Potential savings percentage
	};
}

function analyzeSoilHealth(choices: PlayerChoices, nasaData: any): SoilHealthMetrics {
	const nasaSoilMoisture = nasaData?.data?.smap?.soilMoistureRootZone || 0.3;
	
	return {
		organicMatter: 2.5 + (choices.livestockDensityPerHa * 0.3) - (choices.fertilizerKgPerHa * 0.02),
		pH: 6.5 + (choices.fertilizerKgPerHa * 0.01),
		nutrientLevel: choices.fertilizerKgPerHa > 20 ? "High" : choices.fertilizerKgPerHa > 10 ? "Moderate" : "Low",
		moistureRetention: nasaSoilMoisture * 100,
		compactionRisk: choices.livestockDensityPerHa > 4 ? "High" : choices.livestockDensityPerHa > 2 ? "Moderate" : "Low"
	};
}


