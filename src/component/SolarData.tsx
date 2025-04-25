import { useState, useRef, useEffect } from 'react';
import { Input } from '../component/ui/input';
import { Card } from '../component/ui/card';
import places from '../assets/places.json';
import opencage from 'opencage-api-client';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface District {
    id: number;
    name: string;
    state: string;
    lat?: number;
    lng?: number;
}

interface WeatherData {
    temperature: number;
    humidity: number;
    windSpeed: number;
    solarRadiation: number;
    condition: string;
    icon: string;
    date: string;
}

interface EnergyData {
    consumption: number;
    generation: number;
    efficiency: number;
    peakHours: string;
    status: string;
}

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        tension: number;
    }[];
}

interface PieChartData {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

export default function SolarData() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
    const [suggestions, setSuggestions] = useState<District[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Generate random weather data
    const generateWeatherData = (date: string): WeatherData => {
        const conditions = [
            { name: 'Sunny', icon: '☀️' },
            { name: 'Partly Cloudy', icon: '⛅' },
            { name: 'Cloudy', icon: '☁️' },
            { name: 'Rainy', icon: '🌧️' },
            { name: 'Thunderstorm', icon: '⛈️' }
        ];
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        
        return {
            temperature: Math.floor(Math.random() * 30) + 20, // 20-50°C
            humidity: Math.floor(Math.random() * 50) + 30, // 30-80%
            windSpeed: Number((Math.random() * 20).toFixed(1)), // 0-20 km/h
            solarRadiation: Math.floor(Math.random() * 800) + 200, // 200-1000 W/m²
            condition: condition.name,
            icon: condition.icon,
            date: date
        };
    };

    // Generate random energy data
    const generateEnergyData = (): EnergyData => {
        const statuses = ['Optimal', 'Good', 'Fair', 'Poor'];
        return {
            consumption: Math.floor(Math.random() * 500) + 100, // 100-600 kWh
            generation: Math.floor(Math.random() * 400) + 200, // 200-600 kWh
            efficiency: Number((Math.random() * 20 + 80).toFixed(1)), // 80-100%
            peakHours: `${Math.floor(Math.random() * 12) + 1}:00 - ${Math.floor(Math.random() * 12) + 1}:00`,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        };
    };

    // Generate sample data for 8 cards with dates
    const generateSampleData = () => {
        const today = new Date();
        return Array(8).fill(null).map((_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() + index);
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
            
            return {
                id: index + 1,
                weather: generateWeatherData(formattedDate),
                energy: generateEnergyData()
            };
        });
    };

    const sampleData = generateSampleData();

