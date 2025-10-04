// Enhanced NASA data integration with multiple datasets
export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const latitude = searchParams.get("lat");
	const longitude = searchParams.get("lon");
	const dataset = searchParams.get("dataset") ?? "comprehensive";

	if (!latitude || !longitude) {
		return Response.json(
			{ error: "Missing required query params: lat, lon" },
			{ status: 400 }
		);
	}

	try {
		// Simulate fetching from multiple NASA datasets
		const nasaData = await fetchComprehensiveNasaData(
			Number(latitude), 
			Number(longitude)
		);

		return Response.json({
			source: "NASA Multi-Dataset Integration",
			location: { lat: Number(latitude), lon: Number(longitude) },
			timestamp: new Date().toISOString(),
			datasets: nasaData.datasets,
			data: nasaData.data,
			insights: nasaData.insights,
			recommendations: nasaData.recommendations
		});
	} catch (error) {
		return Response.json(
			{ error: "Failed to fetch NASA data", details: error },
			{ status: 500 }
		);
	}
}

async function fetchComprehensiveNasaData(lat: number, lon: number) {
	// Simulate comprehensive NASA data integration
	// In production, this would call actual NASA APIs
	
	const baseData = {
		// POWER API - Weather and Climate
		power: {
			temperature2m: 22.5 + Math.sin(Date.now() / 1000000) * 5,
			precipitation: 15.2 + Math.random() * 10,
			solarRadiation: 180 + Math.random() * 50,
			humidity: 65 + Math.random() * 20,
			windSpeed: 3.2 + Math.random() * 2
		},
		
		// SMAP - Soil Moisture
		smap: {
			soilMoistureSurface: 0.32 + Math.random() * 0.1,
			soilMoistureRootZone: 0.28 + Math.random() * 0.08,
			soilTemperature: 18.5 + Math.random() * 3
		},
		
		// MODIS - Vegetation Health
		modis: {
			ndvi: 0.65 + Math.random() * 0.15,
			evi: 0.45 + Math.random() * 0.1,
			lai: 2.8 + Math.random() * 0.5,
			fpar: 0.72 + Math.random() * 0.1
		},
		
		// GPM - Precipitation
		gpm: {
			precipitationRate: 2.1 + Math.random() * 1.5,
			precipitationAccumulation: 45.3 + Math.random() * 20
		},
		
		// Drought Monitor
		drought: {
			droughtIndex: 0.3 + Math.random() * 0.4,
			droughtCategory: getDroughtCategory(0.3 + Math.random() * 0.4),
			soilMoisturePercentile: 45 + Math.random() * 30
		}
	};

	// Calculate derived metrics
	const soilHealth = calculateSoilHealth(baseData);
	const irrigationNeeds = calculateIrrigationNeeds(baseData);
	const cropStress = calculateCropStress(baseData);
	const waterBalance = calculateWaterBalance(baseData);

	return {
		datasets: [
			"NASA POWER (Weather & Climate)",
			"SMAP (Soil Moisture)",
			"MODIS (Vegetation Health)", 
			"GPM (Precipitation)",
			"U.S. Drought Monitor"
		],
		data: {
			...baseData,
			derived: {
				soilHealth,
				irrigationNeeds,
				cropStress,
				waterBalance
			}
		},
		insights: generateInsights(baseData, soilHealth, irrigationNeeds, cropStress),
		recommendations: generateRecommendations(baseData, soilHealth, irrigationNeeds)
	};
}

function calculateSoilHealth(data: any) {
	const moisture = data.smap.soilMoistureRootZone;
	const temp = data.smap.soilTemperature;
	const ndvi = data.modis.ndvi;
	
	return {
		score: Math.min(100, (moisture * 100 + (25 - Math.abs(temp - 20)) * 2 + ndvi * 50)),
		moistureLevel: moisture > 0.3 ? "Optimal" : moisture > 0.2 ? "Moderate" : "Low",
		temperatureStatus: temp > 25 ? "Hot" : temp < 15 ? "Cold" : "Optimal",
		organicMatter: 2.5 + Math.random() * 1.5,
		pH: 6.2 + Math.random() * 0.8,
		nutrientLevel: "Moderate"
	};
}

