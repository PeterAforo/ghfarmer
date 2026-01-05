"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "@/components/image-upload";
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
import { REGIONS, getConstituenciesByRegion, getDistrictsByConstituency } from "@/lib/ghana-locations";

const SIZE_UNITS = [
  { value: "HECTARES", label: "Hectares" },
  { value: "ACRES", label: "Acres" },
  { value: "SQUARE_METERS", label: "Square Meters" },
];

export default function NewFarmPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    size: "",
    sizeUnit: "HECTARES",
    address: "",
    region: "",
    constituency: "",
    district: "",
    latitude: "",
    longitude: "",
    image: "",
  });

  function updateFormData(field: string, value: string) {
    setFormData((prev) => {
      // Reset constituency and district when region changes
      if (field === "region") {
        return { ...prev, [field]: value, constituency: "", district: "" };
      }
      // Reset district when constituency changes
      if (field === "constituency") {
        return { ...prev, [field]: value, district: "" };
      }
      return { ...prev, [field]: value };
    });
  }

  // Get constituencies for selected region
  const availableConstituencies = formData.region ? getConstituenciesByRegion(formData.region) : [];
  
  // Get districts for selected constituency
  const availableDistricts = formData.region && formData.constituency 
    ? getDistrictsByConstituency(formData.region, formData.constituency) 
    : [];

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/farms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          size: formData.size ? parseFloat(formData.size) : undefined,
          sizeUnit: formData.sizeUnit,
          address: formData.address || undefined,
          region: formData.region || undefined,
          constituency: formData.constituency || undefined,
          district: formData.district || undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          image: formData.image || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create farm");
        return;
      }

      router.push("/dashboard/farms");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function getCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString(),
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/farms">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Farm</h1>
          <p className="text-gray-600">Create a new farm location</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Farm Details</CardTitle>
          <CardDescription>
            Enter the details of your farm. You can add crops and livestock
            after creating the farm.
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
              <Label>Farm Photo</Label>
              <ImageUpload
                type="farm"
                currentImage={formData.image || null}
                onUpload={(url) => updateFormData("image", url)}
                onRemove={() => updateFormData("image", "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Farm Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Akwasi's Maize Farm"
                required
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Farm Size</Label>
                <Input
                  id="size"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g., 5"
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
              <Label>Region</Label>
              <Select
                value={formData.region}
                onValueChange={(value) => updateFormData("region", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Constituency</Label>
              <Select
                value={formData.constituency}
                onValueChange={(value) => updateFormData("constituency", value)}
                disabled={!formData.region || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.region ? "Select constituency" : "Select region first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableConstituencies.map((constituency) => (
                    <SelectItem key={constituency} value={constituency}>
                      {constituency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>District</Label>
              <Select
                value={formData.district}
                onValueChange={(value) => updateFormData("district", value)}
                disabled={!formData.constituency || isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.constituency ? "Select district" : "Select constituency first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address / Landmark</Label>
              <Input
                id="address"
                placeholder="e.g., Near Ejisu Market"
                value={formData.address}
                onChange={(e) => updateFormData("address", e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>GPS Coordinates</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                >
                  Get Current Location
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Latitude"
                  value={formData.latitude}
                  onChange={(e) => updateFormData("latitude", e.target.value)}
                  disabled={isLoading}
                />
                <Input
                  placeholder="Longitude"
                  value={formData.longitude}
                  onChange={(e) => updateFormData("longitude", e.target.value)}
                  disabled={isLoading}
                />
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
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Farm
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
