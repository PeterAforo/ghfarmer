"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Leaf,
  PawPrint,
  Calculator,
  LayoutGrid,
  MapPin,
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
  soilType: string | null;
  soilPh: number | null;
  irrigationType: string | null;
  status: string;
  createdAt: string;
  farm: {
    id: string;
    name: string;
    size: number | null;
    sizeUnit: string;
  };
  pens: Array<{
    id: string;
    name: string;
    penType: string;
    area: number | null;
    animalType: string | null;
    calculatedCapacity: number | null;
    actualCapacity: number | null;
    currentOccupancy: number;
    status: string;
    livestockEntries: Array<{ id: string; quantity: number }>;
  }>;
  cropAllocations: Array<{
    id: string;
    cropType: string;
    allocatedArea: number;
    areaUnit: string;
    calculatedCapacity: number | null;
    plantSpacing: number | null;
    rowSpacing: number | null;
    status: string;
    cropEntry: { id: string; status: string } | null;
  }>;
}

export default function PlotDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [plot, setPlot] = useState<Plot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPlot();
  }, [id]);

  async function fetchPlot() {
    try {
      const res = await fetch(`/api/plots/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPlot(data);
      } else {
        router.push("/dashboard/plots");
      }
    } catch (error) {
      console.error("Failed to fetch plot");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this plot?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/plots/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/plots");
      }
    } catch (error) {
      console.error("Failed to delete plot");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!plot) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Plot not found</p>
      </div>
    );
  }

  const totalPenCapacity = plot.pens.reduce(
    (sum, pen) => sum + (pen.actualCapacity || pen.calculatedCapacity || 0),
    0
  );
  const totalOccupancy = plot.pens.reduce(
    (sum, pen) => sum + pen.currentOccupancy,
    0
  );
  const totalCropCapacity = plot.cropAllocations.reduce(
    (sum, alloc) => sum + (alloc.calculatedCapacity || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/plots">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{plot.name}</h1>
            <p className="text-gray-600">{plot.farm.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/plots/${id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Plot Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Plot Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">
                  {plot.size} {plot.sizeUnit.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Usage Type</p>
                <p className="font-medium">{plot.usageType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{plot.status.replace("_", " ")}</p>
              </div>
              {plot.location && (
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">{plot.location}</p>
                </div>
              )}
            </div>
            {plot.description && (
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm">{plot.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {(plot.usageType === "CROP" || plot.usageType === "MIXED") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Soil & Irrigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {plot.soilType && (
                  <div>
                    <p className="text-sm text-gray-500">Soil Type</p>
                    <p className="font-medium">{plot.soilType}</p>
                  </div>
                )}
                {plot.soilPh && (
                  <div>
                    <p className="text-sm text-gray-500">Soil pH</p>
                    <p className="font-medium">{plot.soilPh}</p>
                  </div>
                )}
                {plot.irrigationType && (
                  <div>
                    <p className="text-sm text-gray-500">Irrigation</p>
                    <p className="font-medium">{plot.irrigationType}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Livestock Pens Section */}
      {(plot.usageType === "LIVESTOCK" || plot.usageType === "MIXED") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PawPrint className="h-5 w-5" />
              Pens / Housing ({plot.pens.length})
            </CardTitle>
            <Button asChild>
              <Link href={`/dashboard/plots/${id}/pens/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Pen
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {plot.pens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <PawPrint className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No pens created yet</p>
                <p className="text-sm">Add pens to house your livestock</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-amber-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-amber-800">Total Capacity</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {totalPenCapacity} animals
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-amber-800">Current Occupancy</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {totalOccupancy} / {totalPenCapacity}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  {plot.pens.map((pen) => (
                    <div
                      key={pen.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{pen.name}</h4>
                          <p className="text-sm text-gray-500">
                            {pen.penType} • {pen.area} sq m
                          </p>
                          {pen.animalType && (
                            <p className="text-sm text-gray-500">
                              For: {pen.animalType}
                            </p>
                          )}
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Capacity</p>
                            <p className="font-medium">
                              {pen.currentOccupancy} /{" "}
                              {pen.actualCapacity || pen.calculatedCapacity || "N/A"}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                pen.status === "AVAILABLE"
                                  ? "bg-green-100 text-green-800"
                                  : pen.status === "OCCUPIED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {pen.status}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/plots/${id}/pens/${pen.id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Crop Allocations Section */}
      {(plot.usageType === "CROP" || plot.usageType === "MIXED") && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Crop Allocations ({plot.cropAllocations.length})
            </CardTitle>
            <Button asChild>
              <Link href={`/dashboard/plots/${id}/allocations/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add Crop Allocation
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {plot.cropAllocations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Leaf className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No crop allocations yet</p>
                <p className="text-sm">Plan which crops to grow on this plot</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-800">Total Plant Capacity</p>
                      <p className="text-2xl font-bold text-green-900">
                        {totalCropCapacity.toLocaleString()} plants
                      </p>
                    </div>
                    <Calculator className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="space-y-3">
                  {plot.cropAllocations.map((alloc) => (
                    <div
                      key={alloc.id}
                      className="p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{alloc.cropType}</h4>
                          <p className="text-sm text-gray-500">
                            {alloc.allocatedArea} {alloc.areaUnit.toLowerCase()}
                          </p>
                          {alloc.plantSpacing && alloc.rowSpacing && (
                            <p className="text-sm text-gray-500">
                              Spacing: {alloc.rowSpacing}m × {alloc.plantSpacing}m
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Capacity</p>
                          <p className="font-medium">
                            {alloc.calculatedCapacity?.toLocaleString() || "N/A"} plants
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              alloc.status === "PLANNED"
                                ? "bg-yellow-100 text-yellow-800"
                                : alloc.status === "PLANTED"
                                ? "bg-green-100 text-green-800"
                                : alloc.status === "GROWING"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {alloc.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
