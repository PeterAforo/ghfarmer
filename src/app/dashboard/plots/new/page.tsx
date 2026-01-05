"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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
import { Suspense } from "react";

const SIZE_UNITS = [
  { value: "HECTARES", label: "Hectares" },
  { value: "ACRES", label: "Acres" },
  { value: "SQUARE_METERS", label: "Square Meters" },
];

const USAGE_TYPES = [
  { value: "CROP", label: "Crop Production", description: "For growing crops" },
  { value: "LIVESTOCK", label: "Livestock", description: "For animal housing" },
  { value: "AQUACULTURE", label: "Aquaculture", description: "For fish farming" },
  { value: "MIXED", label: "Mixed Use", description: "Combination of uses" },
  { value: "FALLOW", label: "Fallow", description: "Resting land" },
  { value: "STORAGE", label: "Storage", description: "For storage facilities" },
];

const SOIL_TYPES = [
  "Sandy",
  "Clay",
  "Loamy",
  "Sandy Loam",
  "Clay Loam",
  "Silty",
  "Peat",
];

const IRRIGATION_TYPES = [
  "Rainfed",
  "Drip Irrigation",
  "Sprinkler",
  "Flood/Furrow",
  "Manual Watering",
  "None",
];

const PLOT_LOCATIONS = [
  "North Section",
  "South Section",
  "East Section",
  "West Section",
  "North-East Corner",
  "North-West Corner",
  "South-East Corner",
  "South-West Corner",
  "Central Area",
  "Near Entrance",
  "Near Water Source",
  "Near Storage",
  "Near Road",
  "Hillside",
  "Lowland/Valley",
  "Riverside",
  "Front Section",
  "Back Section",
  "Left Wing",
  "Right Wing",
];

interface Farm {
  id: string;
  name: string;
  size: number | null;
  sizeUnit: string;
}

function NewPlotForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFarmId = searchParams.get("farmId");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);

  const [formData, setFormData] = useState({
    farmId: preselectedFarmId || "",
    name: "",
    description: "",
    size: "",
    sizeUnit: "HECTARES",
    usageType: "",
    location: "",
    soilType: "",
    soilPh: "",
    irrigationType: "",
  });

  useEffect(() => {
    async function loadFarms() {
      try {
        const res = await fetch("/api/farms");
        if (res.ok) {
          const data = await res.json();
          setFarms(data);
          if (preselectedFarmId) {
            const farm = data.find((f: Farm) => f.id === preselectedFarmId);
            setSelectedFarm(farm || null);
          }
        }
      } catch (err) {
        console.error("Error loading farms:", err);
      } finally {
        setIsLoadingData(false);
      }
    }
    loadFarms();
  }, [preselectedFarmId]);

  // Generate plot name based on farm and usage type
  function generatePlotName(farm: Farm | null, usageType: string): string {
    if (!farm) return "";
    const prefix = usageType ? usageType.charAt(0) + usageType.slice(1).toLowerCase() : "Plot";
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}-${farm.name.substring(0, 3).toUpperCase()}-${timestamp}`;
  }

  function updateFormData(field: string, value: string) {
    if (field === "farmId") {
      const farm = farms.find((f) => f.id === value);
      setSelectedFarm(farm || null);
      setFormData((prev) => {
        const newData = { ...prev, farmId: value };
        // Auto-generate name if usage type is already selected
        if (farm && prev.usageType) {
          newData.name = generatePlotName(farm, prev.usageType);
        }
        return newData;
      });
    } else if (field === "usageType") {
      setFormData((prev) => {
        const newData = { ...prev, usageType: value };
        // Auto-generate name using current farm from state or find it
        const farm = selectedFarm || farms.find((f) => f.id === prev.farmId);
        if (farm) {
          newData.name = generatePlotName(farm, value);
        }
        return newData;
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/plots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: formData.farmId,
          name: formData.name,
          description: formData.description || undefined,
          size: parseFloat(formData.size),
          sizeUnit: formData.sizeUnit,
          usageType: formData.usageType,
          location: formData.location || undefined,
          soilType: formData.soilType || undefined,
          soilPh: formData.soilPh ? parseFloat(formData.soilPh) : undefined,
          irrigationType: formData.irrigationType || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create plot");
        return;
      }

      router.push(`/dashboard/plots/${data.id}`);
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
          <Link href="/dashboard/plots">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Plot</h1>
          <p className="text-gray-600">Allocate space within your farm</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You need to create a farm first before adding plots.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms/new">Create Your First Farm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Plot Details</CardTitle>
            <CardDescription>
              Define a section of your farm for specific use.
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
                        {farm.name} {farm.size && `(${farm.size} ${farm.sizeUnit.toLowerCase()})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedFarm?.size && (
                  <p className="text-xs text-gray-500">
                    Total farm size: {selectedFarm.size} {selectedFarm.sizeUnit.toLowerCase()}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Plot Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Plot A, North Section, Maize Field"
                  required
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Brief description of this plot..."
                  value={formData.description}
                  onChange={(e) => updateFormData("description", e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Plot Size *</Label>
                  <Input
                    id="size"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 0.5"
                    required
                    value={formData.size}
                    onChange={(e) => updateFormData("size", e.target.value)}
                    disabled={isLoading}
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

              <div className="space-y-2">
                <Label htmlFor="usageType">Usage Type *</Label>
                <Select
                  value={formData.usageType}
                  onValueChange={(value) => updateFormData("usageType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="What will this plot be used for?" />
                  </SelectTrigger>
                  <SelectContent>
                    {USAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <span className="font-medium">{type.label}</span>
                          <span className="text-gray-500 ml-2 text-xs">- {type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Location within Farm</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => updateFormData("location", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plot location" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLOT_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(formData.usageType === "CROP" || formData.usageType === "MIXED") && (
                <>
                  <div className="border-t pt-4">
                    <h3 className="font-medium mb-4">Soil Information (for crops)</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="soilType">Soil Type</Label>
                        <Select
                          value={formData.soilType}
                          onValueChange={(value) => updateFormData("soilType", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select soil type" />
                          </SelectTrigger>
                          <SelectContent>
                            {SOIL_TYPES.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="soilPh">Soil pH</Label>
                        <Input
                          id="soilPh"
                          type="number"
                          step="0.1"
                          min="0"
                          max="14"
                          placeholder="e.g., 6.5"
                          value={formData.soilPh}
                          onChange={(e) => updateFormData("soilPh", e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="irrigationType">Irrigation Type</Label>
                      <Select
                        value={formData.irrigationType}
                        onValueChange={(value) => updateFormData("irrigationType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select irrigation type" />
                        </SelectTrigger>
                        <SelectContent>
                          {IRRIGATION_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

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
                  disabled={isLoading || !formData.farmId || !formData.name || !formData.size || !formData.usageType}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Plot
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewPlotPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      }
    >
      <NewPlotForm />
    </Suspense>
  );
}
