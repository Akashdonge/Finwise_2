import React, { useState, useEffect } from 'react';
import {
    TrendingUp,
    DollarSign,
    Target,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Users,
    MapPin
} from 'lucide-react';
import axios from 'axios';
import DynamicNavbar from './DynamicNavbar'; // Import the new navbar

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalSavings: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        investments: 0,
        goals: [],
        recentTransactions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch family profile data
            const familyResponse = await axios.get('http://localhost:8080/api/familyProfile', {
                withCredentials: true
            });

            if (familyResponse.data && familyResponse.data.length > 0) {
                const familyProfile = familyResponse.data[0];
                setDashboardData(prev => ({
                    ...prev,
                    monthlyIncome: familyProfile.monthlyIncome,
                    monthlyExpenses: familyProfile.monthlyExpenses,
                    totalSavings: familyProfile.monthlyIncome - familyProfile.monthlyExpenses
                }));
            }

            // Fetch other dashboard data (investments, goals, etc.)
            // Add your other API calls here

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950">
                <DynamicNavbar />
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            {/* Replace the old navbar with DynamicNavbar */}
            <DynamicNavbar />

            {/* Main Dashboard Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Dashboard Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Financial Dashboard</h1>
                    <p className="text-gray-300">Track your financial progress and manage your goals</p>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Savings Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <DollarSign className="text-emerald-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-emerald-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Savings</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{dashboardData.totalSavings.toLocaleString()}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">
                            +12% from last month
                        </p>
                    </div>

                    {/* Monthly Income Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <TrendingUp className="text-blue-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Income</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{dashboardData.monthlyIncome.toLocaleString()}
                        </p>
                        <p className="text-blue-400 text-sm mt-1">
                            Stable income
                        </p>
                    </div>

                    {/* Monthly Expenses Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <ArrowDownRight className="text-red-400" size={24} />
                            </div>
                            <ArrowDownRight className="text-red-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Expenses</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{dashboardData.monthlyExpenses.toLocaleString()}
                        </p>
                        <p className="text-red-400 text-sm mt-1">
                            -5% from last month
                        </p>
                    </div>

                    {/* Investment Portfolio Card */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <PieChart className="text-purple-400" size={24} />
                            </div>
                            <ArrowUpRight className="text-purple-400" size={20} />
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Investments</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{dashboardData.investments.toLocaleString()}
                        </p>
                        <p className="text-purple-400 text-sm mt-1">
                            +8% portfolio growth
                        </p>
                    </div>
                </div>

                {/* Charts and Goals Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Spending Chart */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4">Monthly Spending Breakdown</h3>
                        <div className="h-64 flex items-center justify-center text-gray-400">
                            <p>Chart will be implemented here</p>
                        </div>
                    </div>

                    {/* Financial Goals */}
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4">Financial Goals</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Target className="text-emerald-400" size={20} />
                                    <div>
                                        <p className="text-white font-medium">Emergency Fund</p>
                                        <p className="text-gray-400 text-sm">₹50,000 / ₹100,000</p>
                                    </div>
                                </div>
                                <div className="text-emerald-400 font-semibold">50%</div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Target className="text-blue-400" size={20} />
                                    <div>
                                        <p className="text-white font-medium">Vacation Fund</p>
                                        <p className="text-gray-400 text-sm">₹25,000 / ₹75,000</p>
                                    </div>
                                </div>
                                <div className="text-blue-400 font-semibold">33%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <DollarSign className="text-emerald-400" size={16} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Salary Credited</p>
                                    <p className="text-gray-400 text-sm">Today, 9:30 AM</p>
                                </div>
                            </div>
                            <div className="text-emerald-400 font-semibold">+₹75,000</div>
                        </div>

                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <ArrowDownRight className="text-red-400" size={16} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Grocery Shopping</p>
                                    <p className="text-gray-400 text-sm">Yesterday, 6:15 PM</p>
                                </div>
                            </div>
                            <div className="text-red-400 font-semibold">-₹3,500</div>
                        </div>

                        <div className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <PieChart className="text-blue-400" size={16} />
                                </div>
                                <div>
                                    <p className="text-white font-medium">Investment Purchase</p>
                                    <p className="text-gray-400 text-sm">2 days ago, 2:30 PM</p>
                                </div>
                            </div>
                            <div className="text-blue-400 font-semibold">-₹10,000</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;