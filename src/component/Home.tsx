import { Button } from './ui/button';
import { Card } from './ui/card';

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-500">
                            Smarter Grids. Cleaner Energy. Real-Time Optimization.
                        </h1>
                        <p className="text-xl text-gray-600 mb-8">
                            Welcome to IntelliGrid – a powerful AI-powered smart grid platform that transforms the way electricity is distributed. Optimize demand, reduce waste, and integrate renewable energy like never before.
                        </p>
                        <div className="flex items-center justify-center gap-4 mb-8">
                            <span className="text-2xl">⚡</span>
                            <p className="text-lg text-gray-700">
                                Empowering the future of energy through intelligent automation.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                Request a Demo
                            </Button>
                            <Button className="px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 border border-blue-600 rounded-lg">
                                See How It Works
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center">What We Do</h2>
                        <p className="text-lg text-gray-600 text-center">
                            We help governments and power authorities modernize their energy grids using artificial intelligence. IntelliGrid analyzes real-time data to forecast demand, integrate renewables, detect faults, and reduce energy wastage — all from one intelligent dashboard.
                        </p>
                    </div>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center">About Us</h2>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h3 className="text-2xl font-semibold mb-4">Who We Are</h3>
                                <p className="text-gray-600 mb-4">
                                    We are a team of passionate college students who came together for a hackathon with a shared vision: to revolutionize energy management through technology. Our diverse backgrounds in computer science, electrical engineering, and data science fuel our innovative approach to solving real-world problems.
                                </p>
                                <p className="text-gray-600">
                                    What started as a hackathon project has evolved into IntelliGrid - a testament to what students can achieve when they combine their skills and passion for making a difference. We're not just building software; we're creating solutions that could shape the future of energy management.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-semibold mb-4">Our Hackathon Journey</h3>
                                <p className="text-gray-600">
                                    During our hackathon, we identified a critical challenge in modern energy management: the need for smarter, more efficient grid systems. Traditional power grids are struggling to keep up with increasing demand and the integration of renewable energy sources.
                                </p>
                                <p className="text-gray-600 mt-4">
                                    We saw an opportunity to apply our technical skills to create a solution that could make a real impact. IntelliGrid was born from countless hours of coding, brainstorming, and collaboration - proving that student innovation can lead to meaningful technological advancements.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Innovative Solution Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-12 text-center">Our Innovative Solution</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-blue-600 text-4xl mb-4">🔷</div>
                            <h3 className="text-xl font-semibold mb-4">Real-Time Data Ingestion Module</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Integrates smart meters, IoT sensors, and weather data</li>
                                <li>• Captures consumption patterns and environmental factors</li>
                                <li>• Streams live data to the AI engine for immediate processing</li>
                            </ul>
                        </Card>
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-blue-600 text-4xl mb-4">🔷</div>
                            <h3 className="text-xl font-semibold mb-4">Grid Optimization Module</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Minimizes transmission losses</li>
                                <li>• Balances load with AI-driven automation</li>
                                <li>• Enables seamless integration of solar and wind energy</li>
                            </ul>
                        </Card>
                        <Card className="p-6 hover:shadow-lg transition-shadow">
                            <div className="text-blue-600 text-4xl mb-4">🔷</div>
                            <h3 className="text-xl font-semibold mb-4">Operator Dashboard</h3>
                            <ul className="space-y-2 text-gray-600">
                                <li>• Actionable insights for grid operators</li>
                                <li>• Instant alerts, visualizations, and control tools</li>
                                <li>• Remote access via secure cloud infrastructure</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Indra Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-8 text-center">Meet Indra: The Brain Behind IntelliGrid</h2>
                        <p className="text-lg text-gray-600 mb-8 text-center">
                            Indra is our proprietary AI/ML engine that powers the intelligence behind IntelliGrid. Named after the Vedic deity of lightning and storms, Indra sees patterns in chaos.
                        </p>
                        <div className="grid md:grid-cols-2 gap-8">
                            <Card className="p-6">
                                <h3 className="text-xl font-semibold mb-4">What Indra does:</h3>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Predicts electricity demand with high accuracy
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Detects faults and anomalies before they escalate
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Recommends optimal load balancing and rerouting
                                    </li>
                                    <li className="flex items-center">
                                        <span className="text-green-500 mr-2">✓</span>
                                        Enables dynamic pricing and renewable forecasting
                                    </li>
                                </ul>
                            </Card>
                            <div className="flex items-center justify-center">
                                <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white text-4xl">
                                    ⚡
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
                        <p className="text-lg text-gray-600">
                            We're here to reshape the future of energy — one smart grid at a time. Our mission is to deliver resilient, efficient, and eco-conscious energy systems that serve both people and the planet. Through AI, we unlock smarter decisions and sustainable outcomes for communities around the globe.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h3 className="text-2xl font-bold mb-4">IntelliGrid Technologies</h3>
                        <p className="text-gray-400 mb-6">Smart. Sustainable. Secure.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                            <a href="mailto:hello@intelligrid.ai" className="text-gray-400 hover:text-white">📧 hello@intelligrid.ai</a>
                            {/* <a href="https://www.intelligrid.ai" className="text-gray-400 hover:text-white">🌐 www.intelligrid.ai</a> */}
                            <span className="text-gray-400">📍 Ghaziabad, India</span>
                        </div>
                        <div className="flex justify-center gap-6">
                            <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-white">Terms of Use</a>
                            <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
                            <a href="#" className="text-gray-400 hover:text-white">Contact Us</a>
                        </div>
                        <p className="text-gray-500 mt-8">© IntelliGrid Technologies 2025</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
