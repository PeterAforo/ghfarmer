"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Loader2, Calculator, Trash2 } from "lucide-react";
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

const PEN_TYPES = [
  "Open Pen",
  "Enclosed",
  "Free Range",
  "Deep Litter",
  "Battery Cage",
  "Slatted Floor",
  "Paddock",
  "Kraal",
];

const FLOOR_TYPES = [
  "Concrete",
  "Earth/Soil",
  "Slatted",
  "Deep Litter",
  "Wire Mesh",
  "Wooden",
];

const ANIMAL_TYPES = [
  "Chicken",
  "Broiler",
  "Layer",
  "Turkey",
  "Duck",
  "Guinea Fowl",
  "Goat",
  "Sheep",
  "Pig",
  "Cattle",
  "Rabbit",
  "Grasscutter",
];

interface Pen {
  id: string;
  name: string;
  penType: string;
  length: number | null;
  width: number | null;
  area: number | null;
  animalType: string | null;
  calculatedCapacity: number | null;
  actualCapacity: number | null;
  hasRoof: boolean;
  hasFeeder: boolean;
  hasWaterer: boolean;
  floorType: string | null;
  notes: string | null;
}

interface Plot {
  id: string;
  name: string;
}

export default function EditPenPage({
  params,
}: {
  params: Promise<{ id: string; penId: string }>;
}) {
  const { id: plotId, penId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [plot, setPlot] = useState<Plot | null>(null);
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [capacityDetails, setCapacityDetails] = useState<{
    baseCapacity?: number;
    penTypeMultiplier?: { multiplier: number; description: string };
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    penType: "",
    length: "",
    width: "",
    area: "",
    animalType: "",
    actualCapacity: "",
    hasRoof: true,
    hasFeeder: false,
    hasWaterer: false,
    floorType: "",
    notes: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        // Load plot info
        const plotRes = await fetch(`/api/plots/${plotId}`);
        if (plotRes.ok) {
          const plotData = await plotRes.json();
          setPlot(plotData);
        }

        // Load pen data
        const penRes = await fetch(`/api/plots/${plotId}/pens/${penId}`);
        if (penRes.ok) {
          const pen: Pen = await penRes.json();
          setFormData({
            name: pen.name || "",
            penType: pen.penType || "",
            length: pen.length?.toString() || "",
            width: pen.width?.toString() || "",
            area: pen.area?.toString() || "",
            animalType: pen.animalType || "",
            actualCapacity: pen.actualCapacity?.toString() || "",
            hasRoof: pen.hasRoof ?? true,
            hasFeeder: pen.hasFeeder ?? false,
            hasWaterer: pen.hasWaterer ?? false,
            floorType: pen.floorType || "",
            notes: pen.notes || "",
          });
          if (pen.calculatedCapacity) {
            setCalculatedCapacity(pen.calculatedCapacity);
          }
        } else {
          router.push(`/dashboard/plots/${plotId}`);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, [plotId, penId, router]);

  // Calculate capacity when dimensions, animal type, or pen type changes
  const animalType = formData.animalType;
  const penType = formData.penType;
  const length = formData.length;
  const width = formData.width;
  const areaInput = formData.area;

  useEffect(() => {
    async function calculateCapacity() {
      const area = areaInput || (length && width 
        ? (parseFloat(length) * parseFloat(width)).toString() 
        : "");
      
      if (animalType && area) {
        try {
          let url = `/api/plots/capacity?type=livestock&name=${encodeURIComponent(animalType)}&area=${area}`;
          if (penType) {
            url += `&penType=${encodeURIComponent(penType)}`;
          }
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            setCalculatedCapacity(data.capacity);
            setCapacityDetails(data);
          }
        } catch (err) {
          console.error("Error calculating capacity:", err);
        }
      } else {
        setCalculatedCapacity(null);
        setCapacityDetails(null);
      }
    }
    calculateCapacity();
  }, [animalType, penType, length, width, areaInput]);

  function updateFormData(field: string, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const area = formData.area 
        ? parseFloat(formData.area) 
        : (formData.length && formData.width 
          ? parseFloat(formData.length) * parseFloat(formData.width) 
          : undefined);

      const response = await fetch(`/api/plots/${plotId}/pens/${penId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          penType: formData.penType,
          length: formData.length ? parseFloat(formData.length) : null,
          width: formData.width ? parseFloat(formData.width) : null,
          area,
          animalType: formData.animalType || null,
          actualCapacity: formData.actualCapacity ? parseInt(formData.actualCapacity) : null,
          hasRoof: formData.hasRoof,
          hasFeeder: formData.hasFeeder,
          hasWaterer: formData.hasWaterer,
          floorType: formData.floorType || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update pen");
        return;
      }

      router.push(`/dashboard/plots/${plotId}`);
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this pen? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/plots/${plotId}/pens/${penId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push(`/dashboard/plots/${plotId}`);
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to delete pen");
      }
    } catch (err) {
      setError("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const calculatedArea = formData.length && formData.width
    ? (parseFloat(formData.length) * parseFloat(formData.width)).toFixed(2)
    : "";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/plots/${plotId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Edit Pen / Housing</h1>
          <p className="text-gray-600">Update pen details{plot ? ` in ${plot.name}` : ""}</p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          <span className="ml-2">Delete</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pen Details</CardTitle>
          <CardDescription>
            Update the pen dimensions and capacity settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Pen Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Pen 1, Coop A"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>Pen Type *</Label>
                <Select
                  value={formData.penType}
                  onValueChange={(value) => updateFormData("penType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PEN_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Animal Type</Label>
              <Select
                value={formData.animalType}
                onValueChange={(value) => updateFormData("animalType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="What animals will be housed here?" />
                </SelectTrigger>
                <SelectContent>
                  {ANIMAL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Pen Dimensions</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length (meters)</Label>
                  <Input
                    id="length"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 10"
                    value={formData.length}
                    onChange={(e) => updateFormData("length", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width (meters)</Label>
                  <Input
                    id="width"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g., 5"
                    value={formData.width}
                    onChange={(e) => updateFormData("width", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Area (sq m)</Label>
                  <Input
                    id="area"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder={calculatedArea || "Auto-calculated"}
                    value={formData.area || calculatedArea}
                    onChange={(e) => updateFormData("area", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Capacity Calculator */}
            {calculatedCapacity !== null && (
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-3">
                  <Calculator className="h-8 w-8 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800">Calculated Capacity</p>
                    <p className="text-2xl font-bold text-amber-900">
                      {calculatedCapacity} {formData.animalType}
                    </p>
                    {capacityDetails?.penTypeMultiplier ? (
                      <div className="text-xs text-amber-700 space-y-1">
                        <p>
                          Base capacity: {capacityDetails.baseCapacity} × {capacityDetails.penTypeMultiplier.multiplier}x ({formData.penType})
                        </p>
                        <p className="italic">{capacityDetails.penTypeMultiplier.description}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-amber-700">
                        Based on standard space requirements{formData.penType ? ` for ${formData.penType}` : ""}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="actualCapacity">Override Capacity (optional)</Label>
              <Input
                id="actualCapacity"
                type="number"
                min="1"
                placeholder={calculatedCapacity ? `Calculated: ${calculatedCapacity}` : "Enter capacity"}
                value={formData.actualCapacity}
                onChange={(e) => updateFormData("actualCapacity", e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Leave empty to use calculated capacity
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Pen Features</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Floor Type</Label>
                  <Select
                    value={formData.floorType}
                    onValueChange={(value) => updateFormData("floorType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select floor type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLOOR_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasRoof}
                      onChange={(e) => updateFormData("hasRoof", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Has Roof</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasFeeder}
                      onChange={(e) => updateFormData("hasFeeder", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Has Feeder</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.hasWaterer}
                      onChange={(e) => updateFormData("hasWaterer", e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Has Waterer</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={isLoading || !formData.name || !formData.penType}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
