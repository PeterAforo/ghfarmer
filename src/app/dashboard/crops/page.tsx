"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Leaf, Calendar, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface CropEntry {
  id: string;
  plotName: string | null;
  landArea: number | null;
  landAreaUnit: string;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  status: string;
  crop: {
    name: string;
    category: string;
  };
  farm: {
    id: string;
    name: string;
  };
  _count: {
    activities: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-gray-100 text-gray-700",
  PLANTED: "bg-blue-100 text-blue-700",
  GROWING: "bg-green-100 text-green-700",
  HARVESTING: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-purple-100 text-purple-700",
  FAILED: "bg-red-100 text-red-700",
};

export default function CropsPage() {
  const [crops, setCrops] = useState<CropEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchCrops();
  }, []);

  async function fetchCrops() {
    try {
      const response = await fetch("/api/crops");
      if (!response.ok) throw new Error("Failed to fetch crops");
      const data = await response.json();
      setCrops(data);
    } catch (err) {
      setError("Failed to load crops");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCrop(id: string) {
    if (!confirm("Are you sure you want to delete this crop entry?")) return;

    try {
      const response = await fetch(`/api/crops/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete crop");
      setCrops(crops.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete crop entry");
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">My Crops</h1>
          <p className="text-gray-600">Track and manage your crop production</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/crops/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Crop
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {crops.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Leaf className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No crops yet
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              Start tracking your crops by adding your first crop entry
            </p>
            <Button asChild>
              <Link href="/dashboard/crops/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Crop
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {crops.map((entry) => (
            <Card key={entry.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-600" />
                      {entry.crop.name}
                    </CardTitle>
                    {entry.plotName && (
                      <p className="text-sm text-gray-500">{entry.plotName}</p>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === entry.id ? null : entry.id)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    {menuOpen === entry.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-20">
                          <Link
                            href={`/dashboard/crops/${entry.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              deleteCrop(entry.id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full text-left text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/crops/${entry.id}`} className="block">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          STATUS_COLORS[entry.status] || STATUS_COLORS.PLANNED
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.crop.category.replace("_", " ")}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Farm: {entry.farm.name}
                    </p>

                    {entry.landArea && (
                      <p className="text-sm text-gray-600">
                        Area: {entry.landArea}{" "}
                        {entry.landAreaUnit.toLowerCase().replace("_", " ")}
                      </p>
                    )}

                    <div className="flex gap-4 pt-2 border-t text-sm text-gray-500">
                      {entry.plantingDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Planted:{" "}
                            {new Date(entry.plantingDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-400">
                      {entry._count.activities} activities logged
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
