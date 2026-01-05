"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function EditCropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    plotName: "",
    landArea: "",
    landAreaUnit: "HECTARES",
    status: "PLANNED",
    notes: "",
    plantingDate: "",
    expectedHarvestDate: "",
  });

  useEffect(() => {
    fetchEntry();
  }, [id]);

  async function fetchEntry() {
    try {
      const res = await fetch(`/api/crops/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          plotName: data.plotName || "",
          landArea: data.landArea?.toString() || "",
          landAreaUnit: data.landAreaUnit || "HECTARES",
          status: data.status || "PLANNED",
          notes: data.notes || "",
          plantingDate: data.plantingDate ? data.plantingDate.split("T")[0] : "",
          expectedHarvestDate: data.expectedHarvestDate ? data.expectedHarvestDate.split("T")[0] : "",
        });
      }
    } catch (err) {
      setError("Failed to load crop entry");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          landArea: formData.landArea ? parseFloat(formData.landArea) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      router.push(`/dashboard/crops/${id}`);
    } catch (err) {
      setError("An error occurred");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/crops/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Crop</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="plotName">Plot Name</Label>
              <Input
                id="plotName"
                value={formData.plotName}
                onChange={(e) => setFormData({ ...formData, plotName: e.target.value })}
                placeholder="e.g., Field A, Plot 1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="landArea">Land Area</Label>
                <Input
                  id="landArea"
                  type="number"
                  step="0.01"
                  value={formData.landArea}
                  onChange={(e) => setFormData({ ...formData, landArea: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="landAreaUnit">Unit</Label>
                <select
                  id="landAreaUnit"
                  value={formData.landAreaUnit}
                  onChange={(e) => setFormData({ ...formData, landAreaUnit: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="HECTARES">Hectares</option>
                  <option value="ACRES">Acres</option>
                  <option value="SQUARE_METERS">Square Meters</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background"
              >
                <option value="PLANNED">Planned</option>
                <option value="PLANTED">Planted</option>
                <option value="GROWING">Growing</option>
                <option value="HARVESTING">Harvesting</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plantingDate">Planting Date</Label>
                <Input
                  id="plantingDate"
                  type="date"
                  value={formData.plantingDate}
                  onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest</Label>
                <Input
                  id="expectedHarvestDate"
                  type="date"
                  value={formData.expectedHarvestDate}
                  onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
