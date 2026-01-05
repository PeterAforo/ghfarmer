"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Star,
  MapPin,
  Phone,
  CheckCircle,
  Stethoscope,
  Tractor,
  Package,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const PROVIDER_TYPES = [
  { value: "all", label: "All Types" },
  { value: "VETERINARIAN", label: "Veterinarians" },
  { value: "EXTENSION_OFFICER", label: "Extension Officers" },
  { value: "INPUT_SUPPLIER", label: "Input Suppliers" },
  { value: "EQUIPMENT_SUPPLIER", label: "Equipment Suppliers" },
  { value: "FEED_SUPPLIER", label: "Feed Suppliers" },
  { value: "FARM_CONSULTANT", label: "Farm Consultants" },
  { value: "TRANSPORT_LOGISTICS", label: "Transport & Logistics" },
];

const REGIONS = [
  "All Regions",
  "Greater Accra",
  "Ashanti",
  "Western",
  "Central",
  "Eastern",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

interface ServiceProvider {
  id: string;
  businessName: string;
  businessType: string;
  description: string | null;
  phone: string | null;
  region: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    services: number;
    products: number;
    reviews: number;
  };
}

function getProviderIcon(type: string) {
  switch (type) {
    case "VETERINARIAN":
      return Stethoscope;
    case "EXTENSION_OFFICER":
      return Users;
    case "INPUT_SUPPLIER":
    case "EQUIPMENT_SUPPLIER":
    case "FEED_SUPPLIER":
      return Package;
    default:
      return Tractor;
  }
}

export default function ServicesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");

  useEffect(() => {
    async function loadProviders() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedType !== "all") params.set("type", selectedType);
        if (selectedRegion !== "All Regions") params.set("region", selectedRegion);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/service-providers?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setProviders(data);
        }
      } catch (err) {
        console.error("Error loading providers:", err);
      } finally {
        setIsLoading(false);
      }
    }

    const debounce = setTimeout(loadProviders, 300);
    return () => clearTimeout(debounce);
  }, [selectedType, selectedRegion, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Services & Suppliers</h1>
        <p className="text-gray-600">
          Connect with veterinarians, extension officers, and agricultural suppliers
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search providers..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Provider Type" />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Region" />
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
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : providers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No providers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => {
            const Icon = getProviderIcon(provider.businessType);
            return (
              <Link key={provider.id} href={`/dashboard/services/${provider.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {provider.businessName}
                            {provider.isVerified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {provider.businessType.replace(/_/g, " ").toLowerCase()}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {provider.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {provider.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {provider.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{provider.rating.toFixed(1)}</span>
                          <span className="text-gray-400">
                            ({provider.reviewCount})
                          </span>
                        </div>
                      )}
                      {provider.region && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.region}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                      <span>{provider._count.services} services</span>
                      <span>{provider._count.products} products</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
