"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  LayoutGrid,
  Leaf,
  PawPrint,
  Fish,
  MoreHorizontal,
  MapPin,
  Grid3X3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Plot {
  id: string;
  name: string;
  description: string | null;
  size: number;
  sizeUnit: string;
  usageType: string;
  location: string | null;
  status: string;
  farm: {
    id: string;
    name: string;
  };
  pens: Array<{ id: string; area: number | null; animalType: string | null }>;
  cropAllocations: Array<{ id: string; allocatedArea: number; areaUnit: string; cropType: string }>;
  _count: {
    pens: number;
    cropAllocations: number;
  };
}

const USAGE_ICONS: Record<string, any> = {
  CROP: Leaf,
  LIVESTOCK: PawPrint,
  AQUACULTURE: Fish,
  MIXED: LayoutGrid,
  FALLOW: LayoutGrid,
  STORAGE: LayoutGrid,
  RESIDENTIAL: LayoutGrid,
};

const USAGE_COLORS: Record<string, string> = {
  CROP: "bg-green-100 text-green-800",
  LIVESTOCK: "bg-amber-100 text-amber-800",
  AQUACULTURE: "bg-blue-100 text-blue-800",
  MIXED: "bg-purple-100 text-purple-800",
  FALLOW: "bg-gray-100 text-gray-800",
  STORAGE: "bg-orange-100 text-orange-800",
  RESIDENTIAL: "bg-pink-100 text-pink-800",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  IN_USE: "bg-blue-100 text-blue-800",
  FALLOW: "bg-yellow-100 text-yellow-800",
  UNDER_PREPARATION: "bg-orange-100 text-orange-800",
};

export default function PlotsPage() {
  const [plots, setPlots] = useState<Plot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchPlots();
  }, []);

  async function fetchPlots() {
    try {
      const res = await fetch("/api/plots");
      if (res.ok) {
        const data = await res.json();
        setPlots(data);
      }
    } catch (error) {
      console.error("Failed to fetch plots");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPlots = plots.filter((p) => {
    if (filter === "all") return true;
    return p.usageType === filter;
  });

  const totalArea = plots.reduce((sum, p) => {
    // Convert to hectares for consistent display
    let areaInHectares = p.size;
    if (p.sizeUnit === "ACRES") areaInHectares = p.size * 0.404686;
    if (p.sizeUnit === "SQUARE_METERS") areaInHectares = p.size / 10000;
    return sum + areaInHectares;
  }, 0);

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
          <h1 className="text-3xl font-bold text-gray-900">Plot Management</h1>
          <p className="text-gray-600">Plan and manage your farm space allocation</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/plots/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Plot
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Plots</p>
                <p className="text-2xl font-bold">{plots.length}</p>
              </div>
              <LayoutGrid className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Area</p>
                <p className="text-2xl font-bold">{totalArea.toFixed(2)} ha</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Crop Plots</p>
                <p className="text-2xl font-bold">
                  {plots.filter((p) => p.usageType === "CROP").length}
                </p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Livestock Plots</p>
                <p className="text-2xl font-bold">
                  {plots.filter((p) => p.usageType === "LIVESTOCK").length}
                </p>
              </div>
              <PawPrint className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "CROP", "LIVESTOCK", "AQUACULTURE", "MIXED", "FALLOW"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f === "all" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Plots Grid */}
      {filteredPlots.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <LayoutGrid className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {plots.length === 0
                ? "No plots created yet. Start planning your farm space!"
                : "No plots match the selected filter."}
            </p>
            {plots.length === 0 && (
              <Button asChild>
                <Link href="/dashboard/plots/new">Create Your First Plot</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlots.map((plot) => {
            const Icon = USAGE_ICONS[plot.usageType] || Grid3X3;
            return (
              <Link key={plot.id} href={`/dashboard/plots/${plot.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${USAGE_COLORS[plot.usageType]}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{plot.name}</CardTitle>
                          <p className="text-sm text-gray-500">{plot.farm.name}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[plot.status]}`}>
                        {plot.status.replace("_", " ")}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      // Calculate space usage
                      const plotSizeInSqM = plot.sizeUnit === "HECTARES" 
                        ? plot.size * 10000 
                        : plot.sizeUnit === "ACRES" 
                          ? plot.size * 4046.86 
                          : plot.size;
                      
                      let usedSpace = 0;
                      let usedFor = "";
                      
                      if (plot.usageType === "LIVESTOCK" || plot.usageType === "MIXED") {
                        usedSpace = (plot.pens || []).reduce((sum, pen) => sum + (pen.area || 0), 0);
                        usedFor = `${plot._count.pens} pen${plot._count.pens !== 1 ? "s" : ""}`;
                      }
                      if (plot.usageType === "CROP" || plot.usageType === "MIXED") {
                        const cropArea = (plot.cropAllocations || []).reduce((sum, alloc) => {
                          const areaInSqM = alloc.areaUnit === "HECTARES" 
                            ? alloc.allocatedArea * 10000 
                            : alloc.areaUnit === "ACRES" 
                              ? alloc.allocatedArea * 4046.86 
                              : alloc.allocatedArea;
                          return sum + areaInSqM;
                        }, 0);
                        usedSpace += cropArea;
                        if (plot._count.cropAllocations > 0) {
                          usedFor += usedFor ? ` + ${plot._count.cropAllocations} crop${plot._count.cropAllocations !== 1 ? "s" : ""}` : `${plot._count.cropAllocations} crop${plot._count.cropAllocations !== 1 ? "s" : ""}`;
                        }
                      }
                      
                      const availableSpace = plotSizeInSqM - usedSpace;
                      const usedPercent = plotSizeInSqM > 0 ? (usedSpace / plotSizeInSqM) * 100 : 0;
                      
                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Plot Size</span>
                            <span className="font-medium">
                              {plot.size} {plot.sizeUnit.toLowerCase().replace("_", " ")} ({plotSizeInSqM.toLocaleString()} sq m)
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Used</span>
                            <span className="font-medium text-amber-600">
                              {usedSpace.toLocaleString()} sq m ({usedPercent.toFixed(1)}%)
                              {usedFor && <span className="text-gray-400 ml-1">• {usedFor}</span>}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Available</span>
                            <span className="font-medium text-green-600">
                              {availableSpace.toLocaleString()} sq m ({(100 - usedPercent).toFixed(1)}%)
                            </span>
                          </div>
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-amber-500 h-2 rounded-full transition-all" 
                              style={{ width: `${Math.min(usedPercent, 100)}%` }}
                            />
                          </div>
                          {plot.location && (
                            <div className="flex justify-between text-sm pt-1">
                              <span className="text-gray-500">Location</span>
                              <span className="font-medium">{plot.location}</span>
                            </div>
                          )}
                        </div>
                      );
                    })()}
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