    // Generate chart data
    const generateChartData = (): ChartData => {
        const labels = sampleData.map(data => data.weather.date);
        return {
            labels,
            datasets: [
                {
                    label: 'Solar Radiation (W/m²)',
                    data: sampleData.map(data => data.weather.solarRadiation),
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.5)',
                    tension: 0.4
                },
                {
                    label: 'Energy Generation (kWh)',
                    data: sampleData.map(data => data.energy.generation),
                    borderColor: 'rgb(53, 162, 235)',
                    backgroundColor: 'rgba(53, 162, 235, 0.5)',
                    tension: 0.4
                }
            ]
        };
    };

    const chartData = generateChartData();

    // Generate pie chart data for 5-day periods
    const generatePieChartData = (startIndex: number): PieChartData => {
        const periodData = sampleData.slice(startIndex, startIndex + 5);
        return {
            labels: periodData.map(data => data.weather.date),
            datasets: [{
                data: periodData.map(data => data.weather.solarRadiation),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        };
    };

    const pieChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right' as const,
                labels: {
                    color: '#333',
                    font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    }
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
                boxPadding: 4
            }
        }
    };

    // Generate data for three pie charts
    const pieChart1Data = generatePieChartData(0);
    const pieChart2Data = generatePieChartData(3);
    const pieChart3Data = generatePieChartData(6);

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
                        family: "'Inter', sans-serif"
                    }
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
                boxPadding: 4
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                },
                ticks: {
                    color: '#666'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#666'
                }
            }
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

    const handleSelectDistrict = async (district: District) => {
        setSelectedDistrict(district);
        setSearchTerm(district.name);
        setShowSuggestions(false);
        setIsLoading(true);

        try {
            const coordinates = await getCoordinates(district);
            if (coordinates) {
                setSelectedDistrict({
                    ...district,
                    lat: coordinates.lat,
                    lng: coordinates.lng
                });
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Optimal': return 'text-green-600 bg-green-50';
            case 'Good': return 'text-blue-600 bg-blue-50';
            case 'Fair': return 'text-yellow-600 bg-yellow-50';
            case 'Poor': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftScroll(scrollLeft > 0);
            setShowRightScroll(scrollLeft < scrollWidth - clientWidth);
        }
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            handleScroll(); // Initial check
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Solar Data Analysis</h1>
            
            <div className="flex flex-col gap-8">
                {/* Search Section */}
                <div className="w-full">
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder="Search district..."
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full p-4 text-lg"
                        />
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg">
                                {suggestions.map((district) => (
                                    <div
                                        key={district.id}
                                        className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                        onClick={() => handleSelectDistrict(district)}
                                    >
                                        <div className="font-medium">{district.name}</div>
                                        <div className="text-sm text-gray-500">{district.state}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Info Section */}
                <div className="w-full">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">Location Information</h2>
                        {isLoading ? (
                            <div className="text-gray-500">Loading coordinates...</div>
                        ) : selectedDistrict ? (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-gray-600">District:</span>
                                    <span className="ml-2 font-medium">{selectedDistrict.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">State:</span>
                                    <span className="ml-2 font-medium">{selectedDistrict.state}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Latitude:</span>
                                    <span className="ml-2 font-medium">{selectedDistrict.lat?.toFixed(4) || 'Not available'}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Longitude:</span>
                                    <span className="ml-2 font-medium">{selectedDistrict.lng?.toFixed(4) || 'Not available'}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-500">
                                Select a district to view location information
                            </div>
                        )}
                    </Card>
                </div>

                {/* Weather and Energy Cards */}
                <div className="w-full">
                    <h2 className="text-2xl font-semibold mb-6">Solar Performance Overview</h2>
                    <div className="relative">
                        {showLeftScroll && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-r-lg p-2 shadow-lg">
                                <span className="text-2xl">←</span>
                            </div>
                        )}
                        <div 
                            ref={scrollContainerRef}
                            className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {sampleData.map((data) => (
                                <Card key={data.id} className="min-w-[300px] snap-start p-6 hover:shadow-lg transition-shadow duration-300">
                                    <div className="flex flex-col h-full">
                                        {/* Date Header */}
                                        <div className="mb-4 pb-2 border-b border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-700">{data.weather.date}</h3>
                                        </div>
                                        
                                        {/* Weather Section */}
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Weather</h3>
                                                <span className="text-3xl">{data.weather.icon}</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Temp:</span>
                                                    <span className="font-medium">{data.weather.temperature}°C</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Humidity:</span>
                                                    <span className="font-medium">{data.weather.humidity}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Wind:</span>
                                                    <span className="font-medium">{data.weather.windSpeed} km/h</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Radiation:</span>
                                                    <span className="font-medium">{data.weather.solarRadiation} W/m²</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Energy Section */}
                                        <div className="mt-auto">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold">Energy</h3>
                                                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(data.energy.status)}`}>
                                                    {data.energy.status}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Consumption:</span>
                                                    <span className="font-medium">{data.energy.consumption} kWh</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Generation:</span>
                                                    <span className="font-medium">{data.energy.generation} kWh</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Efficiency:</span>
                                                    <span className="font-medium">{data.energy.efficiency}%</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Peak Hours:</span>
                                                    <span className="font-medium">{data.energy.peakHours}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                        {showRightScroll && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm rounded-l-lg p-2 shadow-lg">
                                <span className="text-2xl">→</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Line Chart Section */}
                <div className="w-full mt-8">
                    <h2 className="text-2xl font-semibold mb-6">Solar Performance Trends</h2>
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="h-[400px]">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                {/* Pie Charts Section */}
                <div className="w-full mt-8">
                    <h2 className="text-2xl font-semibold mb-6">5-Day Solar Radiation Analysis</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* First 5 Days */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Days 1-5</h3>
                            <div className="h-[300px]">
                                <Pie data={pieChart1Data} options={pieChartOptions} />
                            </div>
                        </div>

                        {/* Middle 5 Days */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Days 4-8</h3>
                            <div className="h-[300px]">
                                <Pie data={pieChart2Data} options={pieChartOptions} />
                            </div>
                        </div>

                        {/* Last 5 Days */}
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h3 className="text-lg font-semibold mb-4">Days 6-10</h3>
                            <div className="h-[300px]">
                                <Pie data={pieChart3Data} options={pieChartOptions} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
