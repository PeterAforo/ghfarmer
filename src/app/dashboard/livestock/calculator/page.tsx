"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calculator, 
  ArrowLeft,
  Info,
  TrendingUp,
  Calendar,
  Package,
  DollarSign
} from "lucide-react";

interface FeedRequirement {
  phase: string;
  ageRange: string;
  daysInPhase: number;
  dailyFeedPerBird: number;
  totalFeedPerBird: number;
  feedType: string;
}

interface CalculationResult {
  totalBirds: number;
  totalDays: number;
  phases: {
    phase: string;
    ageRange: string;
    days: number;
    feedType: string;
    dailyFeed: number;
    totalFeed: number;
    estimatedCost: number;
  }[];
  grandTotalFeed: number;
  grandTotalCost: number;
  averageDailyFeed: number;
}

// Feed requirements data for different livestock types
const feedData: Record<string, FeedRequirement[]> = {
  broiler: [
    { phase: "Starter", ageRange: "0-2 weeks", daysInPhase: 14, dailyFeedPerBird: 0.025, totalFeedPerBird: 0.35, feedType: "Broiler Starter" },
    { phase: "Grower", ageRange: "3-4 weeks", daysInPhase: 14, dailyFeedPerBird: 0.065, totalFeedPerBird: 0.91, feedType: "Broiler Grower" },
    { phase: "Finisher", ageRange: "5-6 weeks", daysInPhase: 14, dailyFeedPerBird: 0.120, totalFeedPerBird: 1.68, feedType: "Broiler Finisher" },
  ],
  layer: [
    { phase: "Chick", ageRange: "0-6 weeks", daysInPhase: 42, dailyFeedPerBird: 0.020, totalFeedPerBird: 0.84, feedType: "Chick Mash" },
    { phase: "Grower", ageRange: "7-14 weeks", daysInPhase: 56, dailyFeedPerBird: 0.055, totalFeedPerBird: 3.08, feedType: "Grower Mash" },
    { phase: "Developer", ageRange: "15-18 weeks", daysInPhase: 28, dailyFeedPerBird: 0.080, totalFeedPerBird: 2.24, feedType: "Developer Mash" },
    { phase: "Layer", ageRange: "19+ weeks", daysInPhase: 365, dailyFeedPerBird: 0.115, totalFeedPerBird: 41.98, feedType: "Layer Mash" },
  ],
  pig_grower: [
    { phase: "Starter", ageRange: "Weaning-25kg", daysInPhase: 42, dailyFeedPerBird: 0.8, totalFeedPerBird: 33.6, feedType: "Pig Starter" },
    { phase: "Grower", ageRange: "25-60kg", daysInPhase: 56, dailyFeedPerBird: 2.0, totalFeedPerBird: 112, feedType: "Pig Grower" },
    { phase: "Finisher", ageRange: "60-100kg", daysInPhase: 56, dailyFeedPerBird: 3.0, totalFeedPerBird: 168, feedType: "Pig Finisher" },
  ],
  goat: [
    { phase: "Kid", ageRange: "0-3 months", daysInPhase: 90, dailyFeedPerBird: 0.3, totalFeedPerBird: 27, feedType: "Kid Feed" },
    { phase: "Grower", ageRange: "3-8 months", daysInPhase: 150, dailyFeedPerBird: 0.8, totalFeedPerBird: 120, feedType: "Goat Grower" },
    { phase: "Adult", ageRange: "8+ months", daysInPhase: 365, dailyFeedPerBird: 1.2, totalFeedPerBird: 438, feedType: "Goat Maintenance" },
  ],
  cattle: [
    { phase: "Calf", ageRange: "0-3 months", daysInPhase: 90, dailyFeedPerBird: 2.0, totalFeedPerBird: 180, feedType: "Calf Starter" },
    { phase: "Weaner", ageRange: "3-6 months", daysInPhase: 90, dailyFeedPerBird: 4.0, totalFeedPerBird: 360, feedType: "Weaner Feed" },
    { phase: "Grower", ageRange: "6-12 months", daysInPhase: 180, dailyFeedPerBird: 8.0, totalFeedPerBird: 1440, feedType: "Cattle Grower" },
    { phase: "Finisher", ageRange: "12-18 months", daysInPhase: 180, dailyFeedPerBird: 12.0, totalFeedPerBird: 2160, feedType: "Cattle Finisher" },
  ],
  fish_tilapia: [
    { phase: "Fry", ageRange: "0-4 weeks", daysInPhase: 28, dailyFeedPerBird: 0.002, totalFeedPerBird: 0.056, feedType: "Fish Fry Feed" },
    { phase: "Fingerling", ageRange: "1-2 months", daysInPhase: 30, dailyFeedPerBird: 0.008, totalFeedPerBird: 0.24, feedType: "Fingerling Feed" },
    { phase: "Grower", ageRange: "2-4 months", daysInPhase: 60, dailyFeedPerBird: 0.025, totalFeedPerBird: 1.5, feedType: "Fish Grower" },
    { phase: "Finisher", ageRange: "4-6 months", daysInPhase: 60, dailyFeedPerBird: 0.040, totalFeedPerBird: 2.4, feedType: "Fish Finisher" },
  ],
};

