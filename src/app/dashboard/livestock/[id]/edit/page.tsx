"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { 
  getLivestockMaturityInfo, 
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
  { value: "INHERITED", label: "Inherited" },
  { value: "OTHER", label: "Other" },
];

const STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "SOLD", label: "Sold" },
  { value: "DECEASED", label: "Deceased" },
  { value: "TRANSFERRED", label: "Transferred" },
];

interface LivestockType {
  id: string;
  name: string;
  category: string;
  breeds: Array<{ id: string; name: string }>;
}

interface LivestockEntry {
  id: string;
  name: string;
  tagNumber: string;
  quantity: number;
  gender: string;
  birthDate: string | null;
  maturityDate: string | null;
  acquiredDate: string | null;
  source: string | null;
  costPerAnimal: number | null;
  expectedSellingPrice: number | null;
  status: string;
  housingLocation: string | null;
  notes: string | null;
  livestock: {
    id: string;
    englishName: string;
    category: string;
  };
  breed: {
    id: string;
    name: string;
  } | null;
  farm: {
    id: string;
    name: string;
  };
}

export default function EditLivestockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [entry, setEntry] = useState<LivestockEntry | null>(null);
  const [livestockTypes, setLivestockTypes] = useState<LivestockType[]>([]);
  const [selectedType, setSelectedType] = useState<LivestockType | null>(null);
  const [produceTypes, setProduceTypes] = useState<ProduceType[]>([]);
  const [selectedProduces, setSelectedProduces] = useState<{
    produceId: string;
    price: string;
  }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    tagNumber: "",
    quantity: "1",
    gender: "",
    birthDate: "",
    maturityDate: "",
    acquiredDate: "",
    source: "",
    costPerAnimal: "",
    status: "ACTIVE",
    housingLocation: "",
    notes: "",
    livestockId: "",
    breedId: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [entryRes, typesRes] = await Promise.all([
          fetch(`/api/livestock/${id}`),
          fetch("/api/livestock/types"),
        ]);

        let typesData: LivestockType[] = [];
        if (typesRes.ok) {
          typesData = await typesRes.json();
          setLivestockTypes(typesData);
        }

        if (entryRes.ok) {
          const data: LivestockEntry = await entryRes.json();
          setEntry(data);
          
          // Find the livestock type from the just-loaded types data
          const type = typesData.find(t => t.id === data.livestock?.id) || null;
          setSelectedType(type);
          
          setFormData({
            name: data.name || "",
            tagNumber: data.tagNumber || "",
            quantity: data.quantity?.toString() || "1",
            gender: data.gender || "",
            birthDate: data.birthDate ? data.birthDate.split("T")[0] : "",
            maturityDate: data.maturityDate ? data.maturityDate.split("T")[0] : "",
            acquiredDate: data.acquiredDate ? data.acquiredDate.split("T")[0] : "",
            source: data.source || "",
            costPerAnimal: data.costPerAnimal?.toString() || "",
            status: data.status || "ACTIVE",
            housingLocation: data.location || "",
            notes: data.notes || "",
            livestockId: data.livestock?.id || "",
            breedId: data.breed?.id || "",
          });

          // Load produce types for this animal
          if (data.livestock?.englishName) {
            const produces = getProduceTypes(data.livestock.englishName);
            setProduceTypes(produces);
            
            // Set initial selected produce with price
            if (data.expectedSellingPrice && produces.length > 0) {
              setSelectedProduces([{
                produceId: produces[0].id,
                price: data.expectedSellingPrice.toString(),
              }]);
            }
          }
        } else {
          setError("Failed to load livestock entry");
        }
      } catch (err) {
        setError("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Update selected type when livestockTypes loads
  useEffect(() => {
    if (livestockTypes.length > 0 && formData.livestockId) {
      const type = livestockTypes.find(t => t.id === formData.livestockId);
      setSelectedType(type || null);
      
      if (type) {
        const produces = getProduceTypes(type.name);
        setProduceTypes(produces);
      }
    }
  }, [livestockTypes, formData.livestockId]);

  function updateFormData(field: string, value: string) {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // When animal type is selected
      if (field === "livestockId") {
        const type = livestockTypes.find((t) => t.id === value);
        setSelectedType(type || null);
        newData.breedId = "";
        
        if (type) {
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
      if (field === "birthDate" && value) {
        // Use entry's livestock name or selectedType name
        const animalName = entry?.livestock?.englishName || selectedType?.name;
        if (animalName) {
          const maturityInfo = getLivestockMaturityInfo(animalName);
          if (maturityInfo) {
            const birthDate = new Date(value);
            const maturityDate = calculateMaturityDate(birthDate, maturityInfo.maturityDays);
            newData.maturityDate = formatDateForInput(maturityDate);
          }
        }
      }

      return newData;
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/livestock/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || undefined,
          tagNumber: formData.tagNumber || undefined,
          quantity: parseInt(formData.quantity) || 1,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
          maturityDate: formData.maturityDate || undefined,
          acquiredDate: formData.acquiredDate || undefined,
          source: formData.source || undefined,
          costPerAnimal: formData.costPerAnimal ? parseFloat(formData.costPerAnimal) : undefined,
          expectedSellingPrice: selectedProduces.length > 0 && selectedProduces[0].price 
            ? parseFloat(selectedProduces[0].price) 
            : undefined,
          status: formData.status,
          location: formData.housingLocation || undefined,
          notes: formData.notes || undefined,
          breedId: formData.breedId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }

      router.push(`/dashboard/livestock/${id}`);
      router.refresh();
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
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/livestock/${id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Livestock</h1>
          {entry && (
            <p className="text-sm text-gray-500">
              {entry.livestock?.englishName} • {entry.farm?.name}
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Animal Type (Read-only) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Animal Type</Label>
                <Input
                  value={entry?.livestock?.englishName || ""}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Cannot be changed after creation</p>
              </div>
              {selectedType?.breeds && selectedType.breeds.length > 0 && (
                <div className="space-y-2">
                  <Label>Breed (Optional)</Label>
                  <Select
                    value={formData.breedId}
                    onValueChange={(value) => updateFormData("breedId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select breed" />
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
            </div>

            {/* Name and Tag */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="e.g., Bessie, Flock A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagNumber">Tag Number</Label>
                <Input
                  id="tagNumber"
                  value={formData.tagNumber}
                  onChange={(e) => updateFormData("tagNumber", e.target.value)}
                  placeholder="e.g., GH-LYR-123456"
                />
              </div>
            </div>

            {/* Quantity and Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => updateFormData("quantity", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => updateFormData("birthDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maturityDate">Expected Maturity Date</Label>
                <Input
                  id="maturityDate"
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => updateFormData("maturityDate", e.target.value)}
                />
                {(entry?.livestock?.englishName || selectedType?.name) && (
                  <p className="text-xs text-gray-500">
                    {getLivestockMaturityInfo(entry?.livestock?.englishName || selectedType?.name || "")?.description}
                  </p>
                )}
              </div>
            </div>

            {/* Acquired Date and Source */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquiredDate">Acquired Date</Label>
                <Input
                  id="acquiredDate"
                  type="date"
                  value={formData.acquiredDate}
                  onChange={(e) => updateFormData("acquiredDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
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

            {/* Cost */}
            {formData.source === "PURCHASED" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="costPerAnimal">Cost per Animal (GHS)</Label>
                  <Input
                    id="costPerAnimal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.costPerAnimal}
                    onChange={(e) => updateFormData("costPerAnimal", e.target.value)}
                    placeholder="e.g., 150.00"
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

            {/* Produce Type and Pricing */}
            {produceTypes.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-900">Expected Produce & Pricing</h3>
                  <p className="text-xs text-gray-500">Select all applicable produce types</p>
                </div>
                
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
                                  disabled={isSaving}
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
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
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

            {/* Housing Location */}
            <div className="space-y-2">
              <Label htmlFor="housingLocation">Housing Location</Label>
              <Input
                id="housingLocation"
                value={formData.housingLocation}
                onChange={(e) => updateFormData("housingLocation", e.target.value)}
                placeholder="e.g., Barn A, Pen 3"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background resize-y"
                placeholder="Any additional notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t">
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
