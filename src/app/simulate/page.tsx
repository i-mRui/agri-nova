"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { LatLngExpression } from "leaflet";
import styles from "./simulate.module.css";

const LeafletMap = dynamic(() => import("@/components/LeafletMap"), { ssr: false });

export default function SimulatePage() {
	const [lat, setLat] = useState<number>(40.7128);
	const [lon, setLon] = useState<number>(-74.0060);
	const [irrigation, setIrrigation] = useState<number>(5);
	const [fertilizer, setFertilizer] = useState<number>(15);
	const [livestock, setLivestock] = useState<number>(2);
	const [cropType, setCropType] = useState<string>("Corn");
	const [soilType, setSoilType] = useState<string>("Loam");
	const [loading, setLoading] = useState<boolean>(false);
	const [result, setResult] = useState<any>(null);
	const [nasaData, setNasaData] = useState<any>(null);

	const mapCenter = useMemo<LatLngExpression>(() => [lat, lon], [lat, lon]);

	const handleLocationSelect = useCallback((selectedLat: number, selectedLng: number) => {
		setLat(selectedLat);
		setLon(selectedLng);
	}, []);

	const fetchNasa = useCallback(async () => {
		const params = new URLSearchParams({ lat: String(lat), lon: String(lon), dataset: "comprehensive" });
		const res = await fetch(`/api/nasaData?${params.toString()}`);
		const data = await res.json();
		setNasaData(data);
		return data;
	}, [lat, lon]);

	const runSim = useCallback(async () => {
		setLoading(true);
		try {
			await fetchNasa();
			const res = await fetch("/api/simulate", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					irrigationMmPerDay: irrigation,
					fertilizerKgPerHa: fertilizer,
					livestockDensityPerHa: livestock,
					cropType: cropType,
					soilType: soilType,
				}),
			});
			const data = await res.json();
			setResult(data);
		} finally {
			setLoading(false);
		}
	}, [fertilizer, irrigation, livestock, cropType, soilType, fetchNasa]);

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Farming Simulator</h1>
				<p className={styles.subtitle}>Click on the map to select a location, adjust farming parameters, and run simulations with NASA data.</p>
			</div>
			
			<div className={styles.grid}>
				<div className={styles.panel}>
					<h3 className={styles.panelTitle}>Location Selection</h3>
					<div className={styles.locationInputs}>
						<div className={styles.inputGroup}>
							<label>Latitude</label>
							<input 
								type="number" 
								value={lat} 
								onChange={(e) => setLat(Number(e.target.value))}
								step="0.0001"
							/>
						</div>
						<div className={styles.inputGroup}>
							<label>Longitude</label>
							<input 
								type="number" 
								value={lon} 
								onChange={(e) => setLon(Number(e.target.value))}
								step="0.0001"
							/>
						</div>
					</div>
					<div className={styles.mapContainer}>
						<LeafletMap center={mapCenter} zoom={6} onLocationSelect={handleLocationSelect} />
					</div>
				</div>

				<div className={styles.panel}>
					<h3 className={styles.panelTitle}>Farm Setup</h3>
					
					<div className={styles.controlGroup}>
						<label>Crop Type</label>
						<select value={cropType} onChange={(e) => setCropType(e.target.value)} className={styles.select}>
							<option value="Corn">Corn</option>
							<option value="Wheat">Wheat</option>
							<option value="Soybeans">Soybeans</option>
							<option value="Rice">Rice</option>
						</select>
					</div>

					<div className={styles.controlGroup}>
						<label>Soil Type</label>
						<select value={soilType} onChange={(e) => setSoilType(e.target.value)} className={styles.select}>
							<option value="Loam">Loam (Best)</option>
							<option value="Clay">Clay</option>
							<option value="Sand">Sandy</option>
							<option value="Silt">Silty</option>
						</select>
					</div>

					<div className={styles.controlGroup}>
						<label>Daily Irrigation: {irrigation}mm/day</label>
						<input 
							type="range" 
							min={0} 
							max={15} 
							step={1} 
							value={irrigation} 
							onChange={(e) => setIrrigation(Number(e.target.value))}
							className={styles.slider}
						/>
						<div className={styles.tip}>
							{irrigation < 3 ? "⚠️ Low irrigation - crops may suffer" : 
							 irrigation > 8 ? "⚠️ High irrigation - water waste risk" : 
							 "✅ Good irrigation level"}
						</div>
					</div>

					<div className={styles.controlGroup}>
						<label>Fertilizer: {fertilizer}kg per hectare</label>
						<input 
							type="range" 
							min={0} 
							max={40} 
							step={5} 
							value={fertilizer} 
							onChange={(e) => setFertilizer(Number(e.target.value))}
							className={styles.slider}
						/>
						<div className={styles.tip}>
							{fertilizer < 10 ? "⚠️ Low fertilizer - consider soil test" : 
							 fertilizer > 25 ? "⚠️ High fertilizer - runoff risk" : 
							 "✅ Moderate fertilizer use"}
						</div>
					</div>

					<div className={styles.controlGroup}>
						<label>Livestock: {livestock} animals per hectare</label>
						<input 
							type="range" 
							min={0} 
							max={8} 
							step={1} 
							value={livestock} 
							onChange={(e) => setLivestock(Number(e.target.value))}
							className={styles.slider}
						/>
						<div className={styles.tip}>
							{livestock === 0 ? "No livestock - focus on crops only" :
							 livestock > 4 ? "⚠️ High density - soil compaction risk" : 
							 "✅ Good livestock density"}
						</div>
					</div>

					<button onClick={runSim} disabled={loading} className={styles.button}>
						{loading ? "Analyzing..." : "Run Analysis"}
					</button>
					<Link href="/results" className={styles.link}>
						View Results
					</Link>
				</div>

				<div className={styles.panel}>
					<h3 className={styles.panelTitle}>Results</h3>
					{result ? (
						<div className={styles.results}>
							<div className={styles.scoreGrid}>
								<div className={styles.scoreCard}>
									<div className={styles.scoreLabel}>Crop Yield</div>
									<div className={styles.scoreValue}>{result.yieldScore}</div>
									<div className={styles.scoreDesc}>Expected harvest</div>
								</div>
								<div className={styles.scoreCard}>
									<div className={styles.scoreLabel}>Soil Health</div>
									<div className={styles.scoreValue}>{result.soilHealthScore}</div>
									<div className={styles.scoreDesc}>Long-term fertility</div>
								</div>
								<div className={styles.scoreCard}>
									<div className={styles.scoreLabel}>Water Efficiency</div>
									<div className={styles.scoreValue}>{result.waterEfficiencyScore}</div>
									<div className={styles.scoreDesc}>Irrigation optimization</div>
								</div>
								<div className={styles.scoreCard}>
									<div className={styles.scoreLabel}>Sustainability</div>
									<div className={styles.scoreValue}>{result.sustainabilityScore}</div>
									<div className={styles.scoreDesc}>Environmental impact</div>
								</div>
							</div>

							{nasaData && (
								<div className={styles.nasaInfo}>
									<h4>NASA Weather Data</h4>
									<div className={styles.weatherGrid}>
										<div className={styles.weatherItem}>
											<span>Temperature:</span> {nasaData.data?.power?.temperature2m?.toFixed(1)}°C
										</div>
										<div className={styles.weatherItem}>
											<span>Rainfall:</span> {nasaData.data?.power?.precipitation?.toFixed(1)}mm
										</div>
										<div className={styles.weatherItem}>
											<span>Soil Moisture:</span> {(nasaData.data?.smap?.soilMoistureRootZone * 100)?.toFixed(1)}%
										</div>
										<div className={styles.weatherItem}>
											<span>Vegetation Health:</span> {nasaData.data?.modis?.ndvi > 0.7 ? "Excellent" : nasaData.data?.modis?.ndvi > 0.5 ? "Good" : "Poor"}
										</div>
									</div>
								</div>
							)}

							<div className={styles.farmerTips}>
								<h4>Farmer Tips</h4>
								<ul>
									{result.insights?.map((tip: string, i: number) => (
										<li key={i} className={styles.tipItem}>{tip}</li>
									))}
								</ul>
							</div>

							{result.recommendations && result.recommendations.length > 0 && (
								<div className={styles.recommendations}>
									<h4>Recommended Actions</h4>
									{result.recommendations.map((rec: any, i: number) => (
										<div key={i} className={styles.recommendation}>
											<div className={styles.recPriority}>{rec.priority}</div>
											<div className={styles.recAction}>{rec.action}</div>
											<div className={styles.recImpact}>{rec.impact}</div>
										</div>
									))}
								</div>
							)}
						</div>
					) : (
						<div className={styles.noResults}>
							<p>Click "Run Farm Analysis" to get personalized farming recommendations based on NASA satellite data and your farm setup.</p>
							{nasaData && (
								<div className={styles.nasaPreview}>
									<h4>Current Weather Conditions</h4>
									<p>Temperature: {nasaData.data?.power?.temperature2m?.toFixed(1)}°C</p>
									<p>Rainfall: {nasaData.data?.power?.precipitation?.toFixed(1)}mm</p>
									<p>Soil Moisture: {(nasaData.data?.smap?.soilMoistureRootZone * 100)?.toFixed(1)}%</p>
								</div>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}


