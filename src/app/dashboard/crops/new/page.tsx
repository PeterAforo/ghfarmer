"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Calculator, Calendar, Coins, Sprout } from "lucide-react";
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
import { getMaturityDays, calculateExpectedHarvestDate, formatDateForInput } from "@/lib/crop-maturity";

interface CapacityInfo {
  capacity: number;
  areaInHectares: number;
  spacingInfo: {
    plantSpacing: number;
    rowSpacing: number;
    plantsPerHectare: number;
    description: string;
    daysToMaturity: number;
    plantingMaterial: string;
    seedUnit: string;
    seedRatePerHectare: number;
  } | null;
}

const SEED_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "pieces", label: "Pieces" },
  { value: "bundles", label: "Bundles" },
  { value: "bags", label: "Bags" },
  { value: "cuttings", label: "Cuttings" },
  { value: "suckers", label: "Suckers" },
  { value: "setts", label: "Setts" },
];

const SIZE_UNITS = [
  { value: "HECTARES", label: "Hectares" },
  { value: "ACRES", label: "Acres" },
  { value: "SQUARE_METERS", label: "Square Meters" },
];

const STATUSES = [
  { value: "PLANNED", label: "Planned" },
  { value: "PLANTED", label: "Planted" },
  { value: "GROWING", label: "Growing" },
  { value: "HARVESTING", label: "Harvesting" },
  { value: "COMPLETED", label: "Completed" },
];

interface Farm {
  id: string;
  name: string;
}

interface Plot {
  id: string;
  name: string;
  size: number;
  sizeUnit: string;
  usageType: string;
  status: string;
  farm: { id: string; name: string };
}

interface Crop {
  id: string;
  name: string;
  englishName?: string;
  category: string;
  varieties: Array<{ id: string; name: string }>;
  maturityDays: number | null;
}

function NewCropForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFarmId = searchParams.get("farmId");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [capacityInfo, setCapacityInfo] = useState<CapacityInfo | null>(null);
  const [isLoadingPlots, setIsLoadingPlots] = useState(false);
  const [availableSpace, setAvailableSpace] = useState<{
    totalSize: number;
    usedSpace: number;
    availableSpace: number;
    sizeUnit: string;
    usagePercentage: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    farmId: preselectedFarmId || "",
    cropId: "",
    varietyId: "",
    plotName: "",
    landArea: "",
    landAreaUnit: "HECTARES",
    plantingDate: "",
    expectedHarvestDate: "",
    seedQuantity: "",
    seedUnit: "kg",
    seedCostPerUnit: "",
    expectedPricePerUnit: "",
    status: "PLANNED",
    notes: "",
  });

  // Calculate total seed cost
  const totalSeedCost = formData.seedQuantity && formData.seedCostPerUnit
    ? parseFloat(formData.seedQuantity) * parseFloat(formData.seedCostPerUnit)
    : null;

  useEffect(() => {
    async function loadData() {
      try {
        const [farmsRes, cropsRes] = await Promise.all([
          fetch("/api/farms"),
          fetch("/api/crops/types"),
        ]);

        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          setFarms(farmsData);
        }

        if (cropsRes.ok) {
          const cropsData = await cropsRes.json();
          setCrops(cropsData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Fetch plots and available space when farm is selected
  useEffect(() => {
    async function loadPlotsAndSpace() {
      if (!formData.farmId) {
        setPlots([]);
        setAvailableSpace(null);
        return;
      }
      
      setIsLoadingPlots(true);
      try {
        const [plotsRes, spaceRes] = await Promise.all([
          fetch(`/api/plots?farmId=${formData.farmId}`),
          fetch(`/api/farms/${formData.farmId}/available-space`),
        ]);
        
        if (plotsRes.ok) {
          const data = await plotsRes.json();
          // Filter to only show CROP type plots that are available or in use
          const cropPlots = data.filter((plot: Plot) => 
            plot.usageType === "CROP" || plot.usageType === "MIXED"
          );
          setPlots(cropPlots);
        }
        
        if (spaceRes.ok) {
          const spaceData = await spaceRes.json();
          setAvailableSpace({
            totalSize: spaceData.totalSize,
            usedSpace: spaceData.usedSpace,
            availableSpace: spaceData.availableSpace,
            sizeUnit: spaceData.sizeUnit,
            usagePercentage: spaceData.usagePercentage,
          });
        }
      } catch (err) {
        console.error("Error loading plots:", err);
      } finally {
        setIsLoadingPlots(false);
      }
    }
    
    loadPlotsAndSpace();
  }, [formData.farmId]);

  // Calculate capacity when crop type or area changes
  useEffect(() => {
    async function calculateCapacity() {
      if (selectedCrop && formData.landArea) {
        try {
          const cropName = selectedCrop.englishName || selectedCrop.name;
          const res = await fetch(
            `/api/plots/capacity?type=crop&name=${encodeURIComponent(cropName)}&area=${formData.landArea}&unit=${formData.landAreaUnit}`
          );
          if (res.ok) {
            const data = await res.json();
            setCapacityInfo({
              capacity: data.capacity,
              areaInHectares: data.areaInHectares,
              spacingInfo: data.spacingInfo,
            });
            // Auto-fill seed unit and seed quantity if available
            if (data.spacingInfo) {
              const calculatedSeedQuantity = data.spacingInfo.seedRatePerHectare * data.areaInHectares;
              const roundedQuantity = data.spacingInfo.seedUnit === "kg" 
                ? Math.ceil(calculatedSeedQuantity * 10) / 10
                : Math.ceil(calculatedSeedQuantity);
              
              setFormData((prev) => ({
                ...prev,
                seedUnit: data.spacingInfo.seedUnit,
                seedQuantity: roundedQuantity.toString(),
              }));
            }
          }
        } catch (err) {
          console.error("Error calculating capacity:", err);
        }
      } else {
        setCapacityInfo(null);
      }
    }
    calculateCapacity();
  }, [selectedCrop, formData.landArea, formData.landAreaUnit]);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // When crop is selected, reset variety
      if (field === "cropId") {
        const crop = crops.find((c) => c.id === value);
        setSelectedCrop(crop || null);
        newData.varietyId = "";
        
        // Auto-calculate expected harvest if planting date is set
        if (crop && prev.plantingDate) {
          const maturityDays = crop.maturityDays || getMaturityDays(crop.name);
          if (maturityDays) {
            const plantingDate = new Date(prev.plantingDate);
            if (!isNaN(plantingDate.getTime())) {
              const harvestDate = calculateExpectedHarvestDate(plantingDate, maturityDays);
              if (harvestDate) {
                newData.expectedHarvestDate = formatDateForInput(harvestDate);
              }
            }
          }
        }
      }

      // When planting date is set, auto-calculate expected harvest
      if (field === "plantingDate" && value) {
        // Use newData.cropId or prev.cropId to find the crop
        const cropId = newData.cropId || prev.cropId;
        const crop = cropId ? crops.find((c) => c.id === cropId) : null;
        if (crop) {
          const maturityDays = crop.maturityDays || getMaturityDays(crop.name);
          if (maturityDays) {
            const plantingDate = new Date(value);
            if (!isNaN(plantingDate.getTime())) {
              const harvestDate = calculateExpectedHarvestDate(plantingDate, maturityDays);
              if (harvestDate) {
                newData.expectedHarvestDate = formatDateForInput(harvestDate);
              }
            }
          }
        }
      }

      return newData;
    });

    // Update selectedCrop state separately for cropId changes
    if (field === "cropId") {
      const crop = crops.find((c) => c.id === value);
      setSelectedCrop(crop || null);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: formData.farmId,
          cropId: formData.cropId,
          varietyId: formData.varietyId || undefined,
          plotName: formData.plotName || undefined,
          landArea: formData.landArea ? parseFloat(formData.landArea) : undefined,
          landAreaUnit: formData.landAreaUnit,
          plantingDate: formData.plantingDate || undefined,
          expectedHarvestDate: formData.expectedHarvestDate || undefined,
          seedQuantity: formData.seedQuantity ? parseFloat(formData.seedQuantity) : undefined,
          seedUnit: formData.seedUnit || undefined,
          seedCostPerUnit: formData.seedCostPerUnit ? parseFloat(formData.seedCostPerUnit) : undefined,
          totalSeedCost: totalSeedCost || undefined,
          calculatedCapacity: capacityInfo?.capacity || undefined,
          expectedPricePerUnit: formData.expectedPricePerUnit ? parseFloat(formData.expectedPricePerUnit) : undefined,
          status: formData.status,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create crop entry");
        return;
      }

      router.push("/dashboard/crops");
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

  // Group crops by category
  const cropsByCategory = crops.reduce((acc, crop) => {
    const category = crop.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(crop);
    return acc;
  }, {} as Record<string, Crop[]>);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/crops">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Crop</h1>
          <p className="text-gray-600">Start tracking a new crop</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You need to create a farm first before adding crops.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms/new">Create Your First Farm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Crop Details</CardTitle>
            <CardDescription>
              Enter the details of the crop you want to track.
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
                
                {/* Available Space Indicator */}
                {availableSpace && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Farm Space Usage</span>
                      <span className="text-sm text-gray-500">
                        {availableSpace.usagePercentage}% used
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${
                          availableSpace.usagePercentage > 90
                            ? "bg-red-500"
                            : availableSpace.usagePercentage > 70
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(availableSpace.usagePercentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        Used: {availableSpace.usedSpace.toFixed(2)} {availableSpace.sizeUnit.toLowerCase()}
                      </span>
                      <span className="font-medium text-green-600">
                        Available: {availableSpace.availableSpace.toFixed(2)} {availableSpace.sizeUnit.toLowerCase()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cropId">Crop Type *</Label>
                <Select
                  value={formData.cropId}
                  onValueChange={(value) => updateFormData("cropId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(cropsByCategory).map(([category, categorycrops]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                          {category.replace("_", " ")}
                        </div>
                        {categorycrops.map((crop) => (
                          <SelectItem key={crop.id} value={crop.id}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCrop && selectedCrop.varieties.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="varietyId">Variety (Optional)</Label>
                  <Select
                    value={formData.varietyId}
                    onValueChange={(value) => updateFormData("varietyId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a variety" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCrop.varieties.map((variety) => (
                        <SelectItem key={variety.id} value={variety.id}>
                          {variety.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="plotName">Plot (Optional)</Label>
                {plots.length > 0 ? (
                  <Select
                    value={formData.plotName}
                    onValueChange={(value) => {
                      updateFormData("plotName", value);
                      // Auto-fill land area from selected plot
                      const selectedPlot = plots.find(p => p.name === value);
                      if (selectedPlot) {
                        updateFormData("landArea", selectedPlot.size.toString());
                        updateFormData("landAreaUnit", selectedPlot.sizeUnit);
                      }
                    }}
                    disabled={isLoading || isLoadingPlots}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingPlots ? "Loading plots..." : "Select a plot"} />
                    </SelectTrigger>
                    <SelectContent>
                      {plots.map((plot) => (
                        <SelectItem key={plot.id} value={plot.name}>
                          {plot.name} ({plot.size} {plot.sizeUnit.toLowerCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">
                    {!formData.farmId 
                      ? "Select a farm first to see available plots"
                      : isLoadingPlots 
                        ? "Loading plots..."
                        : "No crop plots available for this farm. You can create plots in Farm Management."}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="landArea">Land Area</Label>
                  <Input
                    id="landArea"
                    type="number"
                    step="0.01"
                    min="0"
                    max={availableSpace ? availableSpace.availableSpace : undefined}
                    placeholder="e.g., 2.5"
                    value={formData.landArea}
                    onChange={(e) => updateFormData("landArea", e.target.value)}
                    disabled={isLoading}
                  />
                  {availableSpace && formData.landArea && parseFloat(formData.landArea) > availableSpace.availableSpace && (
                    <p className="text-xs text-red-500">
                      ⚠️ Exceeds available space ({availableSpace.availableSpace.toFixed(2)} {availableSpace.sizeUnit.toLowerCase()} available)
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landAreaUnit">Unit</Label>
                  <Select
                    value={formData.landAreaUnit}
                    onValueChange={(value) => updateFormData("landAreaUnit", value)}
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

              {/* Capacity Calculator */}
              {capacityInfo && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <Calculator className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-sm text-green-800">Calculated Capacity</p>
                      <p className="text-2xl font-bold text-green-900">
                        {capacityInfo.capacity.toLocaleString()} plants
                      </p>
                      {capacityInfo.spacingInfo && (
                        <p className="text-xs text-green-700">
                          {capacityInfo.spacingInfo.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plantingDate">Planting Date</Label>
                  <Input
                    id="plantingDate"
                    type="date"
                    value={formData.plantingDate}
                    onChange={(e) => updateFormData("plantingDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedHarvestDate">Expected Harvest</Label>
                  <Input
                    id="expectedHarvestDate"
                    type="date"
                    value={formData.expectedHarvestDate}
                    onChange={(e) =>
                      updateFormData("expectedHarvestDate", e.target.value)
                    }
                    disabled={isLoading}
                  />
                  {capacityInfo?.spacingInfo?.daysToMaturity && formData.plantingDate && (
                    <p className="text-xs text-gray-500">
                      Auto-calculated: {capacityInfo.spacingInfo.daysToMaturity} days to maturity
                    </p>
                  )}
                </div>
              </div>

              {/* Seed Information */}
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Sprout className="h-4 w-4" />
                  Seed / Planting Material
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seedQuantity">Quantity (auto-calculated)</Label>
                    <Input
                      id="seedQuantity"
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.seedQuantity}
                      onChange={(e) => updateFormData("seedQuantity", e.target.value)}
                      disabled={isLoading}
                      className="bg-gray-50"
                    />
                    {capacityInfo?.spacingInfo && (
                      <p className="text-xs text-gray-500">
                        Based on {capacityInfo.spacingInfo.seedRatePerHectare} {formData.seedUnit}/ha
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seedUnit">Unit (auto-selected)</Label>
                    <Input
                      id="seedUnit"
                      value={SEED_UNITS.find(u => u.value === formData.seedUnit)?.label || formData.seedUnit}
                      disabled
                      className="bg-gray-100"
                    />
                    {capacityInfo?.spacingInfo?.plantingMaterial && (
                      <p className="text-xs text-gray-500">
                        Material: {capacityInfo.spacingInfo.plantingMaterial}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="seedCostPerUnit">Cost per {formData.seedUnit} (GHS)</Label>
                    <Input
                      id="seedCostPerUnit"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 50.00"
                      value={formData.seedCostPerUnit}
                      onChange={(e) => updateFormData("seedCostPerUnit", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Seed Cost</Label>
                    {totalSeedCost !== null ? (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 rounded border border-amber-200">
                        <Coins className="h-4 w-4 text-amber-600" />
                        <span className="font-bold text-amber-800">
                          GHS {totalSeedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded border text-gray-400 text-sm">
                        Enter cost per unit to calculate
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expectedPricePerUnit">Expected Selling Price (GHS/kg)</Label>
                  <Input
                    id="expectedPricePerUnit"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g., 8.00 per kg"
                    value={formData.expectedPricePerUnit}
                    onChange={(e) => updateFormData("expectedPricePerUnit", e.target.value)}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Used to calculate expected revenue from harvest
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Expected Revenue (if yield achieved)</Label>
                  <div className="h-10 px-3 py-2 rounded-md border bg-green-50 flex items-center">
                    <span className="text-green-700 font-medium text-sm">
                      Set expected yield after harvest to see revenue
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
                  disabled={isLoading || !formData.farmId || !formData.cropId}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Crop
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewCropPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      }
    >
      <NewCropForm />
    </Suspense>
  );
}
