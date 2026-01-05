"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
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

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_USE", label: "In Use" },
  { value: "FALLOW", label: "Fallow" },
  { value: "UNDER_PREPARATION", label: "Under Preparation" },
];

interface Plot {
  id: string;
  name: string;
  description: string | null;
  size: number;
  sizeUnit: string;
  usageType: string;
  location: string | null;
  soilType: string | null;
  soilPh: number | null;
  irrigationType: string | null;
  status: string;
  farm: {
    id: string;
    name: string;
  };
}

export default function EditPlotPage({
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

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    size: "",
    sizeUnit: "HECTARES",
    usageType: "",
    location: "",
    soilType: "",
    soilPh: "",
    irrigationType: "",
    status: "AVAILABLE",
  });

  useEffect(() => {
    async function loadPlot() {
      try {
        const res = await fetch(`/api/plots/${plotId}`);
        if (res.ok) {
          const data = await res.json();
          setPlot(data);
          setFormData({
            name: data.name || "",
            description: data.description || "",
            size: data.size?.toString() || "",
            sizeUnit: data.sizeUnit || "HECTARES",
            usageType: data.usageType || "",
            location: data.location || "",
            soilType: data.soilType || "",
            soilPh: data.soilPh?.toString() || "",
            irrigationType: data.irrigationType || "",
            status: data.status || "AVAILABLE",
          });
        } else {
          router.push("/dashboard/plots");
        }
      } catch (err) {
        console.error("Error loading plot:", err);
        router.push("/dashboard/plots");
      } finally {
        setIsLoadingPlot(false);
      }
    }
    loadPlot();
  }, [plotId, router]);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/plots/${plotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          size: parseFloat(formData.size),
          sizeUnit: formData.sizeUnit,
          usageType: formData.usageType,
          location: formData.location || undefined,
          soilType: formData.soilType || undefined,
          soilPh: formData.soilPh ? parseFloat(formData.soilPh) : undefined,
          irrigationType: formData.irrigationType || undefined,
          status: formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update plot");
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/plots/${plotId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Plot</h1>
          <p className="text-gray-600">Update plot details for {plot.farm.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plot Details</CardTitle>
          <CardDescription>
            Modify the plot information below.
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
              <Label htmlFor="name">Plot Name *</Label>
              <Input
                id="name"
                placeholder="e.g., North Field, Section A"
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
                <Label htmlFor="size">Size *</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g., 0.5"
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usageType">Usage Type *</Label>
                <Select
                  value={formData.usageType}
                  onValueChange={(value) => updateFormData("usageType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select usage" />
                  </SelectTrigger>
                  <SelectContent>
                    {USAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location within Farm</Label>
              <Input
                id="location"
                placeholder="e.g., North corner, Near the river"
                value={formData.location}
                onChange={(e) => updateFormData("location", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Soil & Irrigation (Optional)</h3>
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
                disabled={isLoading || !formData.name || !formData.size || !formData.usageType}
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
