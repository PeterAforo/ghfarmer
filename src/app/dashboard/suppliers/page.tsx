"use client";

import { useState, useEffect } from "react";
import {
  Store,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  CheckCircle,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface Supplier {
  id: string;
  name: string;
  type: string;
  description: string | null;
  address: string | null;
  region: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  products: string[] | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
}

const SUPPLIER_TYPES = [
  { value: "", label: "All Types" },
  { value: "SEEDS", label: "Seeds" },
  { value: "FERTILIZERS", label: "Fertilizers" },
  { value: "AGROCHEMICALS", label: "Agrochemicals" },
  { value: "VETERINARY", label: "Veterinary" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "FEED", label: "Animal Feed" },
  { value: "GENERAL", label: "General" },
];

const TYPE_COLORS: Record<string, string> = {
  SEEDS: "bg-green-100 text-green-700",
  FERTILIZERS: "bg-amber-100 text-amber-700",
  AGROCHEMICALS: "bg-red-100 text-red-700",
  VETERINARY: "bg-blue-100 text-blue-700",
  EQUIPMENT: "bg-gray-100 text-gray-700",
  FEED: "bg-orange-100 text-orange-700",
  GENERAL: "bg-purple-100 text-purple-700",
};

// Sample suppliers data
const SAMPLE_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Agri-Input Ghana Ltd",
    type: "SEEDS",
    description: "Leading supplier of certified seeds for maize, rice, and vegetables. Authorized dealer for major seed companies.",
    address: "123 Liberation Road, Accra",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    phone: "+233 20 123 4567",
    email: "info@agriinput.gh",
    website: "https://agriinput.gh",
    products: ["Maize Seeds", "Rice Seeds", "Vegetable Seeds", "Cowpea Seeds"],
    rating: 4.5,
    reviewCount: 128,
    isVerified: true,
  },
  {
    id: "2",
    name: "Yara Ghana",
    type: "FERTILIZERS",
    description: "Global crop nutrition company providing fertilizers and agronomic solutions for sustainable farming.",
    address: "Industrial Area, Tema",
    region: "Greater Accra",
    district: "Tema Metropolitan",
    phone: "+233 30 221 5678",
    email: "ghana@yara.com",
    website: "https://yara.com.gh",
    products: ["NPK Fertilizers", "Urea", "Calcium Ammonium Nitrate", "Specialty Fertilizers"],
    rating: 4.8,
    reviewCount: 256,
    isVerified: true,
  },
  {
    id: "3",
    name: "Kumasi Vet Supplies",
    type: "VETERINARY",
    description: "Complete veterinary supplies including vaccines, medications, and animal health products.",
    address: "Adum, Kumasi",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    phone: "+233 32 202 3456",
    email: "sales@kumasivetsupplies.com",
    website: null,
    products: ["Vaccines", "Dewormers", "Antibiotics", "Vitamins", "Disinfectants"],
    rating: 4.2,
    reviewCount: 89,
    isVerified: true,
  },
  {
    id: "4",
    name: "Dizengoff Ghana",
    type: "EQUIPMENT",
    description: "Agricultural machinery and equipment supplier. Tractors, irrigation systems, and farm tools.",
    address: "Ring Road Central, Accra",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    phone: "+233 30 222 1234",
    email: "info@dizengoff.com.gh",
    website: "https://dizengoff.com.gh",
    products: ["Tractors", "Irrigation Systems", "Sprayers", "Harvesters", "Farm Tools"],
    rating: 4.6,
    reviewCount: 167,
    isVerified: true,
  },
  {
    id: "5",
    name: "Chemico Ghana",
    type: "AGROCHEMICALS",
    description: "Pesticides, herbicides, and crop protection products from leading manufacturers.",
    address: "North Industrial Area, Accra",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    phone: "+233 30 222 5678",
    email: "sales@chemico.gh",
    website: null,
    products: ["Herbicides", "Insecticides", "Fungicides", "Growth Regulators"],
    rating: 4.3,
    reviewCount: 145,
    isVerified: true,
  },
  {
    id: "6",
    name: "Agricare Feed Mills",
    type: "FEED",
    description: "Quality animal feed for poultry, pigs, and fish. Custom formulations available.",
    address: "Nsawam Road, Accra",
    region: "Greater Accra",
    district: "Ga West",
    phone: "+233 24 456 7890",
    email: "orders@agricarefeed.com",
    website: null,
    products: ["Layer Feed", "Broiler Feed", "Pig Feed", "Fish Feed", "Concentrates"],
    rating: 4.4,
    reviewCount: 203,
    isVerified: false,
  },
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(SAMPLE_SUPPLIERS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      !searchTerm ||
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || supplier.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Input Suppliers</h1>
        <p className="text-gray-600">Find verified suppliers for seeds, fertilizers, equipment, and more</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white text-gray-900"
        >
          {SUPPLIER_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : filteredSuppliers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500">Try adjusting your search or filter</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredSuppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs rounded ${TYPE_COLORS[supplier.type]}`}>
                        {supplier.type}
                      </span>
                      {supplier.isVerified && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  </div>
                  {supplier.rating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{supplier.rating}</span>
                      <span className="text-gray-400">({supplier.reviewCount})</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{supplier.description}</p>
                )}

                {supplier.products && supplier.products.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.slice(0, 4).map((product, i) => (
                      <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                        {product}
                      </span>
                    ))}
                    {supplier.products.length > 4 && (
                      <span className="px-2 py-0.5 text-gray-400 text-xs">
                        +{supplier.products.length - 4} more
                      </span>
                    )}
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="h-4 w-4 flex-shrink-0" />
                      <a href={`tel:${supplier.phone}`} className="hover:text-primary">
                        {supplier.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  {supplier.phone && (
                    <Button size="sm" asChild className="flex-1">
                      <a href={`tel:${supplier.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                    </Button>
                  )}
                  {supplier.website && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  {supplier.email && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={`mailto:${supplier.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
