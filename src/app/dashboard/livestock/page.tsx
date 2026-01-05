"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, PawPrint, MoreVertical, Pencil, Trash2, Heart, Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface LivestockEntry {
  id: string;
  name: string | null;
  tagNumber: string | null;
  quantity: number;
  gender: string | null;
  status: string;
  livestock: {
    name: string;
    category: string;
  };
  farm: {
    id: string;
    name: string;
  };
  _count: {
    healthRecords: number;
    productionRecords: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-blue-100 text-blue-700",
  DECEASED: "bg-gray-100 text-gray-700",
  TRANSFERRED: "bg-purple-100 text-purple-700",
};

export default function LivestockPage() {
  const [livestock, setLivestock] = useState<LivestockEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingProduction, setIsGeneratingProduction] = useState(false);
  const [generateMessage, setGenerateMessage] = useState("");

  useEffect(() => {
    fetchLivestock();
  }, []);

  async function fetchLivestock() {
    try {
      const response = await fetch("/api/livestock");
      if (!response.ok) throw new Error("Failed to fetch livestock");
      const data = await response.json();
      setLivestock(data);
    } catch (err) {
      setError("Failed to load livestock");
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteLivestock(id: string) {
    if (!confirm("Are you sure you want to delete this livestock entry?")) return;

    try {
      const response = await fetch(`/api/livestock/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete livestock");
      setLivestock(livestock.filter((l) => l.id !== id));
    } catch (err) {
      alert("Failed to delete livestock entry");
    }
  }

  async function generateHealthRecords() {
    setIsGenerating(true);
    setGenerateMessage("");
    try {
      const response = await fetch("/api/livestock/health-records/generate", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate health records");
      const data = await response.json();
      setGenerateMessage(data.message);
      // Refresh livestock list to show updated health record counts
      fetchLivestock();
    } catch (err) {
      setError("Failed to generate health records");
    } finally {
      setIsGenerating(false);
    }
  }

  async function generateProductionRecords() {
    setIsGeneratingProduction(true);
    setGenerateMessage("");
    try {
      const response = await fetch("/api/livestock/production-records/generate", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to generate production records");
      const data = await response.json();
      setGenerateMessage(data.message);
      // Refresh livestock list to show updated production record counts
      fetchLivestock();
    } catch (err) {
      setError("Failed to generate production records");
    } finally {
      setIsGeneratingProduction(false);
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
          <h1 className="text-3xl font-bold text-gray-900">My Livestock</h1>
          <p className="text-gray-600">Track and manage your animals</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={generateHealthRecords}
            disabled={isGenerating || isGeneratingProduction}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            {isGenerating ? "Generating..." : "Generate Health Records"}
          </Button>
          <Button
            variant="outline"
            onClick={generateProductionRecords}
            disabled={isGenerating || isGeneratingProduction}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isGeneratingProduction ? "animate-spin" : ""}`} />
            {isGeneratingProduction ? "Generating..." : "Generate Production Records"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/livestock/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Livestock
            </Link>
          </Button>
        </div>
      </div>

      {generateMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          ✅ {generateMessage}
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          {error}
        </div>
      )}

      {livestock.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PawPrint className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No livestock yet
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              Start tracking your animals by adding your first livestock entry
            </p>
            <Button asChild>
              <Link href="/dashboard/livestock/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Livestock
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {livestock.map((entry) => (
            <Card key={entry.id} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PawPrint className="h-5 w-5 text-amber-600" />
                      {entry.livestock.name}
                    </CardTitle>
                    {(entry.name || entry.tagNumber) && (
                      <p className="text-sm text-gray-500">
                        {entry.name || entry.tagNumber}
                      </p>
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
                            href={`/dashboard/livestock/${entry.id}/edit`}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100"
                            onClick={() => setMenuOpen(null)}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              setMenuOpen(null);
                              deleteLivestock(entry.id);
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
                <Link href={`/dashboard/livestock/${entry.id}`} className="block">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          STATUS_COLORS[entry.status] || STATUS_COLORS.ACTIVE
                        }`}
                      >
                        {entry.status}
                      </span>
                      <span className="text-sm font-medium">
                        {entry.quantity} {entry.quantity === 1 ? "head" : "heads"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Farm: {entry.farm.name}
                    </p>

                    <p className="text-sm text-gray-600">
                      Category: {entry.livestock.category.replace("_", " ")}
                    </p>

                    {entry.gender && (
                      <p className="text-sm text-gray-600">
                        Gender: {entry.gender}
                      </p>
                    )}

                    <div className="flex gap-4 pt-2 border-t text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{entry._count.healthRecords} health records</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{entry._count.productionRecords} production</span>
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
