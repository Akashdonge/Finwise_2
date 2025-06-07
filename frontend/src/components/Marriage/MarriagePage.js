import React, { useState, useEffect } from 'react';
import { User, Calendar, DollarSign, Heart, Edit3, Trash2, Target, Plus, X, Save } from 'lucide-react';
import DynamicNavbar from "../DynamicNavbar";

// API Configuration
const API_BASE_URL = 'https://finwise-backend-latest2.onrender.com';

// API service functions
const marriagePlanAPI = {
    async getAllPlans(familyProfileId) {
        const response = await fetch(`${API_BASE_URL}/api/marriage-plans/family/${familyProfileId}`);
        if (!response.ok) throw new Error('Failed to fetch plans');
        return response.json();
    },

    async createPlan(familyProfileId, planData) {
        const response = await fetch(`${API_BASE_URL}/api/marriage-plans/${familyProfileId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData)
        });
        if (!response.ok) throw new Error('Failed to create plan');
        return response.json();
    },

    async updatePlan(id, planData) {
        const response = await fetch(`${API_BASE_URL}/api/marriage-plans/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData)
        });
        if (!response.ok) throw new Error('Failed to update plan');
        return response.json();
    },

    async patchPlan(id, updates) {
        const response = await fetch(`${API_BASE_URL}/api/marriage-plans/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Failed to patch plan');
        return response.json();
    },

    async deletePlan(id) {
        const response = await fetch(`${API_BASE_URL}/api/marriage-plans/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete plan');
    }
};

function getProgress(plan) {
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(plan.estimatedYear) || currentYear + 1;
    const years = Math.max(0, targetYear - currentYear);

    const currentSavings = parseFloat(plan.currentSavings) || 0;
    const monthlyContrib = parseFloat(plan.monthlyContribution) || 0;
    const inflationRate = parseFloat(plan.inflationRate) || 6;
    const estimatedTotal = parseFloat(plan.estimatedTotalCost) || 0;

    // If no estimated cost, return 0
    if (estimatedTotal <= 0) return 0;

    // If target year is current year or past, calculate based on current savings only
    if (years <= 0) {
        return Math.min(100, (currentSavings / estimatedTotal) * 100);
    }

    // Calculate future value of current savings with compound interest
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + inflationRate / 100, years);

    // Calculate future value of monthly contributions (annuity formula)
    let futureValueMonthlyContributions = 0;
    if (monthlyContrib > 0 && inflationRate > 0) {
        const monthlyRate = inflationRate / 100 / 12;
        const totalMonths = years * 12;
        futureValueMonthlyContributions = monthlyContrib *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (monthlyContrib > 0) {
        // If no inflation, simple multiplication
        futureValueMonthlyContributions = monthlyContrib * years * 12;
    }

    const totalFutureValue = futureValueCurrentSavings + futureValueMonthlyContributions;

    // Calculate inflated cost
    const inflatedCost = estimatedTotal * Math.pow(1 + inflationRate / 100, years);

    // Return progress percentage, capped at 100%
    return Math.min(100, (totalFutureValue / inflatedCost) * 100);
}

function getShortfall(plan) {
    const currentYear = new Date().getFullYear();
    const targetYear = parseInt(plan.estimatedYear) || currentYear + 1;
    const years = Math.max(0, targetYear - currentYear);

    const currentSavings = parseFloat(plan.currentSavings) || 0;
    const monthlyContrib = parseFloat(plan.monthlyContribution) || 0;
    const inflationRate = parseFloat(plan.inflationRate) || 6;
    const estimatedTotal = parseFloat(plan.estimatedTotalCost) || 0;

    // If no estimated cost, return 0
    if (estimatedTotal <= 0) return 0;

    // If target year is current year or past, calculate based on current savings only
    if (years <= 0) {
        return Math.max(0, estimatedTotal - currentSavings);
    }

    // Calculate future value of current savings with compound interest
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + inflationRate / 100, years);

    // Calculate future value of monthly contributions (annuity formula)
    let futureValueMonthlyContributions = 0;
    if (monthlyContrib > 0 && inflationRate > 0) {
        const monthlyRate = inflationRate / 100 / 12;
        const totalMonths = years * 12;
        futureValueMonthlyContributions = monthlyContrib *
            ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    } else if (monthlyContrib > 0) {
        // If no inflation, simple multiplication
        futureValueMonthlyContributions = monthlyContrib * years * 12;
    }

    const totalFutureValue = futureValueCurrentSavings + futureValueMonthlyContributions;

    // Calculate inflated cost
    const inflatedCost = estimatedTotal * Math.pow(1 + inflationRate / 100, years);

    // Return shortfall (negative means surplus)
    return Math.max(0, inflatedCost - totalFutureValue);
}

