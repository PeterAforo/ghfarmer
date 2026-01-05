"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Droplets,
  Thermometer,
  Wind,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface WaterQualityRecord {
  id: string;
  date: string;
  ph: number | null;
  temperature: number | null;
  dissolvedOxygen: number | null;
  ammonia: number | null;
  notes: string | null;
}

const OPTIMAL_RANGES = {
  ph: { min: 6.5, max: 8.5, unit: "" },
  temperature: { min: 25, max: 30, unit: "°C" },
  dissolvedOxygen: { min: 5, max: 10, unit: "mg/L" },
  ammonia: { min: 0, max: 0.02, unit: "mg/L" },
};

function getStatusColor(value: number | null, param: keyof typeof OPTIMAL_RANGES) {
  if (value === null) return "text-gray-400";
  const range = OPTIMAL_RANGES[param];
  if (value >= range.min && value <= range.max) return "text-green-600";
  return "text-red-600";
}

export default function WaterQualityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [records, setRecords] = useState<WaterQualityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    ph: "",
    temperature: "",
    dissolvedOxygen: "",
    ammonia: "",
    notes: "",
  });

  useEffect(() => {
    fetchRecords();
  }, [id]);

  async function fetchRecords() {
    try {
      const res = await fetch(`/api/aquaculture/${id}/water-quality`);
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
      const res = await fetch(`/api/aquaculture/${id}/water-quality`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: formData.date,
          ph: formData.ph ? parseFloat(formData.ph) : undefined,
          temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
          dissolvedOxygen: formData.dissolvedOxygen ? parseFloat(formData.dissolvedOxygen) : undefined,
          ammonia: formData.ammonia ? parseFloat(formData.ammonia) : undefined,
          notes: formData.notes || undefined,
        }),
      });

      if (res.ok) {
        const newRecord = await res.json();
        setRecords([newRecord, ...records]);
        setShowForm(false);
        setFormData({
          date: new Date().toISOString().split("T")[0],
          ph: "",
          temperature: "",
          dissolvedOxygen: "",
          ammonia: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to add record");
    } finally {
      setIsAdding(false);
    }
  }

  const latestRecord = records[0];

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
          <h1 className="text-2xl font-bold">Water Quality</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Reading
        </Button>
      </div>

      {/* Current Status */}
      {latestRecord && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">pH Level</p>
                  <p className={`text-2xl font-bold ${getStatusColor(latestRecord.ph, "ph")}`}>
                    {latestRecord.ph ?? "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Thermometer className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Temperature</p>
                  <p className={`text-2xl font-bold ${getStatusColor(latestRecord.temperature, "temperature")}`}>
                    {latestRecord.temperature ? `${latestRecord.temperature}°C` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Wind className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dissolved O₂</p>
                  <p className={`text-2xl font-bold ${getStatusColor(latestRecord.dissolvedOxygen, "dissolvedOxygen")}`}>
                    {latestRecord.dissolvedOxygen ? `${latestRecord.dissolvedOxygen} mg/L` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ammonia</p>
                  <p className={`text-2xl font-bold ${getStatusColor(latestRecord.ammonia, "ammonia")}`}>
                    {latestRecord.ammonia ? `${latestRecord.ammonia} mg/L` : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>New Water Quality Reading</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ph">pH Level (6.5-8.5)</Label>
                  <Input
                    id="ph"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    value={formData.ph}
                    onChange={(e) => setFormData({ ...formData, ph: e.target.value })}
                    placeholder="e.g., 7.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    placeholder="e.g., 28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dissolvedOxygen">Dissolved Oxygen (mg/L)</Label>
                  <Input
                    id="dissolvedOxygen"
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.dissolvedOxygen}
                    onChange={(e) => setFormData({ ...formData, dissolvedOxygen: e.target.value })}
                    placeholder="e.g., 6.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ammonia">Ammonia (mg/L)</Label>
                  <Input
                    id="ammonia"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.ammonia}
                    onChange={(e) => setFormData({ ...formData, ammonia: e.target.value })}
                    placeholder="e.g., 0.01"
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
                  placeholder="Additional observations..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Reading
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Optimal Ranges Reference */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Optimal Ranges for Fish</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">pH</p>
              <p className="font-medium">6.5 - 8.5</p>
            </div>
            <div>
              <p className="text-gray-500">Temperature</p>
              <p className="font-medium">25 - 30°C</p>
            </div>
            <div>
              <p className="text-gray-500">Dissolved O₂</p>
              <p className="font-medium">5 - 10 mg/L</p>
            </div>
            <div>
              <p className="text-gray-500">Ammonia</p>
              <p className="font-medium">&lt; 0.02 mg/L</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reading History</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No water quality readings yet. Click "Add Reading" to start monitoring.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Date</th>
                    <th className="text-center py-2 px-2">pH</th>
                    <th className="text-center py-2 px-2">Temp (°C)</th>
                    <th className="text-center py-2 px-2">DO (mg/L)</th>
                    <th className="text-center py-2 px-2">NH₃ (mg/L)</th>
                    <th className="text-left py-2 px-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className={`text-center py-2 px-2 ${getStatusColor(record.ph, "ph")}`}>
                        {record.ph ?? "—"}
                      </td>
                      <td className={`text-center py-2 px-2 ${getStatusColor(record.temperature, "temperature")}`}>
                        {record.temperature ?? "—"}
                      </td>
                      <td className={`text-center py-2 px-2 ${getStatusColor(record.dissolvedOxygen, "dissolvedOxygen")}`}>
                        {record.dissolvedOxygen ?? "—"}
                      </td>
                      <td className={`text-center py-2 px-2 ${getStatusColor(record.ammonia, "ammonia")}`}>
                        {record.ammonia ?? "—"}
                      </td>
                      <td className="py-2 px-2 text-gray-500 truncate max-w-[150px]">
                        {record.notes || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
