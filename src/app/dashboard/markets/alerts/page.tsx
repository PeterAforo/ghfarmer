"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Plus,
  Trash2,
  Loader2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface PriceAlert {
  id: string;
  productType: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
  isActive: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

const PRODUCTS = [
  "Maize",
  "Rice",
  "Cassava",
  "Yam",
  "Plantain",
  "Tomatoes",
  "Onions",
  "Peppers",
  "Groundnuts",
  "Soybeans",
  "Cocoa",
  "Palm Oil",
  "Chicken",
  "Eggs",
  "Goat",
  "Cattle",
  "Tilapia",
  "Catfish",
];

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    productType: "",
    targetPrice: "",
    condition: "BELOW" as "ABOVE" | "BELOW",
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      const res = await fetch("/api/price-alerts");
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);

    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: formData.productType,
          targetPrice: parseFloat(formData.targetPrice),
          condition: formData.condition,
        }),
      });

      if (res.ok) {
        const newAlert = await res.json();
        setAlerts([newAlert, ...alerts]);
        setShowForm(false);
        setFormData({ productType: "", targetPrice: "", condition: "BELOW" });
      }
    } catch (error) {
      console.error("Failed to create alert");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this price alert?")) return;

    try {
      const res = await fetch(`/api/price-alerts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAlerts(alerts.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete alert");
    }
  }

  async function toggleAlert(id: string, isActive: boolean) {
    try {
      const res = await fetch(`/api/price-alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setAlerts(alerts.map((a) => (a.id === id ? { ...a, isActive: !isActive } : a)));
      }
    } catch (error) {
      console.error("Failed to toggle alert");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/markets">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Price Alerts</h1>
            <p className="text-gray-500">Get notified when prices change</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Price Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productType">Product</Label>
                <select
                  id="productType"
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                  required
                >
                  <option value="">Select a product</option>
                  {PRODUCTS.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Alert When Price Goes</Label>
                  <select
                    id="condition"
                    value={formData.condition}
                    onChange={(e) =>
                      setFormData({ ...formData, condition: e.target.value as "ABOVE" | "BELOW" })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="BELOW">Below</option>
                    <option value="ABOVE">Above</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price (GHS)</Label>
                  <Input
                    id="targetPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.targetPrice}
                    onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                    placeholder="e.g., 150"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Alert
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Price Alerts</h3>
            <p className="text-gray-500 mb-4">
              Create alerts to get notified when market prices reach your target.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Alert
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className={!alert.isActive ? "opacity-60" : ""}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        alert.condition === "ABOVE"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {alert.condition === "ABOVE" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{alert.productType}</p>
                      <p className="text-sm text-gray-500">
                        Alert when price goes {alert.condition.toLowerCase()} GHS{" "}
                        {alert.targetPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                    >
                      {alert.isActive ? "Pause" : "Resume"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(alert.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                {alert.triggeredAt && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Triggered on {new Date(alert.triggeredAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
