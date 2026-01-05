"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Clock, Phone, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface MarketPrice {
  id: string;
  productType: string;
  productCategory: string | null;
  price: number;
  unit: string;
  date: string;
}

interface Market {
  id: string;
  name: string;
  region: string;
  type: string | null;
  marketDays: string[] | null;
  specialties: string[] | null;
  latitude: number | null;
  longitude: number | null;
  contact: string | null;
  openingHours: string | null;
  prices: MarketPrice[];
  pricesByProduct: Record<string, MarketPrice[]>;
}

export default function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [market, setMarket] = useState<Market | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMarket();
  }, [resolvedParams.id]);

  async function fetchMarket() {
    try {
      const response = await fetch(`/api/markets/${resolvedParams.id}`);
      if (!response.ok) throw new Error("Failed to fetch market");
      const data = await response.json();
      setMarket(data);
    } catch (err) {
      setError("Failed to load market details");
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

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/markets">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Markets
          </Link>
        </Button>
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error || "Market not found"}
        </div>
      </div>
    );
  }

  const productTypes = Object.keys(market.pricesByProduct || {});

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/markets">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{market.name}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            {market.region}
            {market.type && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full ml-2">
                {market.type}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Market Info */}
      <div className="grid gap-4 md:grid-cols-3">
        {market.openingHours && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Opening Hours</p>
                  <p className="font-medium">{market.openingHours}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {market.contact && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{market.contact}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {market.marketDays && market.marketDays.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Store className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Market Days</p>
                  <p className="font-medium">
                    {(market.marketDays as string[]).join(", ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Specialties */}
      {market.specialties && (market.specialties as string[]).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Specialties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(market.specialties as string[]).map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price History by Product */}
      <Card>
        <CardHeader>
          <CardTitle>Current Prices</CardTitle>
        </CardHeader>
        <CardContent>
          {productTypes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No price data available for this market
            </p>
          ) : (
            <div className="space-y-6">
              {productTypes.map((productType) => {
                const prices = market.pricesByProduct[productType];
                const latestPrice = prices[0];

                return (
                  <div key={productType} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{productType}</h4>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(latestPrice.price)}/{latestPrice.unit}
                        </p>
                        <p className="text-xs text-gray-500">
                          Updated {formatDate(latestPrice.date)}
                        </p>
                      </div>
                    </div>

                    {/* Price history */}
                    {prices.length > 1 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">
                          Price History:
                        </p>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                          {prices.slice(1, 6).map((price) => (
                            <div
                              key={price.id}
                              className="flex-shrink-0 text-center px-3 py-2 bg-gray-50 rounded"
                            >
                              <p className="text-sm font-medium">
                                {formatCurrency(price.price)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatDate(price.date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Map placeholder */}
      {market.latitude && market.longitude && (
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p>
                  Coordinates: {market.latitude.toFixed(4)},{" "}
                  {market.longitude.toFixed(4)}
                </p>
                <a
                  href={`https://www.google.com/maps?q=${market.latitude},${market.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
