"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MapPin,
  User,
  Leaf,
  PawPrint,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Region {
  id: string;
  name: string;
  districts: { id: string; name: string }[];
}

const FARMER_TYPES = [
  { value: "SMALLHOLDER", label: "Smallholder Farmer", description: "Less than 5 hectares" },
  { value: "COMMERCIAL", label: "Commercial Farmer", description: "5+ hectares, market-focused" },
];

const ENTERPRISES = [
  { value: "crops", label: "Crops", icon: Leaf },
  { value: "livestock", label: "Livestock", icon: PawPrint },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [regions, setRegions] = useState<Region[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    region: "",
    district: "",
    community: "",
    farmerType: "",
    farmSize: "",
    enterprises: [] as string[],
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
    fetchRegions();
  }, [status, router]);

  async function fetchRegions() {
    try {
      const res = await fetch("/api/regions");
      if (res.ok) {
        const data = await res.json();
        setRegions(data);
      }
    } catch (error) {
      console.error("Failed to fetch regions");
    }
  }

  const selectedRegion = regions.find((r) => r.id === formData.region);

  function toggleEnterprise(value: string) {
    setFormData((prev) => ({
      ...prev,
      enterprises: prev.enterprises.includes(value)
        ? prev.enterprises.filter((e) => e !== value)
        : [...prev.enterprises, value],
    }));
  }

  async function handleComplete() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          region: formData.region,
          district: formData.district,
          farmerType: formData.farmerType,
          onboardingCompleted: true,
        }),
      });

      if (res.ok) {
        // Create first farm if farm size provided
        if (formData.farmSize) {
          await fetch("/api/farms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "My Farm",
              size: parseFloat(formData.farmSize),
              sizeUnit: "HECTARES",
              region: selectedRegion?.name,
              district: formData.district,
            }),
          });
        }
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return formData.region && formData.district;
      case 3:
        return formData.farmerType;
      case 4:
        return formData.farmSize && parseFloat(formData.farmSize) > 0;
      case 5:
        return formData.enterprises.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Welcome to Ghana Farmer</CardTitle>
            <span className="text-sm text-gray-500">Step {step} of 5</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded ${
                  s <= step ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {/* Step 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">What's your name?</h2>
                <p className="text-gray-500 text-sm">Let's personalize your experience</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold">Where are you located?</h2>
                <p className="text-gray-500 text-sm">This helps us provide local information</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value, district: "" })}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  >
                    <option value="">Select Region</option>
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District</Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                    disabled={!formData.region}
                  >
                    <option value="">Select District</option>
                    {selectedRegion?.districts.map((district) => (
                      <option key={district.id} value={district.name}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="community">Community (Optional)</Label>
                  <Input
                    id="community"
                    value={formData.community}
                    onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                    placeholder="Enter your community/town"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Farmer Type */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">What type of farmer are you?</h2>
                <p className="text-gray-500 text-sm">This helps us customize features for you</p>
              </div>
              <div className="space-y-3">
                {FARMER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, farmerType: type.value })}
                    className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                      formData.farmerType === type.value
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-gray-500">{type.description}</p>
                      </div>
                      {formData.farmerType === type.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Farm Size */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">What's your total farm size?</h2>
                <p className="text-gray-500 text-sm">Approximate size in hectares</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="farmSize">Farm Size (Hectares)</Label>
                <Input
                  id="farmSize"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.farmSize}
                  onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                  placeholder="e.g., 2.5"
                />
                <p className="text-xs text-gray-500">1 acre ≈ 0.4 hectares</p>
              </div>
            </div>
          )}

          {/* Step 5: Enterprises */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold">What do you farm?</h2>
                <p className="text-gray-500 text-sm">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ENTERPRISES.map((enterprise) => (
                  <button
                    key={enterprise.value}
                    onClick={() => toggleEnterprise(enterprise.value)}
                    className={`p-6 rounded-lg border-2 text-center transition-colors ${
                      formData.enterprises.includes(enterprise.value)
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <enterprise.icon
                      className={`h-8 w-8 mx-auto mb-2 ${
                        formData.enterprises.includes(enterprise.value)
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                    />
                    <p className="font-medium">{enterprise.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            {step < 5 ? (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className="flex-1"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canProceed() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
