"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const POND_TYPES = [
  { value: "EARTHEN", label: "Earthen Pond" },
  { value: "CONCRETE", label: "Concrete Pond" },
  { value: "PLASTIC_LINED", label: "Plastic Lined Pond" },
  { value: "CAGE", label: "Cage Culture" },
  { value: "TANK", label: "Tank System" },
];

const SIZE_UNITS = [
  { value: "SQUARE_METERS", label: "Square Meters" },
  { value: "HECTARES", label: "Hectares" },
  { value: "ACRES", label: "Acres" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "PREPARING", label: "Preparing" },
  { value: "FALLOW", label: "Fallow" },
  { value: "HARVESTING", label: "Harvesting" },
];

const FISH_SPECIES = [
  "Tilapia",
  "Catfish (Clarias)",
  "Catfish (Heterobranchus)",
  "Carp",
  "Nile Perch",
  "African Bonytongue",
  "Mudfish",
  "Other",
];

interface Farm {
  id: string;
  name: string;
}

export default function NewPondPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);

  const [formData, setFormData] = useState({
    farmId: "",
    name: "",
    type: "EARTHEN",
    size: "",
    sizeUnit: "SQUARE_METERS",
    depth: "",
    waterSource: "",
    species: "",
    stockingDate: "",
    stockingDensity: "",
    initialCount: "",
    expectedPricePerKg: "",
    status: "PREPARING",
    notes: "",
  });

  useEffect(() => {
    async function loadFarms() {
      try {
        const res = await fetch("/api/farms");
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
        }
      } catch (err) {
        console.error("Error loading farms:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadFarms();
  }, []);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/aquaculture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: formData.farmId,
          name: formData.name,
          type: formData.type,
          size: parseFloat(formData.size),
          sizeUnit: formData.sizeUnit,
          depth: formData.depth ? parseFloat(formData.depth) : undefined,
          waterSource: formData.waterSource || undefined,
          species: formData.species || undefined,
          stockingDate: formData.stockingDate || undefined,
          stockingDensity: formData.stockingDensity
            ? parseFloat(formData.stockingDensity)
            : undefined,
          initialCount: formData.initialCount
            ? parseInt(formData.initialCount)
            : undefined,
          expectedPricePerKg: formData.expectedPricePerKg
            ? parseFloat(formData.expectedPricePerKg)
            : undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create pond");
        return;
      }

      router.push("/dashboard/aquaculture");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/aquaculture">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Pond</h1>
          <p className="text-gray-600">Set up a new fish pond or tank</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You need to create a farm first before adding ponds.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms/new">Create Your First Farm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pond Details</CardTitle>
            <CardDescription>
              Enter the details of your fish pond or aquaculture system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="farmId">Farm *</Label>
                <Select
                  value={formData.farmId}
                  onValueChange={(value) => updateFormData("farmId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a farm" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Pond Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pond 1, Main Tank, Cage A"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Pond Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POND_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Size *</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 100"
                    value={formData.size}
                    onChange={(e) => updateFormData("size", e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizeUnit">Unit</Label>
                  <Select
                    value={formData.sizeUnit}
                    onValueChange={(value) => updateFormData("sizeUnit", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (meters)</Label>
                  <Input
                    id="depth"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 1.5"
                    value={formData.depth}
                    onChange={(e) => updateFormData("depth", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterSource">Water Source</Label>
                  <Input
                    id="waterSource"
                    placeholder="e.g., Borehole, River, Rain"
                    value={formData.waterSource}
                    onChange={(e) => updateFormData("waterSource", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Fish Species</Label>
                <Select
                  value={formData.species}
                  onValueChange={(value) => updateFormData("species", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                  <SelectContent>
                    {FISH_SPECIES.map((species) => (
                      <SelectItem key={species} value={species}>
                        {species}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stockingDate">Stocking Date</Label>
                  <Input
                    id="stockingDate"
                    type="date"
                    value={formData.stockingDate}
                    onChange={(e) => updateFormData("stockingDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="initialCount">Initial Stock Count</Label>
                  <Input
                    id="initialCount"
                    type="number"
                    min="0"
                    placeholder="e.g., 1000"
                    value={formData.initialCount}
                    onChange={(e) => updateFormData("initialCount", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockingDensity">Stocking Density (fish/m²)</Label>
                <Input
                  id="stockingDensity"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.stockingDensity}
                  onChange={(e) => updateFormData("stockingDensity", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedPricePerKg">Expected Selling Price (GHS/kg)</Label>
                  <Input
                    id="expectedPricePerKg"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 40.00"
                    value={formData.expectedPricePerKg}
                    onChange={(e) => updateFormData("expectedPricePerKg", e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Used to calculate expected revenue from harvest
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Expected Revenue</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-green-50 flex items-center">
                    <span className="text-green-700 font-medium text-sm">
                      Set after harvest to see revenue
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => updateFormData("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <textarea
                  id="notes"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any additional notes..."
                  value={formData.notes}
                  onChange={(e) => updateFormData("notes", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isLoading || !formData.farmId || !formData.name || !formData.size}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Pond
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
