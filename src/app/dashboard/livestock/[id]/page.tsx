"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PawPrint,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Heart,
  Loader2,
  Scale,
  Egg,
  Check,
  X,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface LivestockEntry {
  id: string;
  name: string | null;
  tagNumber: string | null;
  quantity: number;
  birthDate: string | null;
  acquiredDate: string | null;
  source: string | null;
  status: string;
  location: string | null;
  notes: string | null;
  livestock: {
    id: string;
    name: string;
    category: string;
  };
  breed: {
    id: string;
    name: string;
  } | null;
  farm: {
    id: string;
    name: string;
  };
  healthRecords: Array<{
    id: string;
    date: string;
    type: string;
    status: string;
    diagnosis: string | null;
    treatment: string | null;
    cost: number | null;
  }>;
  _count: {
    healthRecords: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  SOLD: "bg-blue-100 text-blue-700",
  DECEASED: "bg-gray-100 text-gray-700",
  TRANSFERRED: "bg-purple-100 text-purple-700",
};

export default function LivestockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [entry, setEntry] = useState<LivestockEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [selectedRecords, setSelectedRecords] = useState<Set<string>>(new Set());
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchEntry();
  }, [id]);

  async function fetchEntry() {
    try {
      const response = await fetch(`/api/livestock/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Livestock entry not found");
        } else {
          throw new Error("Failed to fetch");
        }
        return;
      }
      const data = await response.json();
      setEntry(data);
    } catch (err) {
      setError("Failed to load livestock entry");
    } finally {
      setIsLoading(false);
      setSelectedRecords(new Set());
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this livestock entry?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/livestock/${id}`, { method: "DELETE" });
      if (response.ok) {
        router.push("/dashboard/livestock");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete livestock entry");
    } finally {
      setIsDeleting(false);
    }
  }

  // Toggle single record selection
  function toggleRecordSelection(recordId: string) {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  }

  // Select/deselect all records
  function toggleSelectAll() {
    if (!entry) return;
    if (selectedRecords.size === entry.healthRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(entry.healthRecords.map(r => r.id)));
    }
  }

  // Update single record status
  async function updateRecordStatus(recordId: string, newStatus: string) {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/livestock/health-records/${recordId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        fetchEntry();
      }
    } catch (error) {
      console.error("Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // Bulk update status
  async function bulkUpdateStatus(newStatus: string) {
    if (selectedRecords.size === 0) return;
    
    setIsUpdatingStatus(true);
    try {
      const promises = Array.from(selectedRecords).map(recordId =>
        fetch(`/api/livestock/health-records/${recordId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
      );
      
      await Promise.all(promises);
      fetchEntry();
    } catch (error) {
      console.error("Failed to bulk update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error || "Livestock entry not found"}</p>
        <Button asChild>
          <Link href="/dashboard/livestock">Back to Livestock</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/livestock">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {entry.name || entry.livestock.name}
              </h1>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  STATUS_COLORS[entry.status] || "bg-gray-100"
                }`}
              >
                {entry.status}
              </span>
            </div>
            <p className="text-gray-500">
              {entry.livestock.name}
              {entry.breed && ` - ${entry.breed.name}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/livestock/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Quantity</p>
                <p className="font-medium text-xl">
                  {entry.quantity} {entry.quantity === 1 ? "head" : "heads"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Farm</p>
                <p className="font-medium">{entry.farm.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Acquired</p>
                <p className="font-medium">
                  {entry.acquiredDate
                    ? new Date(entry.acquiredDate).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Livestock Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium">{entry.livestock.category}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Source</dt>
              <dd className="font-medium">{entry.source?.replace("_", " ") || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Housing Location</dt>
              <dd className="font-medium">{entry.location || "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Health Records</dt>
              <dd className="font-medium">{entry._count.healthRecords} records</dd>
            </div>
            {entry.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="font-medium whitespace-pre-wrap">{entry.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {}}>
          <Link href={`/dashboard/livestock/${id}/health`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Health Records</p>
                  <p className="text-sm text-gray-500">{entry._count.healthRecords} records - vaccinations, treatments</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link href={`/dashboard/livestock/${id}/production`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <Egg className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Production Records</p>
                  <p className="text-sm text-gray-500">Track eggs, milk, weight gain</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Health Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Health Records ({entry._count.healthRecords})
          </CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/livestock/${id}/health`}>
              <Plus className="h-4 w-4 mr-1" />
              Add Record
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {entry.healthRecords.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No health records yet
            </p>
          ) : (
            <div className="space-y-3">
              {/* Bulk Actions Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {selectedRecords.size === entry.healthRecords.length ? (
                      <CheckSquare className="h-5 w-5 text-primary" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                    {selectedRecords.size === entry.healthRecords.length ? "Deselect All" : "Select All"}
                  </button>
                  {selectedRecords.size > 0 && (
                    <span className="text-sm text-gray-500">
                      ({selectedRecords.size} selected)
                    </span>
                  )}
                </div>
                {selectedRecords.size > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 mr-2">Bulk Actions:</span>
                    <button
                      onClick={() => bulkUpdateStatus("COMPLETED")}
                      disabled={isUpdatingStatus}
                      className="text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3 inline mr-1" />
                      Complete
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus("SKIPPED")}
                      disabled={isUpdatingStatus}
                      className="text-xs px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                    >
                      <X className="h-3 w-3 inline mr-1" />
                      Skip
                    </button>
                    <button
                      onClick={() => bulkUpdateStatus("PENDING")}
                      disabled={isUpdatingStatus}
                      className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
                    >
                      Pending
                    </button>
                  </div>
                )}
              </div>

              {/* Records List */}
              {entry.healthRecords.map((record) => {
                const isOverdue = record.status === "PENDING" && new Date(record.date) < new Date();
                const displayStatus = isOverdue ? "OVERDUE" : record.status;
                
                return (
                  <div
                    key={record.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      record.status === "COMPLETED"
                        ? "bg-green-50 border-green-200"
                        : isOverdue || record.status === "OVERDUE"
                        ? "bg-red-50 border-red-200"
                        : record.status === "SKIPPED"
                        ? "bg-gray-50 border-gray-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleRecordSelection(record.id)}
                      className="mt-1 flex-shrink-0"
                    >
                      {selectedRecords.has(record.id) ? (
                        <CheckSquare className="h-5 w-5 text-primary" />
                      ) : (
                        <Square className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>

                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border flex-shrink-0">
                      <Heart className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {record.type.replace("_", " ")}
                          </p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            record.status === "COMPLETED"
                              ? "bg-green-100 text-green-700"
                              : isOverdue || record.status === "OVERDUE"
                              ? "bg-red-100 text-red-700"
                              : record.status === "SKIPPED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {displayStatus}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(record.date).toLocaleDateString()}
                        </span>
                      </div>
                      {record.diagnosis && (
                        <p className="text-sm text-gray-600 mt-1">
                          {record.diagnosis}
                        </p>
                      )}
                      {record.treatment && (
                        <p className="text-sm text-gray-500 mt-1">
                          Treatment: {record.treatment}
                        </p>
                      )}
                      {record.cost && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cost: GHS {record.cost.toLocaleString()}
                        </p>
                      )}
                      
                      {/* Individual Status Actions */}
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                        {record.status !== "COMPLETED" && (
                          <button
                            onClick={() => updateRecordStatus(record.id, "COMPLETED")}
                            disabled={isUpdatingStatus}
                            className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3 inline mr-1" />
                            Complete
                          </button>
                        )}
                        {record.status !== "SKIPPED" && record.status !== "COMPLETED" && (
                          <button
                            onClick={() => updateRecordStatus(record.id, "SKIPPED")}
                            disabled={isUpdatingStatus}
                            className="text-xs px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
                          >
                            Skip
                          </button>
                        )}
                        {(record.status === "COMPLETED" || record.status === "SKIPPED") && (
                          <button
                            onClick={() => updateRecordStatus(record.id, "PENDING")}
                            disabled={isUpdatingStatus}
                            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
