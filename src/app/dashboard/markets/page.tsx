"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Store,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Market {
  id: string;
  name: string;
  region: string;
  type: string | null;
  latitude: number | null;
  longitude: number | null;
  prices: Array<{
    id: string;
    productType: string;
    price: number;
    unit: string;
    date: string;
  }>;
}

interface Region {
  id: string;
  name: string;
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  useEffect(() => {
    fetchData();
  }, [regionFilter]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (regionFilter) params.append("region", regionFilter);

      const [marketsRes, regionsRes] = await Promise.all([
        fetch(`/api/markets?${params.toString()}`),
        fetch("/api/regions"),
      ]);

      if (marketsRes.ok) {
        const data = await marketsRes.json();
        setMarkets(data);
      }
      if (regionsRes.ok) {
        const data = await regionsRes.json();
        setRegions(data);
      }
    } catch (err) {
      setError("Failed to load markets");
    } finally {
      setIsLoading(false);
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
    }).format(amount);
  }

  const filteredMarkets = markets.filter(
    (market) =>
      market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      market.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Markets</h1>
          <p className="text-gray-600">
            Browse markets and check current prices
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white text-gray-900 min-w-[180px]"
        >
          <option value="">All Regions</option>
          {regions.map((region) => (
            <option key={region.id} value={region.name}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Markets Grid */}
      {filteredMarkets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No markets found
            </h3>
            <p className="text-gray-600">
              {searchTerm || regionFilter
                ? "Try adjusting your search or filters"
                : "No markets available"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMarkets.map((market) => (
            <Link key={market.id} href={`/dashboard/markets/${market.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{market.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {market.region}
                      </div>
                    </div>
                    {market.type && (
                      <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {market.type}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {market.prices.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 font-medium">
                        Recent Prices:
                      </p>
                      <div className="space-y-1.5">
                        {market.prices.slice(0, 3).map((price) => (
                          <div
                            key={price.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-gray-700">
                              {price.productType}
                            </span>
                            <span className="font-medium text-green-600">
                              {formatCurrency(price.price)}/{price.unit}
                            </span>
                          </div>
                        ))}
                      </div>
                      {market.prices.length > 3 && (
                        <p className="text-xs text-gray-400">
                          +{market.prices.length - 3} more products
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No price data available
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
