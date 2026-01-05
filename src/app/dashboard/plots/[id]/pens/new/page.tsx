"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { ArrowLeft, Loader2, Calculator } from "lucide-react";
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

interface Plot {
  id: string;
  name: string;
  size: number;
  sizeUnit: string;
  usageType: string;
  pens: Array<{ id: string; area: number | null }>;
}

export default function NewPenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: plotId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlot, setIsLoadingPlot] = useState(true);
  const [error, setError] = useState("");
  const [plot, setPlot] = useState<Plot | null>(null);
  const [calculatedCapacity, setCalculatedCapacity] = useState<number | null>(null);
  const [capacityDetails, setCapacityDetails] = useState<{
    baseCapacity?: number;
    penTypeMultiplier?: { multiplier: number; description: string };
  } | null>(null);
  const [penCount, setPenCount] = useState(0);
  const [usedSpace, setUsedSpace] = useState(0);
  const [plotSpaceInSqM, setPlotSpaceInSqM] = useState(0);

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

  // Generate pen name
  function generatePenName(plotName: string, penType: string, count: number): string {
    const prefix = penType ? penType.split(" ")[0] : "Pen";
    return `${prefix}-${plotName.substring(0, 3).toUpperCase()}-${String(count + 1).padStart(2, "0")}`;
  }

  useEffect(() => {
    // Convert plot size to square meters
    function convertToSqMeters(size: number, unit: string): number {
      switch (unit) {
        case "HECTARES": return size * 10000;
        case "ACRES": return size * 4046.86;
        case "SQUARE_METERS": return size;
        default: return size * 4046.86; // Default to acres for Ghana
      }
    }

    async function loadPlot() {
      try {
        const res = await fetch(`/api/plots/${plotId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Plot data loaded:", data);
          console.log("Plot size:", data.size, "Unit:", data.sizeUnit);
          console.log("Pens:", data.pens);
          
          setPlot(data);
          setPenCount(data.pens?.length || 0);
          
          // Calculate used space from existing pens
          const used = (data.pens || []).reduce((sum: number, pen: { area: number | null }) => 
            sum + (pen.area || 0), 0);
          console.log("Used space by pens:", used);
          setUsedSpace(used);
          
          // Convert plot size to sq meters
          if (data.size) {
            const plotSqM = convertToSqMeters(data.size, data.sizeUnit || "ACRES");
            console.log("Plot size in sq m:", plotSqM);
            setPlotSpaceInSqM(plotSqM);
          }
        } else {
          console.log("Failed to load plot, redirecting");
          router.push("/dashboard/plots");
        }
      } catch (err) {
        console.error("Error loading plot:", err);
      } finally {
        setIsLoadingPlot(false);
      }
    }
    loadPlot();
  }, [plotId, router]);

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
    if (field === "penType" && typeof value === "string") {
      // Auto-generate pen name when pen type is selected
      setFormData((prev) => ({
        ...prev,
        penType: value,
        name: plot ? generatePenName(plot.name, value, penCount) : prev.name,
      }));
    } else if (field === "animalType" && typeof value === "string") {
      // Also generate name when animal type is selected if pen type exists
      setFormData((prev) => {
        const newData = { ...prev, animalType: value };
        if (!prev.name && prev.penType && plot) {
          newData.name = generatePenName(plot.name, prev.penType, penCount);
        }
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  }

  // Calculate current pen area and remaining space
  const currentPenArea = formData.area 
    ? parseFloat(formData.area) 
    : (formData.length && formData.width 
      ? parseFloat(formData.length) * parseFloat(formData.width) 
      : 0);
  
  const availableSpace = plotSpaceInSqM - usedSpace;
  const remainingAfterPen = availableSpace - currentPenArea;
  const penFitsPlot = currentPenArea <= availableSpace;
  const spaceWarning = currentPenArea > 0 && !penFitsPlot;

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

      const response = await fetch(`/api/plots/${plotId}/pens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          penType: formData.penType,
          length: formData.length ? parseFloat(formData.length) : undefined,
          width: formData.width ? parseFloat(formData.width) : undefined,
          area,
          animalType: formData.animalType || undefined,
          actualCapacity: formData.actualCapacity ? parseInt(formData.actualCapacity) : undefined,
          hasRoof: formData.hasRoof,
          hasFeeder: formData.hasFeeder,
          hasWaterer: formData.hasWaterer,
          floorType: formData.floorType || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create pen");
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

  if (isLoadingPlot) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Plot not found</p>
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Pen / Housing</h1>
          <p className="text-gray-600">Create housing for livestock in {plot.name}</p>
        </div>
      </div>

      {/* Plot Space Info */}
      {plotSpaceInSqM > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-blue-700">Plot Size</p>
                <p className="text-xl font-bold text-blue-900">
                  {plotSpaceInSqM.toLocaleString()} sq m
                </p>
                <p className="text-xs text-blue-600">
                  ({plot.size} {plot.sizeUnit.toLowerCase()})
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Used by Pens</p>
                <p className="text-xl font-bold text-blue-900">
                  {usedSpace.toLocaleString()} sq m
                </p>
                <p className="text-xs text-blue-600">{penCount} existing pens</p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Available</p>
                <p className="text-xl font-bold text-green-700">
                  {availableSpace.toLocaleString()} sq m
                </p>
                <p className="text-xs text-blue-600">
                  {((availableSpace / plotSpaceInSqM) * 100).toFixed(1)}% free
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pen Details</CardTitle>
          <CardDescription>
            Define the pen dimensions and the system will calculate animal capacity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Space Warning */}
            {spaceWarning && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md">
                <strong>Warning:</strong> This pen ({currentPenArea.toLocaleString()} sq m) exceeds 
                available plot space ({availableSpace.toLocaleString()} sq m). 
                Please reduce pen dimensions.
              </div>
            )}

            {/* Remaining Space Info */}
            {currentPenArea > 0 && penFitsPlot && (
              <div className="bg-green-50 border border-green-200 text-green-800 text-sm p-3 rounded-md">
                <strong>Space after this pen:</strong> {remainingAfterPen.toLocaleString()} sq m remaining 
                ({((remainingAfterPen / plotSpaceInSqM) * 100).toFixed(1)}% of plot)
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
                <Label htmlFor="penType">Pen Type *</Label>
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
              <Label htmlFor="animalType">Animal Type</Label>
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
                          Base capacity: {capacityDetails.baseCapacity} birds × {capacityDetails.penTypeMultiplier.multiplier}x ({formData.penType})
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
                  <Label htmlFor="floorType">Floor Type</Label>
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
                disabled={isLoading || !formData.name || !formData.penType || spaceWarning}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Pen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
