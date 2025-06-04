import {useEffect, useState} from 'react';
import { ChevronRight, BarChart2, Shield, DollarSign, CreditCard, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export default function Landing() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        navigate('/login');
    };

    const handleRegister = () => {
        navigate('/register');
    };

    const handleJoinWaitlist = () => {
        if (email) {
            alert("Join waitlist with: " + email);
            setEmail('');
        } else {
            alert("Please enter your email address");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            {/* Navigation */}
            <nav className="flex justify-between items-center px-6 py-4 md:px-16 lg:px-24">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        <span className="text-emerald-400">Fin</span>Wise
                    </h1>
                </div>
                <div className="hidden md:flex space-x-8 text-gray-300">
                    <a href="#features" className="hover:text-emerald-400 transition">Features</a>
                    <a href="#testimonials" className="hover:text-emerald-400 transition">Testimonials</a>
                    <a href="#pricing" className="hover:text-emerald-400 transition">Pricing</a>
                </div>
                <div className="hidden md:flex space-x-4">
                    <button
                        onClick={handleLogin}
                        className="bg-transparent border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white px-5 py-2 rounded-lg font-medium transition"
                    >
                        Login
                    </button>
                    <button
                        onClick={handleRegister}
                        className="bg-emerald-500 hover:bg-emerald-600 px-5 py-2 rounded-lg font-medium transition"
                    >
                        Sign Up
                    </button>
                </div>
                <button className="md:hidden text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                </button>
            </nav>

            {/* Hero Section */}
            <div className="px-6 pt-16 pb-24 md:px-16 lg:px-24 lg:flex items-center justify-between">
                <div className="lg:w-1/2 lg:pr-12">
                    <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Smart Financial Planning
                        <span className="text-emerald-400"> for Everyone</span>
                    </h2>
                    <p className="text-gray-300 text-lg mb-8">
                        Take control of your finances with FinWise. Track expenses, set goals,
                        and make informed decisions with our intelligent financial platform.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                        <button
                            onClick={handleRegister}
                            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center"
                        >
                            Get Started Free
                            <ChevronRight className="ml-2 h-5 w-5"/>
                        </button>
                        <button
                            onClick={handleLogin}
                            className="bg-transparent border border-white/30 hover:border-white/50 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center"
                        >
                            Sign In
                        </button>
                    </div>

                    {/* Email Signup Section */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                        <h3 className="text-lg font-semibold mb-3">Join Our Waitlist</h3>
                        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button
                                onClick={handleJoinWaitlist}
                                className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg font-medium transition"
                            >
                                Join Waitlist
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Image/Illustration */}
                <div className="lg:w-1/2 mt-12 lg:mt-0">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-emerald-500/20 rounded-lg p-4 text-center">
                                <BarChart2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                                <p className="text-sm font-medium">Analytics</p>
                            </div>
                            <div className="bg-blue-500/20 rounded-lg p-4 text-center">
                                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                                <p className="text-sm font-medium">Security</p>
                            </div>
                            <div className="bg-purple-500/20 rounded-lg p-4 text-center">
                                <DollarSign className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                                <p className="text-sm font-medium">Savings</p>
                            </div>
                            <div className="bg-orange-500/20 rounded-lg p-4 text-center">
                                <CreditCard className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                                <p className="text-sm font-medium">Payments</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="px-6 py-24 md:px-16 lg:px-24">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Everything you need to manage your finances
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Our comprehensive platform provides all the tools you need to take control of your financial future.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: BarChart2,
                            title: "Smart Analytics",
                            description: "Get insights into your spending patterns and financial health with advanced analytics."
                        },
                        {
                            icon: Shield,
                            title: "Bank-Level Security",
                            description: "Your financial data is protected with enterprise-grade security and encryption."
                        },
                        {
                            icon: DollarSign,
                            title: "Goal Tracking",
                            description: "Set and track financial goals with personalized recommendations and progress monitoring."
                        },
                        {
                            icon: CreditCard,
                            title: "Expense Management",
                            description: "Categorize and track all your expenses automatically with smart categorization."
                        },
                        {
                            icon: Users,
                            title: "Family Planning",
                            description: "Plan for your family's financial future with education and marriage planning tools."
                        },
                        {
                            icon: BarChart2,
                            title: "Investment Tracking",
                            description: "Monitor your investments and get recommendations for portfolio optimization."
                        }
                    ].map((feature, index) => (
                        <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                            <feature.icon className="h-12 w-12 text-emerald-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                            <p className="text-gray-300">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="px-6 py-24 md:px-16 lg:px-24">
                <div className="bg-emerald-500/20 rounded-2xl p-12 text-center border border-emerald-500/30">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        Ready to take control of your finances?
                    </h2>
                    <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                        Join thousands of users who have already transformed their financial lives with FinWise.
                    </p>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                        <button
                            onClick={handleRegister}
                            className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-lg font-medium transition flex items-center justify-center"
                        >
                            Start Free Trial
                            <ChevronRight className="ml-2 h-5 w-5"/>
                        </button>
                        <button
                            onClick={handleLogin}
                            className="bg-transparent border border-white/30 hover:border-white/50 px-8 py-3 rounded-lg font-medium transition"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-6 py-12 md:px-16 lg:px-24 border-t border-white/20">
                <div className="text-center">
                    <h1 className="text-2xl font-bold tracking-tight mb-4">
                        <span className="text-emerald-400">Fin</span>Wise
                    </h1>
                    <p className="text-gray-400 mb-6">
                        Smart financial planning for everyone
                    </p>
                    <div className="flex justify-center space-x-6 text-gray-400">
                        <a href="#" className="hover:text-emerald-400 transition">Privacy Policy</a>
                        <a href="#" className="hover:text-emerald-400 transition">Terms of Service</a>
                        <a href="#" className="hover:text-emerald-400 transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
