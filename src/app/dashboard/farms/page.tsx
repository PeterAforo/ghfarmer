"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MapPin, Leaf, PawPrint, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Farm {
  id: string;
  name: string;
  size: number | null;
  sizeUnit: string;
  region: string | null;
  district: string | null;
  address: string | null;
  _count: {
    cropEntries: number;
    livestockEntries: number;
  };
}

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  async function fetchFarms() {
    try {
      const response = await fetch("/api/farms");
      if (!response.ok) throw new Error("Failed to fetch farms");
      const data = await response.json();
      setFarms(data);
    } catch (err) {
      setError("Failed to load farms");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteFarm(id: string) {
    if (!confirm("Are you sure you want to delete this farm?")) return;

    try {
      const response = await fetch(`/api/farms/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete farm");
      setFarms(farms.filter((f) => f.id !== id));
    } catch (err) {
      alert("Failed to delete farm");
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
          <h1 className="text-3xl font-bold text-gray-900">My Farms</h1>
          <p className="text-gray-600">Manage your farm locations</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/farms/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Farm
          </Link>
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {farms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No farms yet
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              Add your first farm to start tracking your crops and livestock
            </p>
            <Button asChild>
              <Link href="/dashboard/farms/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Farm
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {farms.map((farm) => (
            <Card key={farm.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{farm.name}</CardTitle>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setMenuOpen(menuOpen === farm.id ? null : farm.id)
                      }
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    {menuOpen === farm.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setMenuOpen(null)}
                        />
                        <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border z-20">
                          <Link
                            href={`/dashboard/farms/${farm.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              deleteFarm(farm.id);
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
                <Link href={`/dashboard/farms/${farm.id}`} className="block">
                  <div className="space-y-3">
                    {(farm.region || farm.district) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {[farm.district, farm.region]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}

                    {farm.size && (
                      <p className="text-sm text-gray-600">
                        Size: {farm.size}{" "}
                        {farm.sizeUnit.toLowerCase().replace("_", " ")}
                      </p>
                    )}

                    <div className="flex gap-4 pt-2 border-t">
                      <div className="flex items-center gap-1 text-sm">
                        <Leaf className="h-4 w-4 text-green-600" />
                        <span>{farm._count.cropEntries} crops</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <PawPrint className="h-4 w-4 text-amber-600" />
                        <span>{farm._count.livestockEntries} livestock</span>
                      </div>
                    </div>
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
