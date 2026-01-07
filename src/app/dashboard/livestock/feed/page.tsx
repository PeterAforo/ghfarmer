// Feed Management Page - Track daily feed consumption
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Utensils, 
  Plus,
  Calendar,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock
} from "lucide-react";

interface LivestockEntry {
  id: string;
  name: string | null;
  batchId: string | null;
  quantity: number;
  livestock: { englishName: string };
}

interface FeedLog {
  id: string;
  date: string;
  feedType: string;
  quantity: number;
  unit: string;
  totalCost: number | null;
  livestockEntry: LivestockEntry;
  inventoryItem: { id: string; name: string; quantity: number } | null;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
}

export default function FeedManagementPage() {
  const [logs, setLogs] = useState<FeedLog[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [livestockEntries, setLivestockEntries] = useState<LivestockEntry[]>([]);
  const [feedInventory, setFeedInventory] = useState<InventoryItem[]>([]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    livestockEntryId: "",
    date: new Date().toISOString().split("T")[0],
    feedType: "",
    inventoryItemId: "",
    quantity: 0,
    unit: "kg",
    unitCost: 0,
    notes: "",
  });

  useEffect(() => {
    fetchLogs();
    fetchLivestockEntries();
    fetchFeedInventory();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("/api/livestock/daily-logs?type=feed&limit=50");
      const data = await res.json();
      setLogs(data.logs || []);
      setSummary(data.summary || null);
    } catch (error) {
      console.error("Error fetching feed logs:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchLivestockEntries() {
    try {
      const res = await fetch("/api/livestock?status=ACTIVE");
      const data = await res.json();
      setLivestockEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching livestock:", error);
    }
  }

  async function fetchFeedInventory() {
    try {
      const res = await fetch("/api/inventory?category=ANIMAL_FEED");
      const data = await res.json();
      setFeedInventory(data.items || []);
    } catch (error) {
      console.error("Error fetching feed inventory:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.livestockEntryId || !formData.feedType || formData.quantity <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/livestock/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feed",
          ...formData,
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setFormData({
          livestockEntryId: "",
          date: new Date().toISOString().split("T")[0],
          feedType: "",
          inventoryItemId: "",
          quantity: 0,
          unit: "kg",
          unitCost: 0,
          notes: "",
        });
        fetchLogs();
        fetchFeedInventory();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save feed log");
      }
    } catch (error) {
      console.error("Error saving feed log:", error);
      alert("Failed to save feed log");
    }
  }

  const selectInventoryItem = (itemId: string) => {
    const item = feedInventory.find(i => i.id === itemId);
    if (item) {
      setFormData({
        ...formData,
        inventoryItemId: itemId,
        feedType: item.name,
        unit: item.unit,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed Management</h1>
          <p className="text-gray-600">Track daily feed consumption and costs</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Log Feed
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Utensils className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Feed Used</p>
                <p className="text-2xl font-bold">{summary.totalFeedUsed?.toLocaleString()} kg</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold">GH₵ {summary.totalCost?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Daily Average</p>
                <p className="text-2xl font-bold">{summary.avgDailyFeed} kg</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold">{summary.totalLogs}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Alert */}
      {feedInventory.filter(f => f.quantity < 50).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Low Feed Stock Alert</h3>
              <p className="text-sm text-yellow-700 mt-1">
                The following feeds are running low: {feedInventory.filter(f => f.quantity < 50).map(f => `${f.name} (${f.quantity} ${f.unit})`).join(", ")}
              </p>
              <Link href="/dashboard/purchases/new" className="text-sm text-yellow-800 underline mt-2 inline-block">
                Create Purchase Order →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Feed Inventory Quick View */}
      <div className="bg-white rounded-xl border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Feed Inventory</h2>
          <Link href="/dashboard/inventory" className="text-primary text-sm hover:underline">
            View All →
          </Link>
        </div>
        {feedInventory.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No feed items in inventory</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {feedInventory.slice(0, 8).map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-sm truncate">{item.name}</span>
                </div>
                <p className={`text-lg font-bold ${item.quantity < 50 ? "text-red-600" : "text-gray-900"}`}>
                  {item.quantity} {item.unit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feed Logs Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">Recent Feed Logs</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Utensils className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feed logs yet</h3>
            <p className="text-gray-600 mb-4">Start recording daily feed consumption</p>
            <button
              onClick={() => setShowAddForm(true)}
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
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Feed Type</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{log.livestockEntry?.name || log.livestockEntry?.batchId || "—"}</p>
                        <p className="text-sm text-gray-500">{log.livestockEntry?.livestock?.englishName} ({log.livestockEntry?.quantity})</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{log.feedType}</td>
                    <td className="px-6 py-4 text-right font-medium">{log.quantity} {log.unit}</td>
                    <td className="px-6 py-4 text-right">
                      {log.totalCost ? `GH₵ ${log.totalCost.toLocaleString()}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Feed Log Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Log Feed Consumption</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Livestock *
                </label>
                <select
                  value={formData.livestockEntryId}
                  onChange={(e) => setFormData({ ...formData, livestockEntryId: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                >
                  <option value="">-- Select --</option>
                  {livestockEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name || entry.batchId} - {entry.livestock?.englishName} ({entry.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Inventory
                </label>
                <select
                  value={formData.inventoryItemId}
                  onChange={(e) => selectInventoryItem(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="">-- Select from inventory --</option>
                  {feedInventory.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feed Type *</label>
                <input
                  type="text"
                  value={formData.feedType}
                  onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="e.g., Layer Mash, Broiler Starter"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    min="0.1"
                    step="0.1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="kg">Kg</option>
                    <option value="bags">Bags</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost per Unit (GH₵)</label>
                <input
                  type="number"
                  value={formData.unitCost}
                  onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  min="0"
                  step="0.01"
                />
              </div>

              {formData.quantity > 0 && formData.unitCost > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Total Cost: <span className="font-bold">GH₵ {(formData.quantity * formData.unitCost).toLocaleString()}</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