// Form Modal Component
const MarriagePlanModal = ({ isOpen, onClose, onSave, plan = null, familyProfileId }) => {
    const [formData, setFormData] = useState({
        planName: '',
        forName: '',
        relationship: '',
        estimatedYear: new Date().getFullYear() + 1,
        estimatedTotalCost: '',
        currentSavings: '0',
        monthlyContribution: '0',
        inflationRate: '6.00',
        notes: '',
        familyProfileId: familyProfileId
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (plan) {
            setFormData({
                planName: plan.planName || '',
                forName: plan.forName || '',
                relationship: plan.relationship || '',
                estimatedYear: plan.estimatedYear || new Date().getFullYear() + 1,
                estimatedTotalCost: plan.estimatedTotalCost || '',
                currentSavings: plan.currentSavings || '0',
                monthlyContribution: plan.monthlyContribution || '0',
                inflationRate: plan.inflationRate || '6.00',
                notes: plan.notes || '',
                familyProfileId: plan.familyProfileId || familyProfileId
            });
        }
    }, [plan, familyProfileId]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.planName.trim()) newErrors.planName = 'Plan name is required';
        if (!formData.forName.trim()) newErrors.forName = 'Name is required';
        if (!formData.relationship.trim()) newErrors.relationship = 'Relationship is required';
        if (formData.estimatedYear < new Date().getFullYear()) {
            newErrors.estimatedYear = 'Year must be current year or later';
        }
        if (!formData.estimatedTotalCost || parseFloat(formData.estimatedTotalCost) <= 0) {
            newErrors.estimatedTotalCost = 'Estimated cost must be greater than zero';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving plan:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {plan ? 'Edit Marriage Plan' : 'Create Marriage Plan'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Plan Name *
                            </label>
                            <input
                                type="text"
                                value={formData.planName}
                                onChange={(e) => setFormData({...formData, planName: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="e.g., Priya's Wedding"
                            />
                            {errors.planName && <p className="text-red-400 text-sm mt-1">{errors.planName}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                For Name *
                            </label>
                            <input
                                type="text"
                                value={formData.forName}
                                onChange={(e) => setFormData({...formData, forName: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="Person's name"
                            />
                            {errors.forName && <p className="text-red-400 text-sm mt-1">{errors.forName}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Relationship *
                            </label>
                            <select
                                value={formData.relationship}
                                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            >
                                <option value="">Select relationship</option>
                                <option value="Son">Son</option>
                                <option value="Daughter">Daughter</option>
                                <option value="Self">Self</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.relationship && <p className="text-red-400 text-sm mt-1">{errors.relationship}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Target Year *
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedYear}
                                onChange={(e) => setFormData({...formData, estimatedYear: parseInt(e.target.value)})}
                                min={new Date().getFullYear()}
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                            {errors.estimatedYear && <p className="text-red-400 text-sm mt-1">{errors.estimatedYear}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Estimated Total Cost (₹) *
                            </label>
                            <input
                                type="number"
                                value={formData.estimatedTotalCost}
                                onChange={(e) => setFormData({...formData, estimatedTotalCost: e.target.value})}
                                min="1"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                placeholder="1200000"
                            />
                            {errors.estimatedTotalCost && <p className="text-red-400 text-sm mt-1">{errors.estimatedTotalCost}</p>}
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Current Savings (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.currentSavings}
                                onChange={(e) => setFormData({...formData, currentSavings: e.target.value})}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Monthly Contribution (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.monthlyContribution}
                                onChange={(e) => setFormData({...formData, monthlyContribution: e.target.value})}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">
                                Inflation Rate (%)
                            </label>
                            <input
                                type="number"
                                value={formData.inflationRate}
                                onChange={(e) => setFormData({...formData, inflationRate: e.target.value})}
                                min="0"
                                step="0.01"
                                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            rows="3"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                            placeholder="Additional notes about the wedding plan..."
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    {plan ? 'Update Plan' : 'Create Plan'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function MarriagePage() {
    const [marriagePlans, setMarriagePlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);

    // This should come from your auth context or props
    const familyProfileId = 1; // Replace with actual family profile ID

    // Load plans on component mount
    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const plans = await marriagePlanAPI.getAllPlans(familyProfileId);
            setMarriagePlans(plans);
            setError(null);
        } catch (err) {
            setError('Failed to load marriage plans');
            console.error('Error loading plans:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlan = async (planData) => {
        try {
            const newPlan = await marriagePlanAPI.createPlan(familyProfileId, planData);
            setMarriagePlans(prev => [...prev, newPlan]);
        } catch (err) {
            setError('Failed to create plan');
            throw err;
        }
    };

    const handleUpdatePlan = async (planData) => {
        try {
            const updatedPlan = await marriagePlanAPI.updatePlan(editingPlan.id, planData);
            setMarriagePlans(prev => prev.map(plan =>
                plan.id === editingPlan.id ? updatedPlan : plan
            ));
        } catch (err) {
            setError('Failed to update plan');
            throw err;
        }
    };

    const handleDeletePlan = async (planId) => {
        if (!window.confirm('Are you sure you want to delete this marriage plan?')) {
            return;
        }

        try {
            await marriagePlanAPI.deletePlan(planId);
            setMarriagePlans(prev => prev.filter(plan => plan.id !== planId));
        } catch (err) {
            setError('Failed to delete plan');
            console.error('Error deleting plan:', err);
        }
    };

    const openCreateModal = () => {
        setEditingPlan(null);
        setIsModalOpen(true);
    };

    const openEditModal = (plan) => {
        setEditingPlan(plan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    // Summary calculations
    const totalPlans = marriagePlans.length;
    const totalEstimated = marriagePlans.reduce((sum, plan) => sum + parseFloat(plan.estimatedTotalCost || 0), 0);
    const totalSavings = marriagePlans.reduce((sum, plan) => sum + parseFloat(plan.currentSavings || 0), 0);
    const totalMonthlyContrib = marriagePlans.reduce((sum, plan) => sum + parseFloat(plan.monthlyContribution || 0), 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-xl">Loading marriage plans...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
            <DynamicNavbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 md:px-16 lg:px-24 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                            <Heart className="mr-3" size={32} />
                            Marriage Planning
                        </h1>
                        <p className="text-gray-300 text-lg">
                            Plan and track your family's marriage expenses
                        </p>
                        {/* Debug info - remove in production */}
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-lg px-7 py-3 rounded-lg transition-colors shadow-lg flex items-center"
                    >
                        <Plus className="mr-2" size={20} />
                        Add Plan
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => setError(null)}
                            className="text-red-300 hover:text-red-100 text-sm mt-2"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <DollarSign className="text-blue-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Current Savings</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(totalSavings / 100000).toFixed(1)}L
                        </p>
                        <p className="text-blue-400 text-sm mt-1">Accumulated savings</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-emerald-500/20 rounded-lg">
                                <Target className="text-emerald-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Monthly Contributions</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{totalMonthlyContrib.toLocaleString()}
                        </p>
                        <p className="text-emerald-400 text-sm mt-1">Total monthly savings</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Calendar className="text-orange-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Total Planned Expenses</h3>
                        <p className="text-2xl font-bold text-white">
                            ₹{(totalEstimated / 100000).toFixed(1)}L
                        </p>
                        <p className="text-orange-400 text-sm mt-1">Future wedding costs</p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Heart className="text-purple-400" size={24} />
                            </div>
                        </div>
                        <h3 className="text-gray-300 text-sm font-medium">Plans Created</h3>
                        <p className="text-2xl font-bold text-white">{totalPlans}</p>
                        <p className="text-purple-400 text-sm mt-1">Active marriage plans</p>
                    </div>
                </div>

                {/* Plan Details Cards */}
                {marriagePlans.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
                        <Heart className="mx-auto text-gray-400 mb-4" size={48} />
                        <h3 className="text-xl font-semibold text-white mb-2">No Marriage Plans Yet</h3>
                        <p className="text-gray-300 mb-6">Start planning for your family's special moments</p>
                        <button
                            onClick={openCreateModal}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            Create Your First Plan
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {marriagePlans.map(plan => {
                            const progress = getProgress(plan);
                            const shortfall = getShortfall(plan);

                            return (
                                <div key={plan.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                                    {/* Plan Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-purple-500/20 rounded-full">
                                                <User className="text-purple-400" size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{plan.forName}</h3>
                                                <p className="text-gray-300">Relationship: {plan.relationship}</p>
                                                <p className="text-gray-400 text-sm">{plan.planName}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openEditModal(plan)}
                                                className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                                            >
                                                <Edit3 className="text-blue-400" size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeletePlan(plan.id)}
                                                className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="text-red-400" size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Details Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Target Year</p>
                                            <p className="text-white font-semibold text-lg">{plan.estimatedYear}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Estimated Cost</p>
                                            <p className="text-white font-semibold text-lg">₹{(parseFloat(plan.estimatedTotalCost) / 100000).toFixed(1)}L</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Current Savings</p>
                                            <p className="text-white font-semibold text-lg">₹{(parseFloat(plan.currentSavings || 0) / 100000).toFixed(2)}L</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Monthly Contribution</p>
                                            <p className="text-white font-semibold text-lg">₹{parseFloat(plan.monthlyContribution || 0).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    {/* Additional Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Inflation Rate</p>
                                            <p className="text-white font-semibold">{plan.inflationRate}%</p>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-4">
                                            <p className="text-gray-400 text-sm">Notes</p>
                                            <p className="text-white font-semibold">{plan.notes || 'No notes'}</p>
                                        </div>
                                    </div>

                                    {/* Progress Section */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <p className="text-gray-300 font-medium">Savings Progress</p>
                                            <p className="text-white font-semibold">{progress.toFixed(1)}%</p>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min(100, progress)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Shortfall Alert */}
                                    {shortfall > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Target className="text-red-400" size={20} />
                                                <p className="text-red-400 font-semibold">
                                                    Shortfall: ₹{(shortfall / 100000).toFixed(1)}L
                                                </p>
                                            </div>
                                            <p className="text-red-300 text-sm">
                                                Consider increasing monthly contribution by ₹{Math.ceil(shortfall / ((plan.estimatedYear - new Date().getFullYear()) * 12) / 1000) * 1000}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            <MarriagePlanModal
                isOpen={isModalOpen}
                onClose={closeModal}
                onSave={editingPlan ? handleUpdatePlan : handleCreatePlan}
                plan={editingPlan}
                familyProfileId={familyProfileId}
            />
        </div>
    );
}
