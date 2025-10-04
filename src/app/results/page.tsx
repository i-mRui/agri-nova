"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import styles from "./results.module.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function ResultsPage() {
	const [simulationData, setSimulationData] = useState<any>(null);
	const [nasaData, setNasaData] = useState<any>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Fetch the latest simulation data
		fetchLatestSimulation();
	}, []);

	const fetchLatestSimulation = async () => {
		try {
			setLoading(true);
			
			// Run a sample simulation with default values
			const simulationResponse = await fetch("/api/simulate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					irrigationMmPerDay: 5,
					fertilizerKgPerHa: 15,
					livestockDensityPerHa: 2,
					cropType: "Corn",
					soilType: "Loam",
				}),
			});
			
			const simulationResult = await simulationResponse.json();
			setSimulationData(simulationResult);

			// Fetch NASA data
			const nasaResponse = await fetch("/api/nasaData?lat=40.7128&lon=-74.0060&dataset=comprehensive");
			const nasaResult = await nasaResponse.json();
			setNasaData(nasaResult);
			
		} catch (error) {
			console.error("Error fetching simulation data:", error);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>Loading Results...</h1>
					<p className={styles.subtitle}>Analyzing your farm data with NASA satellite information</p>
				</div>
			</div>
		);
	}

	if (!simulationData) {
		return (
			<div className={styles.container}>
				<div className={styles.header}>
					<h1 className={styles.title}>No Results Available</h1>
					<p className={styles.subtitle}>Please run a simulation first to see results</p>
				</div>
				<div className={styles.navigation}>
					<Link href="/simulate" className={styles.navButton}>
						Run Simulation
					</Link>
					<Link href="/" className={styles.navButton}>
						Back to Home
					</Link>
				</div>
			</div>
		);
	}

	// Performance chart data
	const performanceChartData = {
		labels: ['Crop Yield', 'Soil Health', 'Water Efficiency', 'Sustainability'],
		datasets: [
			{
				label: 'Score',
				data: [
					simulationData.yieldScore,
					simulationData.soilHealthScore,
					simulationData.waterEfficiencyScore,
					simulationData.sustainabilityScore
				],
				backgroundColor: [
					'rgba(34, 197, 94, 0.8)',   // Green for yield
					'rgba(245, 158, 11, 0.8)',  // Orange for soil
					'rgba(59, 130, 246, 0.8)',  // Blue for water
					'rgba(16, 185, 129, 0.8)'   // Teal for sustainability
				],
				borderColor: [
					'rgba(34, 197, 94, 1)',
					'rgba(245, 158, 11, 1)',
					'rgba(59, 130, 246, 1)',
					'rgba(16, 185, 129, 1)'
				],
				borderWidth: 2,
				borderRadius: 8,
			},
		],
	};

	// Environmental impact chart
	const impactChartData = {
		labels: ['Carbon Footprint', 'Economic Viability'],
		datasets: [
			{
				data: [simulationData.carbonFootprint, simulationData.economicViability],
				backgroundColor: [
					'rgba(239, 68, 68, 0.8)',   // Red for carbon
					'rgba(34, 197, 94, 0.8)'    // Green for economic
				],
				borderColor: [
					'rgba(239, 68, 68, 1)',
					'rgba(34, 197, 94, 1)'
				],
				borderWidth: 2,
			},
		],
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
			},
		},
		scales: {
			y: {
				beginAtZero: true,
				max: 100,
				ticks: {
					color: '#4a5568',
					font: {
						size: 12,
					},
				},
				grid: {
					color: 'rgba(0, 0, 0, 0.1)',
				},
			},
			x: {
				ticks: {
					color: '#4a5568',
					font: {
						size: 12,
					},
				},
				grid: {
					display: false,
				},
			},
		},
	};

	const doughnutOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: {
					color: '#4a5568',
					font: {
						size: 12,
					},
				},
			},
		},
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Farm Analysis Results</h1>
				<p className={styles.subtitle}>
					Your farming simulation results with NASA satellite data analysis
				</p>
			</div>

			<div className={styles.content}>
				{/* Key Metrics */}
				<div className={styles.statsGrid}>
					<div className={styles.statCard}>
						<div className={styles.statValue}>{simulationData.yieldScore}</div>
						<div className={styles.statLabel}>Crop Yield</div>
						<div className={styles.statDesc}>Expected harvest output</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statValue}>{simulationData.soilHealthScore}</div>
						<div className={styles.statLabel}>Soil Health</div>
						<div className={styles.statDesc}>Long-term fertility</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statValue}>{simulationData.waterEfficiencyScore}</div>
						<div className={styles.statLabel}>Water Efficiency</div>
						<div className={styles.statDesc}>Irrigation optimization</div>
					</div>
					<div className={styles.statCard}>
						<div className={styles.statValue}>{simulationData.sustainabilityScore}</div>
						<div className={styles.statLabel}>Sustainability</div>
						<div className={styles.statDesc}>Environmental impact</div>
					</div>
				</div>

				{/* Charts Section */}
				<div className={styles.chartsGrid}>
					<div className={styles.chartContainer}>
						<h3 className={styles.chartTitle}>Performance Overview</h3>
						<Bar data={performanceChartData} options={chartOptions} />
					</div>
					
					<div className={styles.chartContainer}>
						<h3 className={styles.chartTitle}>Environmental Impact</h3>
						<Doughnut data={impactChartData} options={doughnutOptions} />
					</div>
				</div>

				{/* NASA Data Section */}
				{nasaData && (
					<div className={styles.nasaSection}>
						<h3 className={styles.sectionTitle}>NASA Satellite Data</h3>
						<div className={styles.nasaGrid}>
							<div className={styles.nasaCard}>
								<h4>Weather Conditions</h4>
								<div className={styles.nasaData}>
									<div>Temperature: {nasaData.data?.power?.temperature2m?.toFixed(1)}°C</div>
									<div>Rainfall: {nasaData.data?.power?.precipitation?.toFixed(1)}mm</div>
									<div>Humidity: {nasaData.data?.power?.humidity?.toFixed(1)}%</div>
									<div>Wind Speed: {nasaData.data?.power?.windSpeed?.toFixed(1)} m/s</div>
								</div>
							</div>
							<div className={styles.nasaCard}>
								<h4>Soil & Vegetation</h4>
								<div className={styles.nasaData}>
									<div>Soil Moisture: {(nasaData.data?.smap?.soilMoistureRootZone * 100)?.toFixed(1)}%</div>
									<div>Soil Temperature: {nasaData.data?.smap?.soilTemperature?.toFixed(1)}°C</div>
									<div>Vegetation Health: {nasaData.data?.modis?.ndvi > 0.7 ? "Excellent" : nasaData.data?.modis?.ndvi > 0.5 ? "Good" : "Poor"}</div>
									<div>Drought Status: {nasaData.data?.drought?.droughtCategory}</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Insights and Recommendations */}
				<div className={styles.insightsSection}>
					<h3 className={styles.sectionTitle}>Farmer Insights</h3>
					<div className={styles.insightsGrid}>
						<div className={styles.insightsCard}>
							<h4>Key Insights</h4>
							<ul className={styles.insightsList}>
								{simulationData.insights?.map((insight: string, index: number) => (
									<li key={index} className={styles.insightItem}>
										{insight}
									</li>
								))}
							</ul>
						</div>
						
						{simulationData.recommendations && simulationData.recommendations.length > 0 && (
							<div className={styles.recommendationsCard}>
								<h4>Recommended Actions</h4>
								{simulationData.recommendations.map((rec: any, index: number) => (
									<div key={index} className={styles.recommendation}>
										<div className={styles.recPriority}>{rec.priority}</div>
										<div className={styles.recAction}>{rec.action}</div>
										<div className={styles.recImpact}>{rec.impact}</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Comparison Data */}
				{simulationData.comparison && (
					<div className={styles.comparisonSection}>
						<h3 className={styles.sectionTitle}>Performance Comparison</h3>
						<div className={styles.comparisonCard}>
							<div className={styles.comparisonItem}>
								<span>Baseline Yield:</span> {simulationData.comparison.baseline}
							</div>
							<div className={styles.comparisonItem}>
								<span>Your Yield:</span> {simulationData.comparison.current}
							</div>
							<div className={styles.comparisonItem}>
								<span>Improvement:</span> {simulationData.comparison.improvement > 0 ? '+' : ''}{simulationData.comparison.improvement}%
							</div>
							<div className={styles.comparisonItem}>
								<span>Benchmark:</span> {simulationData.comparison.benchmark}
							</div>
						</div>
					</div>
				)}

				<div className={styles.navigation}>
					<Link href="/simulate" className={styles.navButton}>
						Run Another Analysis
					</Link>
					<Link href="/" className={styles.navButton}>
						Back to Home
					</Link>
				</div>
			</div>
		</div>
	);
}


