import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import thiefIcon from '../assets/Thief.png';
import places from '../assets/places.json';
import opencage from 'opencage-api-client';
import { Chart, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Position {
    lat: number;
    lng: number;
}

interface TheftArea {
    id: string;
    position: Position;
    intensity: number;
    state: string;
    district: string;
}

interface District {
    id: number;
    name: string;
    state: string;
}

interface StateConsumption {
    state: string;
    consumption: number;
    theft: number;
}

interface DistrictConsumption {
    name: string;
    consumption: number;
    theft: number;
}

interface DistrictTheft {
    name: string;
    state: string;
    theft: number;
    position?: Position;
}

export default function ElectricityTheft() {
    const navigate = useNavigate();
    const location = useLocation();
    const mapRef = useRef<L.Map | null>(null);
    const chartRef = useRef<HTMLDivElement>(null);
    const [thiefPosition, setThiefPosition] = useState<Position>({
        lat: 20.5937,
        lng: 78.9629
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState(''); // Add this to track the actual selected district
    const [suggestions, setSuggestions] = useState<District[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [theftAreas, setTheftAreas] = useState<TheftArea[]>([]);
    const [stateConsumption, setStateConsumption] = useState<StateConsumption[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const thiefMarkerRef = useRef<L.Marker | null>(null);
    const theftAreaMarkersRef = useRef<L.Circle[]>([]);
    const intensityIntervalRef = useRef<number>(0);
    const consumptionIntervalRef = useRef<number>(0);
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [districtData, setDistrictData] = useState<DistrictConsumption[]>([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const districtChartRef = useRef<HTMLDivElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [allDistrictThefts, setAllDistrictThefts] = useState<DistrictTheft[]>([]);
    //@ts-ignore
    const [affectedDistricts, setAffectedDistricts] = useState<TheftArea[]>([]);
    const stateMarkersRef = useRef<{ [key: string]: L.LayerGroup }>({});

    // Initialize state consumption data
    useEffect(() => {
        const initialData = places.states.map(state => ({
            state: state.state,
            consumption: Math.random() * 1000 + 500, // Random base consumption
            theft: 0
        }));
        setStateConsumption(initialData);
    }, []);

    const moveThief = (lat: number, lng: number, state: string, districtName: string) => {
        if (!mapRef.current) return;

        const newPosition = { lat, lng };
        setThiefPosition(newPosition);
        
        if (thiefMarkerRef.current) {
            thiefMarkerRef.current.setLatLng([lat, lng]);
        }

        // Zoom out to show the entire South Asia region
        mapRef.current.flyTo([20.5937, 78.9629], 5, {
            duration: 2 // 2 seconds for smooth zoom animation
        });

        // Generate random theft value between 50 and 100 MW
        const theftValue = Math.floor(Math.random() * 51) + 50; // Random number between 50 and 100

        const newTheftArea: TheftArea = {
            id: Date.now().toString(),
            position: newPosition,
            intensity: 0.1,
            state,
            district: districtName
        };
        
        setTheftAreas(prev => [...prev, newTheftArea]);
        setAffectedDistricts(prev => [...prev, newTheftArea]);

        // Update all district thefts
        setAllDistrictThefts(prev => {
            const existingTheft = prev.find(t => t.name === districtName && t.state === state);
            if (existingTheft) {
                return prev.map(t =>
                    t.name === districtName && t.state === state
                        ? { ...t, theft: t.theft + theftValue, position: newPosition }
                        : t
                );
            }
            return [...prev, { name: districtName, state, theft: theftValue, position: newPosition }];
        });

        // Update district data if we're currently viewing the affected state
        if (selectedState === state) {
            setDistrictData(prev => {
                const districtExists = prev.some(d => d.name === districtName);
                
                if (districtExists) {
                    return prev.map(district => {
                        if (district.name === districtName) {
                            return {
                                ...district,
                                theft: (district.theft || 0) + theftValue
                            };
                        }
                        return district;
                    });
                } else {
                    // Add new district if it doesn't exist
                    return [...prev, {
                        name: districtName,
                        consumption: Math.random() * 500 + 200,
                        theft: theftValue
                    }];
                }
            });
        }

        const circle = L.circle([lat, lng], {
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.1,
            radius: 10000
        }).bindPopup(`<b>${districtName}</b><br>State: ${state}<br>Theft: ${theftValue} MW`).addTo(mapRef.current);
        
        theftAreaMarkersRef.current.push(circle);

        // Animate circle intensity
        let currentIntensity = 0.1;
        intensityIntervalRef.current = window.setInterval(() => {
            currentIntensity += 0.01;
            if (currentIntensity >= 0.8) {
                clearInterval(intensityIntervalRef.current);
            }
            circle.setStyle({
                fillOpacity: currentIntensity
            });
        }, 100);

        // Animate consumption increase
        const stateIndex = stateConsumption.findIndex(s => s.state === state);
        if (stateIndex !== -1) {
            const targetTheft = stateConsumption[stateIndex].theft + theftValue;
            let currentTheft = stateConsumption[stateIndex].theft;
            
            consumptionIntervalRef.current = window.setInterval(() => {
                currentTheft += 1;
                if (currentTheft >= targetTheft) {
                    clearInterval(consumptionIntervalRef.current);
                }
                setStateConsumption(prev => {
                    const newData = [...prev];
                    newData[stateIndex] = {
                        ...newData[stateIndex],
                        theft: currentTheft
                    };
                    return newData;
                });
            }, 50);
        }
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        if (value.length > 2) {
            const allDistricts = places.states.flatMap(state =>
                state.districts.map(district => ({
                    ...district,
                    state: state.state
                }))
            );
            const filtered = allDistricts.filter(district =>
                district.name.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const getCoordinates = async (district: District) => {
        try {
            const query = `${district.name}, ${district.state}, India`;
            const response = await opencage.geocode({
                q: query,
                key: import.meta.env.VITE_GEOLOCATION_API
            });

            if (response.results && response.results.length > 0) {
                const { lat, lng } = response.results[0].geometry;
                return { lat, lng };
            }
            throw new Error('No results found');
        } catch (error) {
            console.error('Error fetching coordinates:', error);
            return null;
        }
    };

    const handleSelectDistrict = async (district: District) => {
        // Update both searchTerm and selectedDistrict with the full district name
        setSearchTerm(district.name);
        setSelectedDistrict(district.name);
        setShowSuggestions(false);
        setIsLoading(true);
        setIsAnalyzing(true);
        setAnalysisProgress(0);
        
        try {
            const coordinates = await getCoordinates(district);
            if (coordinates) {
                // Zoom to the selected location
                if (mapRef.current) {
                    mapRef.current.flyTo([coordinates.lat, coordinates.lng], 10, {
                        duration: 2 // 2 seconds for zoom animation
                    });
                }
                moveThief(coordinates.lat, coordinates.lng, district.state, district.name);
            } else {
                moveThief(20.5937, 78.9629, district.state, district.name);
            }

            // Start analysis progress
            const startTime = Date.now();
            const analysisDuration = 10000; // 10 seconds

            const progressInterval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min((elapsed / analysisDuration) * 100, 100);
                setAnalysisProgress(progress);

                if (elapsed >= analysisDuration) {
                    clearInterval(progressInterval);
                    setIsAnalyzing(false);
                    setIsLoading(false);

                    // Scroll to chart after analysis
                    setTimeout(() => {
                        if (chartRef.current) {
                            chartRef.current.scrollIntoView({ behavior: 'smooth' });
                        }
                    }, 500);
                }
            }, 100);
        } catch (error) {
            console.error('Error:', error);
            setIsLoading(false);
            setIsAnalyzing(false);
        }
    };

    // Clear previous markers and show theft areas for the selected state
    const showStateTheftMarkers = (state: string) => {
        // Clear any existing state-specific markers
        Object.values(stateMarkersRef.current).forEach(group => {
            if (mapRef.current) {
                mapRef.current.removeLayer(group);
            }
        });

        // Create a new layer group for this state
        const stateLayer = L.layerGroup();
        stateMarkersRef.current[state] = stateLayer;

        // Get all theft areas for this state and add markers
        const stateThefts = allDistrictThefts.filter(theft => theft.state === state);

        stateThefts.forEach(theft => {
            if (theft.position) {
                const marker = L.circle([theft.position.lat, theft.position.lng], {
                    color: 'purple',
                    fillColor: 'purple',
                    fillOpacity: 0.5,
                    radius: 15000
                }).bindPopup(`<b>${theft.name}</b><br>Theft: ${theft.theft} MW`);

                stateLayer.addLayer(marker);
            }
        });

        // Add the layer group to the map
        if (mapRef.current) {
            stateLayer.addTo(mapRef.current);

            // If we have districts with positions, fit the map to show them all
            if (stateThefts.length > 0 && stateThefts.some(t => t.position)) {
                const bounds = stateThefts
                    .filter(t => t.position)
                    .map(t => [t.position!.lat, t.position!.lng]);

                if (bounds.length > 0) {
                    mapRef.current.fitBounds(bounds as L.LatLngBoundsExpression);
                }
            }
        }
    };

    const handleStateClick = async (state: string) => {
        setSelectedState(state);
        setIsLoadingDistricts(true);
        navigate(`/electricity-theft?state=${encodeURIComponent(state)}`);

        // Show markers for this state
        showStateTheftMarkers(state);

        // Get all districts from the state
        const stateDistricts = places.states
            .find(s => s.state === state)?.districts || [];

        // Find theft data for these districts
        setTimeout(() => {
            const districtConsumption = stateDistricts.map(district => {
                const theftData = allDistrictThefts.find(t =>
                    t.name === district.name && t.state === state
                );

                return {
                    name: district.name,
                    consumption: Math.random() * 500 + 200,
                    theft: theftData?.theft || 0
                };
            });

            // Add additional districts with thefts that might not be in the original list
            const extraTheftDistricts = allDistrictThefts
                .filter(t => t.state === state)
                .filter(t => !stateDistricts.some(d => d.name === t.name));

            const extraConsumption = extraTheftDistricts.map(district => ({
                name: district.name,
                consumption: Math.random() * 500 + 200,
                theft: district.theft
            }));

            setDistrictData([...districtConsumption, ...extraConsumption]);
            setIsLoadingDistricts(false);

            if (districtChartRef.current) {
                districtChartRef.current.scrollIntoView({ behavior: 'smooth' });
            }
        }, 2000);
    };

    const chartData = {
        labels: stateConsumption.map(state => state.state),
        datasets: [
            {
                label: 'Normal Consumption',
                data: stateConsumption.map(state => state.consumption),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Theft Consumption',
                data: stateConsumption.map(state => state.theft),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#333',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                boxPadding: 4,
                usePointStyle: true,
                callbacks: {
                    label: function (context: any) {
                        return `${context.dataset.label}: ${context.raw} MW`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    padding: 8
                },
                title: {
                    display: true,
                    text: 'Electricity Consumption (MW)',
                    color: '#333',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    padding: { top: 10, bottom: 10 }
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666',
                    font: {
                        size: 11,
                        family: "'Inter', sans-serif"
                    },
                    maxRotation: 45,
                    minRotation: 45
                },
                title: {
                    display: true,
                    text: 'States',
                    color: '#333',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif",
                        weight: '500'
                    },
                    padding: { top: 10 }
                }
            }
        },
        interaction: {
            mode: 'index' as const,
            intersect: false
        }
    };

    const districtChartData = {
        labels: districtData.map(district => district.name),
        datasets: [
            {
                label: 'Normal Consumption',
                data: districtData.map(district => district.consumption),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Theft Consumption',
                data: districtData.map(district => district.theft),
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const districtChartOptions = {
        ...chartOptions,
        // @ts-ignore
        onClick: (event: any, elements: any) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                const districtName = districtData[index].name;
                handleSearch(districtName);
            }
        }
    };

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map').setView([20.5937, 78.9629], 5);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(mapRef.current);

            const customIcon = L.icon({
                iconUrl: thiefIcon,
                iconSize: [32, 32],
                iconAnchor: [16, 16]
            });

            thiefMarkerRef.current = L.marker([20.5937, 78.9629], { icon: customIcon })
                .addTo(mapRef.current)
                .bindPopup('Electricity Thief');
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            if (intensityIntervalRef.current) {
                clearInterval(intensityIntervalRef.current);
            }
            if (consumptionIntervalRef.current) {
                clearInterval(consumptionIntervalRef.current);
            }
        };
    }, []);

    // Add effect to handle URL state
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const stateParam = params.get('state');
        if (stateParam) {
            setSelectedState(stateParam);
            showStateTheftMarkers(stateParam);
            // Load district data for the state from URL
            const stateDistricts = places.states.find(s => s.state === stateParam)?.districts || [];
            const districtConsumption = stateDistricts.map(district => {
                const theftData = allDistrictThefts.find(t =>
                    t.name === district.name && t.state === stateParam
                );
                return {
                    name: district.name,
                    consumption: Math.random() * 500 + 200,
                    theft: theftData?.theft || 0
                };
            });
            setDistrictData(districtConsumption);
        }
    }, [location.search]);

    return (
        <div className="flex flex-col items-center p-4">
            <div className="flex justify-between w-full mb-4">
                <h1 className="text-2xl font-bold">Electricity Theft Detection</h1>
                <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Back to Home
                </button>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <div className="flex gap-4 w-full">
                    <div className="w-1/3 bg-gray-100 p-4 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Control Panel</h2>
                        <div className="bg-white p-4 rounded shadow space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium mb-1">Search District:</label>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Type district name..."
                                    disabled={isLoading}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg">
                                        {suggestions.map((district) => (
                                            <div
                                                key={district.id}
                                                className="p-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleSelectDistrict(district)}
                                            >
                                                {district.name}, {district.state}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-4">
                                <h3 className="font-medium">Current Location:</h3>
                                <p>District: {selectedDistrict || 'Not selected'}</p>
                                <p>Lat: {thiefPosition.lat.toFixed(4)}</p>
                                <p>Lng: {thiefPosition.lng.toFixed(4)}</p>
                                <p className="mt-2">Areas Affected: {theftAreas.length}</p>
                            </div>
                            {isAnalyzing && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-600 font-medium">Analyzing theft pattern...</span>
                                        <span className="text-blue-600">{Math.round(analysisProgress)}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                                            style={{ width: `${analysisProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            {selectedState && (
                                <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                                    <h3 className="font-medium text-purple-800">Viewing: {selectedState}</h3>
                                    <p className="text-sm text-purple-700">
                                        {allDistrictThefts.filter(t => t.state === selectedState).length}
                                        {' '}affected districts detected
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="w-2/3">
                        <div id="map" className="h-[400px] rounded-lg shadow-lg relative z-0"></div>
                    </div>
                </div>

                <div ref={chartRef} className="w-full bg-white p-4 rounded-lg shadow-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">State-wise Electricity Consumption</h2>
                    <div className="h-[300px]">
                        <Line
                            data={chartData}
                            // @ts-ignore
                            options={{
                                ...chartOptions,
                                // @ts-ignore
                                onClick: (event: any, elements: any) => {
                                    if (elements.length > 0) {
                                        const index = elements[0].index;
                                        const stateName = stateConsumption[index].state;
                                        handleStateClick(stateName);
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {selectedState && (
                    <div ref={districtChartRef} className="w-full bg-white p-4 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            District-wise Consumption in {selectedState}
                            {isLoadingDistricts && (
                                <span className="ml-2 text-sm text-blue-600">Loading district data...</span>
                            )}
                        </h2>
                        {!isLoadingDistricts ? (
                            <>
                                <div className="h-[300px]">
                                    {/* @ts-ignore */}
                                    <Line data={districtChartData} options={districtChartOptions} />
                                </div>
                                {districtData.some(d => d.theft > 0) && (
                                    <div className="mt-4 p-3 bg-red-50 rounded border border-red-200">
                                        <h3 className="font-medium text-red-800 mb-2">Affected Districts</h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {districtData
                                                .filter(d => d.theft > 0)
                                                .map((district, idx) => (
                                                    <div key={idx} className="p-2 bg-white rounded shadow-sm">
                                                        <p className="font-medium">{district.name}</p>
                                                        <p className="text-sm text-red-600">Theft: {district.theft} MW</p>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center">
                                <div className="animate-pulse text-gray-400">Analyzing district data...</div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}