function calculateIrrigationNeeds(data: any) {
	const precipitation = data.power.precipitation;
	const soilMoisture = data.smap.soilMoistureSurface;
	const temperature = data.power.temperature2m;
	const evapotranspiration = temperature * 0.1 + 2;
	
	const waterDeficit = evapotranspiration - precipitation;
	const irrigationRequired = Math.max(0, waterDeficit * 0.8);
	
	return {
		dailyRequirement: irrigationRequired,
		weeklyRequirement: irrigationRequired * 7,
		efficiency: soilMoisture > 0.25 ? "High" : "Moderate",
		recommendedMethod: irrigationRequired > 5 ? "Drip Irrigation" : "Sprinkler",
		waterStress: waterDeficit > 3 ? "High" : waterDeficit > 1 ? "Moderate" : "Low"
	};
}

function calculateCropStress(data: any) {
	const ndvi = data.modis.ndvi;
	const temperature = data.power.temperature2m;
	const soilMoisture = data.smap.soilMoistureRootZone;
	
	let stressScore = 0;
	if (temperature > 30) stressScore += 20;
	if (temperature < 10) stressScore += 15;
	if (soilMoisture < 0.2) stressScore += 25;
	if (ndvi < 0.5) stressScore += 20;
	
	return {
		overallStress: stressScore,
		heatStress: temperature > 30 ? "High" : temperature > 25 ? "Moderate" : "Low",
		coldStress: temperature < 10 ? "High" : temperature < 15 ? "Moderate" : "Low",
		waterStress: soilMoisture < 0.2 ? "High" : soilMoisture < 0.25 ? "Moderate" : "Low",
		vegetationHealth: ndvi > 0.7 ? "Excellent" : ndvi > 0.5 ? "Good" : "Poor"
	};
}

function calculateWaterBalance(data: any) {
	const precipitation = data.power.precipitation;
	const evapotranspiration = data.power.temperature2m * 0.1 + 2;
	const soilMoisture = data.smap.soilMoistureSurface;
	
	return {
		inflow: precipitation,
		outflow: evapotranspiration,
		netBalance: precipitation - evapotranspiration,
		soilStorage: soilMoisture * 100,
		runoffRisk: precipitation > 20 ? "High" : precipitation > 10 ? "Moderate" : "Low"
	};
}

function generateInsights(data: any, soilHealth: any, irrigationNeeds: any, cropStress: any) {
	const insights = [];
	
	if (data.power.temperature2m > 28) {
		insights.push("High temperatures detected - consider shade management and increased irrigation");
	}
	
	if (data.smap.soilMoistureRootZone < 0.25) {
		insights.push("Soil moisture is below optimal levels - irrigation recommended");
	}
	
	if (data.modis.ndvi > 0.7) {
		insights.push("Vegetation health is excellent - current management practices are effective");
	}
	
	if (irrigationNeeds.dailyRequirement > 5) {
		insights.push("High irrigation demand detected - monitor water usage efficiency");
	}
	
	if (cropStress.overallStress > 50) {
		insights.push("Crop stress levels are elevated - review management practices");
	}
	
	return insights;
}

function generateRecommendations(data: any, soilHealth: any, irrigationNeeds: any) {
	const recommendations = [];
	
	if (soilHealth.moistureLevel === "Low") {
		recommendations.push({
			type: "Irrigation",
			priority: "High",
			action: "Increase irrigation frequency",
			impact: "Improve soil moisture and crop yield",
			implementation: "Apply 2-3mm daily for next 5 days"
		});
	}
	
	if (irrigationNeeds.dailyRequirement > 3) {
		recommendations.push({
			type: "Water Management",
			priority: "Medium", 
			action: "Optimize irrigation timing",
			impact: "Reduce water waste and improve efficiency",
			implementation: "Irrigate during early morning hours"
		});
	}
	
	if (data.power.temperature2m > 30) {
		recommendations.push({
			type: "Heat Management",
			priority: "High",
			action: "Implement heat stress mitigation",
			impact: "Protect crops from heat damage",
			implementation: "Increase irrigation and consider shade cloth"
		});
	}
	
	return recommendations;
}

function getDroughtCategory(index: number) {
	if (index < 0.2) return "None";
	if (index < 0.3) return "Abnormally Dry";
	if (index < 0.4) return "Moderate Drought";
	if (index < 0.5) return "Severe Drought";
	if (index < 0.6) return "Extreme Drought";
	return "Exceptional Drought";
}


