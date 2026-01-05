"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Wheat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const UNITS = ["kg", "bags", "tonnes", "crates", "bundles"];

export default function RecordYieldPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [cropName, setCropName] = useState("");
  const [formData, setFormData] = useState({
    quantity: "",
    unit: "kg",
    qualityNotes: "",
    harvestDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchCrop();
  }, [id]);

  async function fetchCrop() {
    try {
      const res = await fetch(`/api/crops/${id}`);
      if (res.ok) {
        const data = await res.json();
        setCropName(data.crop?.name || "Crop");
      }
    } catch (error) {
      console.error("Failed to fetch crop");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch(`/api/crops/${id}/yield`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          quantity: parseFloat(formData.quantity),
        }),
      });

      if (res.ok) {
        router.push(`/dashboard/crops/${id}`);
      }
    } catch (error) {
      console.error("Failed to record yield");
    } finally {
      setIsSaving(false);
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
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/crops/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Record Harvest</h1>
          <p className="text-gray-500">{cropName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5 text-amber-600" />
            Yield Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity Harvested *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit *</Label>
                <select
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  {UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvestDate">Harvest Date *</Label>
              <Input
                id="harvestDate"
                type="date"
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qualityNotes">Quality Notes</Label>
              <textarea
                id="qualityNotes"
                value={formData.qualityNotes}
                onChange={(e) => setFormData({ ...formData, qualityNotes: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background"
                placeholder="Describe the quality of the harvest (e.g., good quality, some pest damage, etc.)"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving || !formData.quantity}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Harvest
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
