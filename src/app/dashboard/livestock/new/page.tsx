"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Suspense } from "react";
import { 
  getLivestockMaturityInfo, 
  generateLivestockName, 
  generateTagNumber, 
  calculateMaturityDate, 
  formatDateForInput 
} from "@/lib/livestock-maturity";
import { getProduceTypes, ProduceType } from "@/lib/livestock-produce";

const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "UNKNOWN", label: "Unknown" },
];

const SOURCES = [
  { value: "PURCHASED", label: "Purchased" },
  { value: "BORN_ON_FARM", label: "Born on Farm" },
  { value: "GIFTED", label: "Gifted" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "SOLD", label: "Sold" },
  { value: "DECEASED", label: "Deceased" },
  { value: "TRANSFERRED", label: "Transferred" },
];

interface Farm {
  id: string;
  name: string;
}

interface LivestockType {
  id: string;
  name: string;
  category: string;
  breeds: Array<{ id: string; name: string }>;
}

interface Pen {
  id: string;
  name: string;
  animalType: string | null;
  calculatedCapacity: number | null;
  currentOccupancy: number;
  plotName: string;
}

function NewLivestockForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedFarmId = searchParams.get("farmId");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [farms, setFarms] = useState<Farm[]>([]);
  const [livestockTypes, setLivestockTypes] = useState<LivestockType[]>([]);
  const [selectedType, setSelectedType] = useState<LivestockType | null>(null);
  const [pens, setPens] = useState<Pen[]>([]);
  const [isLoadingPens, setIsLoadingPens] = useState(false);
  const [produceTypes, setProduceTypes] = useState<ProduceType[]>([]);
  const [selectedProduces, setSelectedProduces] = useState<{
    produceId: string;
    price: string;
  }[]>([]);

  const [formData, setFormData] = useState({
    farmId: preselectedFarmId || "",
    livestockId: "",
    breedId: "",
    tagNumber: "",
    name: "",
    batchId: "",
    quantity: "1",
    gender: "",
    birthDate: "",
    acquiredDate: "",
    maturityDate: "",
    source: "",
    costPerAnimal: "",
    status: "ACTIVE",
    location: "",
    notes: "",
  });
  const [entryCount, setEntryCount] = useState(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [farmsRes, typesRes] = await Promise.all([
          fetch("/api/farms"),
          fetch("/api/livestock/types"),
        ]);

        if (farmsRes.ok) {
          const farmsData = await farmsRes.json();
          setFarms(farmsData);
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          setLivestockTypes(typesData);
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoadingData(false);
      }
    }

    loadData();
  }, []);

  // Load pens when farm is selected
  useEffect(() => {
    async function loadPens() {
      if (!formData.farmId) {
        setPens([]);
        return;
      }
      
      setIsLoadingPens(true);
      try {
        // Fetch plots for this farm that are LIVESTOCK or MIXED type
        const res = await fetch(`/api/plots?farmId=${formData.farmId}`);
        if (res.ok) {
          const plots = await res.json();
          // Extract pens from livestock/mixed plots
          console.log("Plots loaded:", plots);
          const allPens: Pen[] = [];
          for (const plot of plots) {
            if (plot.usageType === "LIVESTOCK" || plot.usageType === "MIXED") {
              console.log("Processing plot:", plot.name, "pens:", plot.pens);
              for (const pen of plot.pens || []) {
                console.log("Pen data:", pen);
                allPens.push({
                  id: pen.id,
                  name: pen.name,
                  animalType: pen.animalType,
                  calculatedCapacity: pen.calculatedCapacity,
                  currentOccupancy: pen.currentOccupancy || 0,
                  plotName: plot.name,
                });
              }
            }
          }
          console.log("All pens:", allPens);
          setPens(allPens);
        }
      } catch (err) {
        console.error("Error loading pens:", err);
      } finally {
        setIsLoadingPens(false);
      }
    }
    loadPens();
  }, [formData.farmId]);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // When animal type is selected, auto-generate name and tag
      if (field === "livestockId") {
        const type = livestockTypes.find((t) => t.id === value);
        setSelectedType(type || null);
        newData.breedId = "";
        
        if (type) {
          // Auto-generate name and tag number
          const sequence = Date.now() % 10000;
          newData.name = generateLivestockName(type.name, sequence);
          newData.tagNumber = generateTagNumber(type.name, sequence);
          
          // Load produce types for this animal
          const produces = getProduceTypes(type.name);
          setProduceTypes(produces);
          
          // Auto-select first produce type with default price
          if (produces.length > 0) {
            setSelectedProduces([{
              produceId: produces[0].id,
              price: produces[0].defaultPrice?.toString() || "",
            }]);
          } else {
            setSelectedProduces([]);
          }
          
          // Auto-calculate maturity date if birth date is set
          if (prev.birthDate) {
            const maturityInfo = getLivestockMaturityInfo(type.name);
            if (maturityInfo) {
              const birthDate = new Date(prev.birthDate);
              const maturityDate = calculateMaturityDate(birthDate, maturityInfo.maturityDays);
              newData.maturityDate = formatDateForInput(maturityDate);
            }
          }
        } else {
          setProduceTypes([]);
          setSelectedProduces([]);
        }
      }

      // When birth date is set, auto-calculate maturity date
      if (field === "birthDate" && value && selectedType) {
        const maturityInfo = getLivestockMaturityInfo(selectedType.name);
        if (maturityInfo) {
          const birthDate = new Date(value);
          const maturityDate = calculateMaturityDate(birthDate, maturityInfo.maturityDays);
          newData.maturityDate = formatDateForInput(maturityDate);
        }
      }

      return newData;
    });

    // Update selectedType state separately for livestockId changes
    if (field === "livestockId") {
      const type = livestockTypes.find((t) => t.id === value);
      setSelectedType(type || null);
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/livestock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: formData.farmId,
          livestockId: formData.livestockId,
          breedId: formData.breedId || undefined,
          tagNumber: formData.tagNumber || undefined,
          name: formData.name || undefined,
          batchId: formData.batchId || undefined,
          quantity: parseInt(formData.quantity) || 1,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
          acquiredDate: formData.acquiredDate || undefined,
          source: formData.source || undefined,
          costPerAnimal: formData.costPerAnimal ? parseFloat(formData.costPerAnimal) : undefined,
          expectedSellingPrice: selectedProduces.length > 0 && selectedProduces[0].price 
            ? parseFloat(selectedProduces[0].price) 
            : undefined,
          produceTypes: selectedProduces.length > 0 
            ? selectedProduces.map(p => ({ produceId: p.produceId, price: parseFloat(p.price) || 0 }))
            : undefined,
          status: formData.status,
          location: formData.location || undefined,
          notes: formData.notes || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create livestock entry");
        return;
      }

      router.push("/dashboard/livestock");
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

  // Group livestock by category
  const typesByCategory = livestockTypes.reduce((acc, type) => {
    const category = type.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(type);
    return acc;
  }, {} as Record<string, LivestockType[]>);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/livestock">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Livestock</h1>
          <p className="text-gray-600">Register new animals</p>
        </div>
      </div>

      {farms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">
              You need to create a farm first before adding livestock.
            </p>
            <Button asChild>
              <Link href="/dashboard/farms/new">Create Your First Farm</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Livestock Details</CardTitle>
            <CardDescription>
              Enter the details of the animals you want to track.
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
                <Label htmlFor="livestockId">Animal Type *</Label>
                <Select
                  value={formData.livestockId}
                  onValueChange={(value) => updateFormData("livestockId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typesByCategory).map(([category, types]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50">
                          {category.replace("_", " ")}
                        </div>
                        {types.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedType && selectedType.breeds.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="breedId">Breed (Optional)</Label>
                  <Select
                    value={formData.breedId}
                    onValueChange={(value) => updateFormData("breedId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a breed" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedType.breeds.map((breed) => (
                        <SelectItem key={breed.id} value={breed.id}>
                          {breed.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="location">Location / Housing</Label>
                {pens.length > 0 ? (
                  <>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => updateFormData("location", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={isLoadingPens ? "Loading pens..." : "Select a pen"} />
                      </SelectTrigger>
                      <SelectContent>
                        {pens.map((pen) => {
                          const availableSpace = (pen.calculatedCapacity || 0) - pen.currentOccupancy;
                          const isFull = availableSpace <= 0;
                          return (
                            <SelectItem key={pen.id} value={pen.name} disabled={isFull}>
                              <div className="flex flex-col">
                                <span className={isFull ? "text-gray-400" : ""}>{pen.name}</span>
                                <span className={`text-xs ${isFull ? "text-red-500" : "text-gray-500"}`}>
                                  {pen.plotName} • {pen.animalType || "Any"} • 
                                  {pen.currentOccupancy}/{pen.calculatedCapacity || "?"} occupied
                                  {isFull && " (FULL)"}
                                </span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {/* Capacity Warning */}
                    {(() => {
                      const selectedPen = pens.find(p => p.name === formData.location);
                      if (selectedPen && formData.quantity) {
                        const quantity = parseInt(formData.quantity) || 0;
                        const availableSpace = (selectedPen.calculatedCapacity || 0) - selectedPen.currentOccupancy;
                        const exceedsCapacity = quantity > availableSpace;
                        
                        if (exceedsCapacity) {
                          return (
                            <div className="bg-red-50 border border-red-200 text-red-800 text-sm p-3 rounded-md mt-2">
                              <strong>⚠️ Capacity Warning:</strong> This pen can only hold {availableSpace} more animals 
                              (Current: {selectedPen.currentOccupancy}/{selectedPen.calculatedCapacity}). 
                              You are trying to add {quantity}.
                            </div>
                          );
                        } else if (availableSpace > 0) {
                          return (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Pen has space for {availableSpace} animals. Adding {quantity} will leave {availableSpace - quantity} spaces.
                            </p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </>
                ) : (
                  <div>
                    <Input
                      id="location"
                      placeholder={formData.farmId ? "No pens available - create pens in Plots first" : "Select a farm first"}
                      value={formData.location}
                      onChange={(e) => updateFormData("location", e.target.value)}
                      disabled={isLoading || !formData.farmId}
                    />
                    {formData.farmId && pens.length === 0 && !isLoadingPens && (
                      <p className="text-xs text-amber-600 mt-1">
                        No pens found. <Link href="/dashboard/plots" className="underline">Create pens in Plots</Link> first.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name / ID</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Bessie, Batch-001"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagNumber">Tag Number</Label>
                  <Input
                    id="tagNumber"
                    placeholder="e.g., GH-2024-001"
                    value={formData.tagNumber}
                    onChange={(e) => updateFormData("tagNumber", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => updateFormData("quantity", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => updateFormData("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => updateFormData("birthDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maturityDate">Expected Maturity Date</Label>
                  <Input
                    id="maturityDate"
                    type="date"
                    value={formData.maturityDate}
                    onChange={(e) => updateFormData("maturityDate", e.target.value)}
                    disabled={isLoading}
                  />
                  {selectedType && (
                    <p className="text-xs text-gray-500">
                      {getLivestockMaturityInfo(selectedType.name)?.description || "Auto-calculated from birth date"}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="acquiredDate">Acquired Date</Label>
                  <Input
                    id="acquiredDate"
                    type="date"
                    value={formData.acquiredDate}
                    onChange={(e) => updateFormData("acquiredDate", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={formData.source}
                    onValueChange={(value) => updateFormData("source", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCES.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.source === "PURCHASED" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costPerAnimal">Cost per Animal (GHS)</Label>
                    <Input
                      id="costPerAnimal"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g., 25.00"
                      value={formData.costPerAnimal}
                      onChange={(e) => updateFormData("costPerAnimal", e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Total Cost</Label>
                    <div className="h-10 px-3 py-2 rounded-md border bg-gray-50 flex items-center">
                      <span className="text-gray-700 font-medium">
                        GHS {((parseFloat(formData.costPerAnimal) || 0) * (parseInt(formData.quantity) || 1)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Produce Type and Pricing - Multiple Selection */}
              {selectedType && produceTypes.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-gray-900">Expected Produce & Pricing</h3>
                    <p className="text-xs text-gray-500">Select all applicable produce types</p>
                  </div>
                  
                  {/* Produce Type Checkboxes */}
                  <div className="space-y-3 mb-4">
                    {produceTypes.map((produce) => {
                      const isSelected = selectedProduces.some(p => p.produceId === produce.id);
                      const selectedProduce = selectedProduces.find(p => p.produceId === produce.id);
                      
                      return (
                        <div 
                          key={produce.id} 
                          className={`p-4 border rounded-lg transition-colors ${isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id={`produce-${produce.id}`}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProduces(prev => [...prev, {
                                    produceId: produce.id,
                                    price: produce.defaultPrice?.toString() || "",
                                  }]);
                                } else {
                                  setSelectedProduces(prev => prev.filter(p => p.produceId !== produce.id));
                                }
                              }}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <label htmlFor={`produce-${produce.id}`} className="font-medium text-gray-900 cursor-pointer">
                                {produce.name}
                              </label>
                              <p className="text-sm text-gray-500">{produce.unitDescription}</p>
                              
                              {isSelected && (
                                <div className="mt-3 flex items-center gap-3">
                                  <Label className="text-sm whitespace-nowrap">
                                    Price (GHS/{produce.unit}):
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder={produce.defaultPrice?.toString() || "0.00"}
                                    value={selectedProduce?.price || ""}
                                    onChange={(e) => {
                                      setSelectedProduces(prev => prev.map(p => 
                                        p.produceId === produce.id 
                                          ? { ...p, price: e.target.value }
                                          : p
                                      ));
                                    }}
                                    className="w-32"
                                    disabled={isLoading}
                                  />
                                  {produce.defaultPrice && (
                                    <span className="text-xs text-gray-400">
                                      Default: GHS {produce.defaultPrice}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Revenue Summary for all selected produces */}
                  {selectedProduces.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-900 mb-3">Expected Revenue Summary</h4>
                      <div className="space-y-3">
                        {selectedProduces.map((selected) => {
                          const produce = produceTypes.find(p => p.id === selected.produceId);
                          if (!produce || !selected.price) return null;
                          
                          const quantity = parseInt(formData.quantity) || 1;
                          const price = parseFloat(selected.price) || 0;
                          
                          let revenueInfo = { label: "", value: 0, note: "" };
                          
                          if (produce.id === "eggs_crate") {
                            const cratesPerBirdPerYear = 6;
                            revenueInfo = {
                              label: `Eggs (${quantity} birds)`,
                              value: price * cratesPerBirdPerYear * quantity,
                              note: `~${cratesPerBirdPerYear} crates/bird/year`,
                            };
                          } else if (produce.id === "milk_litre") {
                            const litresPerDay = 10;
                            const daysPerYear = 305;
                            revenueInfo = {
                              label: `Milk (${quantity} animals)`,
                              value: price * litresPerDay * daysPerYear * quantity,
                              note: `~${litresPerDay}L/day × ${daysPerYear} days`,
                            };
                          } else if (produce.unit === "animal" || produce.unit === "bird") {
                            revenueInfo = {
                              label: `${produce.name} (${quantity} ${produce.unit}s)`,
                              value: price * quantity,
                              note: "One-time sale",
                            };
                          } else {
                            revenueInfo = {
                              label: `${produce.name}`,
                              value: price,
                              note: `Per ${produce.unit}`,
                            };
                          }
                          
                          return (
                            <div key={selected.produceId} className="flex justify-between items-center py-2 border-b border-green-200 last:border-0">
                              <div>
                                <p className="text-sm font-medium text-green-800">{revenueInfo.label}</p>
                                <p className="text-xs text-green-600">{revenueInfo.note}</p>
                              </div>
                              <p className="text-lg font-bold text-green-900">
                                GHS {revenueInfo.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            </div>
                          );
                        })}
                        
                        {/* Total */}
                        {selectedProduces.filter(s => s.price).length > 1 && (
                          <div className="flex justify-between items-center pt-2 border-t-2 border-green-300">
                            <p className="font-medium text-green-900">Combined Revenue Potential</p>
                            <p className="text-xl font-bold text-green-900">
                              GHS {selectedProduces.reduce((total, selected) => {
                                const produce = produceTypes.find(p => p.id === selected.produceId);
                                if (!produce || !selected.price) return total;
                                
                                const quantity = parseInt(formData.quantity) || 1;
                                const price = parseFloat(selected.price) || 0;
                                
                                if (produce.id === "eggs_crate") {
                                  return total + (price * 6 * quantity);
                                } else if (produce.id === "milk_litre") {
                                  return total + (price * 10 * 305 * quantity);
                                } else if (produce.unit === "animal" || produce.unit === "bird") {
                                  return total + (price * quantity);
                                }
                                return total + price;
                              }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                  disabled={isLoading || !formData.farmId || !formData.livestockId}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Livestock
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function NewLivestockPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      }
    >
      <NewLivestockForm />
    </Suspense>
  );
}
