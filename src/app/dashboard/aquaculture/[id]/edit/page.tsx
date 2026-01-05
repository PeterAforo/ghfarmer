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

export default function EditPondPage({
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
    name: "",
    size: "",
    sizeUnit: "SQUARE_METERS",
    fishSpecies: "",
    stockingDensity: "",
    status: "ACTIVE",
    notes: "",
  });

  useEffect(() => {
    fetchPond();
  }, [id]);

  async function fetchPond() {
    try {
      const res = await fetch(`/api/aquaculture/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || "",
          size: data.size?.toString() || "",
          sizeUnit: data.sizeUnit || "SQUARE_METERS",
          fishSpecies: data.fishSpecies || "",
          stockingDensity: data.stockingDensity?.toString() || "",
          status: data.status || "ACTIVE",
          notes: data.notes || "",
        });
      }
    } catch (err) {
      setError("Failed to load pond");
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/aquaculture/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          size: formData.size ? parseFloat(formData.size) : null,
          stockingDensity: formData.stockingDensity ? parseFloat(formData.stockingDensity) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      router.push(`/dashboard/aquaculture/${id}`);
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
          <Link href={`/dashboard/aquaculture/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Pond</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pond Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Pond Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sizeUnit">Unit</Label>
                <select
                  id="sizeUnit"
                  value={formData.sizeUnit}
                  onChange={(e) => setFormData({ ...formData, sizeUnit: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="SQUARE_METERS">Square Meters</option>
                  <option value="HECTARES">Hectares</option>
                  <option value="ACRES">Acres</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fishSpecies">Fish Species</Label>
              <Input
                id="fishSpecies"
                value={formData.fishSpecies}
                onChange={(e) => setFormData({ ...formData, fishSpecies: e.target.value })}
                placeholder="e.g., Tilapia, Catfish"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockingDensity">Stocking Density (fish/m²)</Label>
                <Input
                  id="stockingDensity"
                  type="number"
                  step="0.1"
                  value={formData.stockingDensity}
                  onChange={(e) => setFormData({ ...formData, stockingDensity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="HARVESTED">Harvested</option>
                  <option value="FALLOW">Fallow</option>
                  <option value="PREPARING">Preparing</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background"
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
