"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Fish,
  Scale,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Harvest {
  id: string;
  date: string;
  quantity: number;
  quantityUnit: string;
  averageWeight: number | null;
  totalWeight: number | null;
  isPartial: boolean;
  notes: string | null;
}

export default function HarvestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    quantityUnit: "fish",
    averageWeight: "",
    totalWeight: "",
    isPartial: false,
    notes: "",
  });

  useEffect(() => {
    fetchHarvests();
  }, [id]);

  async function fetchHarvests() {
    try {
      const res = await fetch(`/api/aquaculture/${id}/harvest`);
      if (res.ok) {
        const data = await res.json();
        setHarvests(data);
      }
    } catch (error) {
      console.error("Failed to fetch harvests");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);

    try {
      const res = await fetch(`/api/aquaculture/${id}/harvest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          quantity: parseFloat(formData.quantity),
          quantityUnit: formData.quantityUnit,
          averageWeight: formData.averageWeight ? parseFloat(formData.averageWeight) : undefined,
          totalWeight: formData.totalWeight ? parseFloat(formData.totalWeight) : undefined,
          isPartial: formData.isPartial,
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        const newHarvest = await res.json();
        setHarvests([newHarvest, ...harvests]);
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          quantity: "",
          quantityUnit: "fish",
          averageWeight: "",
          totalWeight: "",
          isPartial: false,
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to add harvest");
    } finally {
      setIsAdding(false);
    }
  }

  // Calculate totals
  const totalFish = harvests.reduce((sum, h) => sum + h.quantity, 0);
  const totalWeight = harvests.reduce((sum, h) => sum + (h.totalWeight || 0), 0);

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
            <Link href={`/dashboard/aquaculture/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Harvest Records</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Harvest
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Fish className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Fish Harvested</p>
                <p className="text-2xl font-bold">{totalFish.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Weight</p>
                <p className="text-2xl font-bold">{totalWeight.toLocaleString()} kg</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Harvest Events</p>
                <p className="text-2xl font-bold">{harvests.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Record New Harvest</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Harvest Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isPartial">Harvest Type</Label>
                  <select
                    id="isPartial"
                    value={formData.isPartial ? "partial" : "full"}
                    onChange={(e) => setFormData({ ...formData, isPartial: e.target.value === "partial" })}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="full">Full Harvest</option>
                    <option value="partial">Partial Harvest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Number of fish"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantityUnit">Unit</Label>
                  <select
                    id="quantityUnit"
                    value={formData.quantityUnit}
                    onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="fish">Fish (count)</option>
                    <option value="kg">Kilograms</option>
                    <option value="bags">Bags</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="averageWeight">Average Weight (kg)</Label>
                  <Input
                    id="averageWeight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.averageWeight}
                    onChange={(e) => setFormData({ ...formData, averageWeight: e.target.value })}
                    placeholder="e.g., 0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalWeight">Total Weight (kg)</Label>
                  <Input
                    id="totalWeight"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.totalWeight}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value })}
                    placeholder="e.g., 250"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background"
                  placeholder="Market price, buyer info, quality notes..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding || !formData.quantity}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Harvest
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Harvest History</CardTitle>
        </CardHeader>
        <CardContent>
          {harvests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No harvests recorded yet. Click "Record Harvest" when you harvest fish.
            </p>
          ) : (
            <div className="space-y-3">
              {harvests.map((harvest) => (
                <div
                  key={harvest.id}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                    <Fish className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {harvest.quantity.toLocaleString()} {harvest.quantityUnit}
                        </p>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          harvest.isPartial 
                            ? "bg-yellow-100 text-yellow-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {harvest.isPartial ? "Partial" : "Full"}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(harvest.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-4 mt-1 text-sm text-gray-600">
                      {harvest.averageWeight && (
                        <span>Avg: {harvest.averageWeight} kg/fish</span>
                      )}
                      {harvest.totalWeight && (
                        <span>Total: {harvest.totalWeight} kg</span>
                      )}
                    </div>
                    {harvest.notes && (
                      <p className="text-sm text-gray-500 mt-1">{harvest.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
