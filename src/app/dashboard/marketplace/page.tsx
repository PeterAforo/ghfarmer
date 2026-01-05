"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Search,
  MapPin,
  Phone,
  MessageSquare,
  Eye,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  productType: string;
  quantity: number;
  quantityUnit: string;
  pricePerUnit: number;
  currency: string;
  location: string | null;
  region: string | null;
  status: string;
  views: number;
  createdAt: string;
  user: { id: string; name: string | null; phone: string | null };
  _count: { inquiries: number };
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "CROPS", label: "Crops" },
  { value: "LIVESTOCK", label: "Livestock" },
  { value: "PRODUCE", label: "Produce" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "SERVICES", label: "Services" },
];

const CATEGORY_COLORS: Record<string, string> = {
  CROPS: "bg-green-100 text-green-700",
  LIVESTOCK: "bg-orange-100 text-orange-700",
  PRODUCE: "bg-amber-100 text-amber-700",
  EQUIPMENT: "bg-gray-100 text-gray-700",
  SERVICES: "bg-blue-100 text-blue-700",
};

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchListings();
  }, [category]);

  async function fetchListings() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/marketplace?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchListings();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
          <p className="text-gray-600">Buy and sell agricultural products</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/marketplace/new">
            <Plus className="h-4 w-4 mr-2" />
            Post Listing
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white text-gray-900"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
            <p className="text-gray-500 mb-4">Be the first to post a listing!</p>
            <Button asChild>
              <Link href="/dashboard/marketplace/new">
                <Plus className="h-4 w-4 mr-2" />
                Post Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className={`px-2 py-0.5 text-xs rounded ${CATEGORY_COLORS[listing.category]}`}>
                    {listing.category}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1">{listing.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-2xl font-bold text-primary">
                      {listing.currency} {listing.pricePerUnit.toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-sm">/{listing.quantityUnit}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {listing.quantity} {listing.quantityUnit} available
                  </span>
                </div>

                {listing.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  {listing.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {listing.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {listing._count.inquiries}
                  </span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  {listing.user.phone && (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={`tel:${listing.user.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call Seller
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/dashboard/marketplace/${listing.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