// Default feed prices (GH₵ per kg)
const defaultPrices: Record<string, number> = {
  "Broiler Starter": 5.50,
  "Broiler Grower": 5.00,
  "Broiler Finisher": 4.80,
  "Chick Mash": 5.20,
  "Grower Mash": 4.80,
  "Developer Mash": 4.50,
  "Layer Mash": 4.20,
  "Pig Starter": 6.00,
  "Pig Grower": 5.50,
  "Pig Finisher": 5.00,
  "Kid Feed": 4.50,
  "Goat Grower": 4.00,
  "Goat Maintenance": 3.50,
  "Calf Starter": 5.00,
  "Weaner Feed": 4.50,
  "Cattle Grower": 4.00,
  "Cattle Finisher": 3.80,
  "Fish Fry Feed": 12.00,
  "Fingerling Feed": 10.00,
  "Fish Grower": 8.00,
  "Fish Finisher": 7.00,
};

export default function FeedCalculatorPage() {
  const [livestockType, setLivestockType] = useState("broiler");
  const [quantity, setQuantity] = useState(100);
  const [mortalityRate, setMortalityRate] = useState(5);
  const [feedPrices, setFeedPrices] = useState<Record<string, number>>(defaultPrices);
  const [result, setResult] = useState<CalculationResult | null>(null);

  const calculateFeed = () => {
    const requirements = feedData[livestockType];
    if (!requirements) return;

    // Adjust for mortality
    const effectiveBirds = quantity * (1 - mortalityRate / 100);

    const phases = requirements.map((req) => {
      const totalFeed = req.totalFeedPerBird * effectiveBirds;
      const price = feedPrices[req.feedType] || 5;
      return {
        phase: req.phase,
        ageRange: req.ageRange,
        days: req.daysInPhase,
        feedType: req.feedType,
        dailyFeed: req.dailyFeedPerBird * effectiveBirds,
        totalFeed,
        estimatedCost: totalFeed * price,
      };
    });

    const totalDays = phases.reduce((sum, p) => sum + p.days, 0);
    const grandTotalFeed = phases.reduce((sum, p) => sum + p.totalFeed, 0);
    const grandTotalCost = phases.reduce((sum, p) => sum + p.estimatedCost, 0);

    setResult({
      totalBirds: quantity,
      totalDays,
      phases,
      grandTotalFeed,
      grandTotalCost,
      averageDailyFeed: grandTotalFeed / totalDays,
    });
  };

  const updatePrice = (feedType: string, price: number) => {
    setFeedPrices({ ...feedPrices, [feedType]: price });
  };

  const livestockOptions = [
    { value: "broiler", label: "Broiler Chickens", unit: "birds" },
    { value: "layer", label: "Layer Chickens", unit: "birds" },
    { value: "pig_grower", label: "Pigs (Grower)", unit: "pigs" },
    { value: "goat", label: "Goats", unit: "goats" },
    { value: "cattle", label: "Cattle", unit: "cattle" },
    { value: "fish_tilapia", label: "Tilapia Fish", unit: "fish" },
  ];

  const selectedOption = livestockOptions.find(o => o.value === livestockType);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/livestock" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed Calculator</h1>
          <p className="text-gray-600">Calculate feed requirements for your livestock lifecycle</p>
        </div>
      </div>

      {/* Calculator Form */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          Input Parameters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Livestock Type
            </label>
            <select
              value={livestockType}
              onChange={(e) => {
                setLivestockType(e.target.value);
                setResult(null);
              }}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {livestockOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of {selectedOption?.unit || "animals"}
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expected Mortality Rate (%)
            </label>
            <input
              type="number"
              value={mortalityRate}
              onChange={(e) => setMortalityRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              min="0"
              max="50"
              step="0.5"
            />
          </div>
        </div>

        {/* Feed Prices */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Feed Prices (GH₵ per kg)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {feedData[livestockType]?.map((req) => (
              <div key={req.feedType}>
                <label className="block text-xs text-gray-500 mb-1">{req.feedType}</label>
                <input
                  type="number"
                  value={feedPrices[req.feedType] || 0}
                  onChange={(e) => updatePrice(req.feedType, parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  min="0"
                  step="0.1"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={calculateFeed}
          className="mt-6 w-full md:w-auto px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          <Calculator className="h-4 w-4" />
          Calculate Feed Requirements
        </button>
      </div>

      {/* Results */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Feed</p>
                  <p className="text-2xl font-bold">{result.grandTotalFeed.toFixed(1)} kg</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="text-2xl font-bold">GH₵ {result.grandTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Daily Average</p>
                  <p className="text-2xl font-bold">{result.averageDailyFeed.toFixed(1)} kg</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold">{result.totalDays} days</p>
                </div>
              </div>
            </div>
          </div>

          {/* Phase Breakdown */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Feed Requirements by Phase</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Phase</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Age Range</th>
                    <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Feed Type</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Daily (kg)</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total (kg)</th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cost (GH₵)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {result.phases.map((phase, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{phase.phase}</td>
                      <td className="px-6 py-4 text-gray-600">{phase.ageRange}</td>
                      <td className="px-6 py-4 text-center">{phase.days}</td>
                      <td className="px-6 py-4">{phase.feedType}</td>
                      <td className="px-6 py-4 text-right">{phase.dailyFeed.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium">{phase.totalFeed.toFixed(1)}</td>
                      <td className="px-6 py-4 text-right font-medium">{phase.estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={4} className="px-6 py-4">Total</td>
                    <td className="px-6 py-4 text-right">{result.averageDailyFeed.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{result.grandTotalFeed.toFixed(1)}</td>
                    <td className="px-6 py-4 text-right">{result.grandTotalCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-800">Planning Tips</h3>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Order feed in advance to avoid stockouts during critical growth phases</li>
                  <li>• Consider bulk purchasing for better prices on larger quantities</li>
                  <li>• Store feed properly to maintain quality and prevent spoilage</li>
                  <li>• Monitor actual consumption vs. calculated amounts and adjust as needed</li>
                  <li>• Factor in a 10% buffer for wastage and spillage</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Link
              href="/dashboard/purchases/new"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 text-center"
            >
              Create Purchase Order
            </Link>
            <Link
              href="/dashboard/livestock/feed"
              className="flex-1 px-4 py-3 border rounded-lg hover:bg-gray-50 text-center"
            >
              Go to Feed Management
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
