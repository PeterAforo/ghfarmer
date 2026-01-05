"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Fish,
  Plus,
  Droplets,
  Thermometer,
  Activity,
  Calendar,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Pond {
  id: string;
  name: string;
  type: string;
  size: number;
  sizeUnit: string;
  species: string | null;
  status: string;
  stockingDate: string | null;
  initialCount: number | null;
  farm: {
    id: string;
    name: string;
  };
  waterQualityRecords: Array<{
    id: string;
    ph: number | null;
    temperature: number | null;
    dissolvedOxygen: number | null;
    recordedAt: string;
  }>;
  _count: {
    waterQualityRecords: number;
    harvests: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  FALLOW: "bg-gray-100 text-gray-700",
  HARVESTING: "bg-blue-100 text-blue-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
};

const TYPE_LABELS: Record<string, string> = {
  EARTHEN: "Earthen Pond",
  CONCRETE: "Concrete Pond",
  PLASTIC_LINED: "Plastic Lined",
  CAGE: "Cage Culture",
  TANK: "Tank System",
};

export default function AquaculturePage() {
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPonds() {
      try {
        const res = await fetch("/api/aquaculture");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setPonds(data);
      } catch (err) {
        setError("Failed to load aquaculture data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchPonds();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const activePonds = ponds.filter((p) => p.status === "ACTIVE").length;
  const totalFish = ponds.reduce((sum, p) => sum + (p.initialCount || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Aquaculture</h1>
          <p className="text-gray-600">Manage your fish ponds and water quality</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/aquaculture/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Pond
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Ponds
            </CardTitle>
            <Fish className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ponds.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Ponds
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activePonds}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Stock
            </CardTitle>
            <Fish className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFish.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Harvests
            </CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {ponds.reduce((sum, p) => sum + p._count.harvests, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ponds List */}
      {ponds.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Fish className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No ponds yet
            </h3>
            <p className="text-gray-500 mb-4">
              Start tracking your aquaculture by adding your first pond
            </p>
            <Button asChild>
              <Link href="/dashboard/aquaculture/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Pond
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ponds.map((pond) => {
            const latestWQ = pond.waterQualityRecords[0];
            return (
              <Card key={pond.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pond.name}</CardTitle>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {pond.farm.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        STATUS_COLORS[pond.status] || "bg-gray-100"
                      }`}
                    >
                      {pond.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium">
                        {TYPE_LABELS[pond.type] || pond.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Size</span>
                      <span className="font-medium">
                        {pond.size} {pond.sizeUnit.toLowerCase().replace("_", " ")}
                      </span>
                    </div>
                    {pond.species && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Species</span>
                        <span className="font-medium">{pond.species}</span>
                      </div>
                    )}
                    {pond.initialCount && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Stock Count</span>
                        <span className="font-medium">
                          {pond.initialCount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Water Quality Indicators */}
                    {latestWQ && (
                      <div className="pt-3 border-t">
                        <p className="text-xs text-gray-500 mb-2">
                          Latest Water Quality
                        </p>
                        <div className="flex gap-4">
                          {latestWQ.ph && (
                            <div className="flex items-center gap-1">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              <span className="text-sm">pH {latestWQ.ph}</span>
                            </div>
                          )}
                          {latestWQ.temperature && (
                            <div className="flex items-center gap-1">
                              <Thermometer className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">
                                {latestWQ.temperature}°C
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="pt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/dashboard/aquaculture/${pond.id}`}>
                          View Details
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/aquaculture/${pond.id}/water-quality`}>
                          <Droplets className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
