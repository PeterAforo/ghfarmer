"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Egg,
  Milk,
  Scale,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const PRODUCTION_TYPES = [
  { value: "EGGS", label: "Eggs", icon: Egg, unit: "count" },
  { value: "MILK", label: "Milk", icon: Milk, unit: "litres" },
  { value: "WEIGHT", label: "Weight/Growth", icon: Scale, unit: "kg" },
  { value: "OTHER", label: "Other", icon: Package, unit: "units" },
];

interface ProductionRecord {
  id: string;
  type: string;
  date: string;
  eggCount: number | null;
  eggGrade: string | null;
  milkVolume: number | null;
  milkUnit: string | null;
  weight: number | null;
  weightUnit: string | null;
  notes: string | null;
}

export default function LivestockProductionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [records, setRecords] = useState<ProductionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "EGGS",
    date: new Date().toISOString().split("T")[0],
    eggCount: "",
    eggGrade: "",
    milkVolume: "",
    milkUnit: "litres",
    weight: "",
    weightUnit: "kg",
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
  }, [id]);

  async function fetchRecords() {
    try {
      const res = await fetch(`/api/livestock/${id}/production`);
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (error) {
      console.error("Failed to fetch records");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);

    try {
      const payload: any = {
        type: formData.type,
        date: formData.date,
        notes: formData.notes || undefined,
      };

      if (formData.type === "EGGS") {
        payload.eggCount = formData.eggCount ? parseInt(formData.eggCount) : undefined;
        payload.eggGrade = formData.eggGrade || undefined;
      } else if (formData.type === "MILK") {
        payload.milkVolume = formData.milkVolume ? parseFloat(formData.milkVolume) : undefined;
        payload.milkUnit = formData.milkUnit || undefined;
      } else if (formData.type === "WEIGHT") {
        payload.weight = formData.weight ? parseFloat(formData.weight) : undefined;
        payload.weightUnit = formData.weightUnit || undefined;
      }

      const res = await fetch(`/api/livestock/${id}/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newRecord = await res.json();
        setRecords([newRecord, ...records]);
        setShowForm(false);
        setFormData({
          type: "EGGS",
          date: new Date().toISOString().split("T")[0],
          eggCount: "",
          eggGrade: "",
          milkVolume: "",
          milkUnit: "litres",
          weight: "",
          weightUnit: "kg",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to add record");
    } finally {
      setIsAdding(false);
    }
  }

  const getRecordIcon = (type: string) => {
    const record = PRODUCTION_TYPES.find((r) => r.value === type);
    return record?.icon || Package;
  };

  const getRecordLabel = (type: string) => {
    const record = PRODUCTION_TYPES.find((r) => r.value === type);
    return record?.label || type;
  };

  const formatProductionValue = (record: ProductionRecord) => {
    if (record.type === "EGGS" && record.eggCount) {
      return `${record.eggCount} eggs${record.eggGrade ? ` (${record.eggGrade})` : ""}`;
    }
    if (record.type === "MILK" && record.milkVolume) {
      return `${record.milkVolume} ${record.milkUnit || "litres"}`;
    }
    if (record.type === "WEIGHT" && record.weight) {
      return `${record.weight} ${record.weightUnit || "kg"}`;
    }
    return "—";
  };

  // Calculate totals
  const totalEggs = records
    .filter((r) => r.type === "EGGS")
    .reduce((sum, r) => sum + (r.eggCount || 0), 0);
  const totalMilk = records
    .filter((r) => r.type === "MILK")
    .reduce((sum, r) => sum + (r.milkVolume || 0), 0);

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
            <Link href={`/dashboard/livestock/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Production Records</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Egg className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Eggs</p>
                <p className="text-2xl font-bold">{totalEggs.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Milk className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Milk</p>
                <p className="text-2xl font-bold">{totalMilk.toLocaleString()} L</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Records</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Production Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Production Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    {PRODUCTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.type === "EGGS" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eggCount">Egg Count</Label>
                    <Input
                      id="eggCount"
                      type="number"
                      min="0"
                      value={formData.eggCount}
                      onChange={(e) => setFormData({ ...formData, eggCount: e.target.value })}
                      placeholder="Number of eggs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eggGrade">Grade (optional)</Label>
                    <select
                      id="eggGrade"
                      value={formData.eggGrade}
                      onChange={(e) => setFormData({ ...formData, eggGrade: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="">Select grade</option>
                      <option value="Grade A">Grade A</option>
                      <option value="Grade B">Grade B</option>
                      <option value="Grade C">Grade C</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.type === "MILK" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="milkVolume">Volume</Label>
                    <Input
                      id="milkVolume"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.milkVolume}
                      onChange={(e) => setFormData({ ...formData, milkVolume: e.target.value })}
                      placeholder="Volume"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="milkUnit">Unit</Label>
                    <select
                      id="milkUnit"
                      value={formData.milkUnit}
                      onChange={(e) => setFormData({ ...formData, milkUnit: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="litres">Litres</option>
                      <option value="gallons">Gallons</option>
                    </select>
                  </div>
                </div>
              )}

              {formData.type === "WEIGHT" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="Weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weightUnit">Unit</Label>
                    <select
                      id="weightUnit"
                      value={formData.weightUnit}
                      onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    >
                      <option value="kg">Kilograms</option>
                      <option value="lbs">Pounds</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Record
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Production History</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No production records yet. Click "Add Record" to log eggs, milk, or weight.
            </p>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const Icon = getRecordIcon(record.type);
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{getRecordLabel(record.type)}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-lg font-semibold text-primary">
                        {formatProductionValue(record)}
                      </p>
                      {record.notes && (
                        <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
