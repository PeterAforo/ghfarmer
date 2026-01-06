"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Egg, 
  Milk, 
  Utensils,
  Plus,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from "lucide-react";

interface LivestockEntry {
  id: string;
  name: string | null;
  batchId: string | null;
  tagNumber: string | null;
  quantity: number;
  livestock: { englishName: string };
}

interface EggLog {
  id: string;
  date: string;
  totalEggs: number;
  goodEggs: number;
  brokenEggs: number;
  totalValue: number | null;
  variance: number | null;
  livestockEntry: LivestockEntry;
}

interface MilkLog {
  id: string;
  date: string;
  totalVolume: number;
  unit: string;
  totalValue: number | null;
  variance: number | null;
  livestockEntry: LivestockEntry;
}

export default function ProductionLogsPage() {
  const [activeTab, setActiveTab] = useState<"eggs" | "milk">("eggs");
  const [logs, setLogs] = useState<EggLog[] | MilkLog[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [livestockEntries, setLivestockEntries] = useState<LivestockEntry[]>([]);
  
  // Quick entry form
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [quickEntry, setQuickEntry] = useState({
    livestockEntryId: "",
    date: new Date().toISOString().split("T")[0],
    totalEggs: 0,
    brokenEggs: 0,
    totalVolume: 0,
    morningVolume: 0,
    eveningVolume: 0,
    unitPrice: 0,
  });

  useEffect(() => {
    fetchLogs();
    fetchLivestockEntries();
  }, [activeTab]);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch(`/api/livestock/daily-logs?type=${activeTab}&limit=30`);
      const data = await res.json();
      setLogs(data.logs || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLivestockEntries() {
    try {
      const res = await fetch("/api/livestock?status=ACTIVE");
      const data = await res.json();
      // Filter for poultry (eggs) or cattle/goats (milk)
      const filtered = (data.entries || []).filter((e: any) => {
        if (activeTab === "eggs") {
          return e.livestock?.category === "POULTRY";
        } else {
          return ["RUMINANTS"].includes(e.livestock?.category);
        }
      });
      setLivestockEntries(filtered);
    } catch (error) {
      console.error("Error fetching livestock:", error);
    }
  }

  async function handleQuickEntry(e: React.FormEvent) {
    e.preventDefault();
    
    if (!quickEntry.livestockEntryId) {
      alert("Please select a livestock entry");
      return;
    }

    try {
      const payload = activeTab === "eggs" 
        ? {
            type: "eggs",
            livestockEntryId: quickEntry.livestockEntryId,
            date: quickEntry.date,
            totalEggs: quickEntry.totalEggs,
            brokenEggs: quickEntry.brokenEggs,
            unitPrice: quickEntry.unitPrice || undefined,
          }
        : {
            type: "milk",
            livestockEntryId: quickEntry.livestockEntryId,
            date: quickEntry.date,
            morningVolume: quickEntry.morningVolume,
            eveningVolume: quickEntry.eveningVolume,
            totalVolume: quickEntry.morningVolume + quickEntry.eveningVolume || quickEntry.totalVolume,
            unitPrice: quickEntry.unitPrice || undefined,
          };

      const res = await fetch("/api/livestock/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowQuickEntry(false);
        setQuickEntry({
          livestockEntryId: "",
          date: new Date().toISOString().split("T")[0],
          totalEggs: 0,
          brokenEggs: 0,
          totalVolume: 0,
          morningVolume: 0,
          eveningVolume: 0,
          unitPrice: 0,
        });
        fetchLogs();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save log");
      }
    } catch (error) {
      console.error("Error saving log:", error);
      alert("Failed to save log");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Production Logs</h1>
          <p className="text-gray-600">Track daily egg and milk production</p>
        </div>
        <button
          onClick={() => setShowQuickEntry(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Quick Entry
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("eggs")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "eggs" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Egg className="h-5 w-5" />
          Egg Production
        </button>
        <button
          onClick={() => setActiveTab("milk")}
          className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
            activeTab === "milk" 
              ? "border-primary text-primary" 
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <Milk className="h-5 w-5" />
          Milk Production
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTab === "eggs" ? (
            <>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Egg className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Eggs</p>
                    <p className="text-2xl font-bold">{summary.totalEggs?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Good Eggs</p>
                    <p className="text-2xl font-bold">{summary.goodEggs?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Broken</p>
                    <p className="text-2xl font-bold">{summary.brokenEggs?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Daily Avg</p>
                    <p className="text-2xl font-bold">{summary.avgDailyEggs}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Milk className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Volume</p>
                    <p className="text-2xl font-bold">{summary.totalVolume?.toLocaleString()} L</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold">GH₵ {summary.totalValue?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Daily Avg</p>
                    <p className="text-2xl font-bold">{summary.avgDailyVolume} L</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Logs</p>
                    <p className="text-2xl font-bold">{summary.totalLogs}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            {activeTab === "eggs" ? (
              <Egg className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            ) : (
              <Milk className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            )}
            <h3 className="text-lg font-medium text-gray-900 mb-2">No logs yet</h3>
            <p className="text-gray-600 mb-4">Start recording daily production</p>
            <button
              onClick={() => setShowQuickEntry(true)}
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-5 w-5" />
              Add First Log
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Livestock</th>
                  {activeTab === "eggs" ? (
                    <>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Good</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Broken</th>
                    </>
                  ) : (
                    <>
                      <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Volume</th>
                    </>
                  )}
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Value</th>
                  <th className="text-center px-6 py-3 text-xs font-medium text-gray-500 uppercase">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeTab === "eggs" ? (
                  (logs as EggLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{log.livestockEntry?.name || log.livestockEntry?.batchId || "—"}</p>
                          <p className="text-sm text-gray-500">{log.livestockEntry?.livestock?.englishName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{log.totalEggs}</td>
                      <td className="px-6 py-4 text-right text-green-600">{log.goodEggs}</td>
                      <td className="px-6 py-4 text-right text-red-600">{log.brokenEggs}</td>
                      <td className="px-6 py-4 text-right">
                        {log.totalValue ? `GH₵ ${log.totalValue.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.variance !== null ? (
                          <span className={`inline-flex items-center gap-1 ${log.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {log.variance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {Math.abs(log.variance).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  (logs as MilkLog[]).map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">
                        {new Date(log.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{log.livestockEntry?.name || log.livestockEntry?.tagNumber || "—"}</p>
                          <p className="text-sm text-gray-500">{log.livestockEntry?.livestock?.englishName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{log.totalVolume} {log.unit}</td>
                      <td className="px-6 py-4 text-right">
                        {log.totalValue ? `GH₵ ${log.totalValue.toLocaleString()}` : "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {log.variance !== null ? (
                          <span className={`inline-flex items-center gap-1 ${log.variance >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {log.variance >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {Math.abs(log.variance).toFixed(1)}%
                          </span>
                        ) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Entry Modal */}
      {showQuickEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">
              Quick {activeTab === "eggs" ? "Egg" : "Milk"} Entry
            </h2>
            <form onSubmit={handleQuickEntry} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Livestock
                </label>
                <select
                  value={quickEntry.livestockEntryId}
                  onChange={(e) => setQuickEntry({ ...quickEntry, livestockEntryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">-- Select --</option>
                  {livestockEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name || entry.batchId || entry.tagNumber} - {entry.livestock?.englishName} ({entry.quantity})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={quickEntry.date}
                  onChange={(e) => setQuickEntry({ ...quickEntry, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {activeTab === "eggs" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Total Eggs</label>
                      <input
                        type="number"
                        value={quickEntry.totalEggs}
                        onChange={(e) => setQuickEntry({ ...quickEntry, totalEggs: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Broken</label>
                      <input
                        type="number"
                        value={quickEntry.brokenEggs}
                        onChange={(e) => setQuickEntry({ ...quickEntry, brokenEggs: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Egg (GH₵)</label>
                    <input
                      type="number"
                      value={quickEntry.unitPrice}
                      onChange={(e) => setQuickEntry({ ...quickEntry, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Morning (L)</label>
                      <input
                        type="number"
                        value={quickEntry.morningVolume}
                        onChange={(e) => setQuickEntry({ ...quickEntry, morningVolume: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Evening (L)</label>
                      <input
                        type="number"
                        value={quickEntry.eveningVolume}
                        onChange={(e) => setQuickEntry({ ...quickEntry, eveningVolume: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Liter (GH₵)</label>
                    <input
                      type="number"
                      value={quickEntry.unitPrice}
                      onChange={(e) => setQuickEntry({ ...quickEntry, unitPrice: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowQuickEntry(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
