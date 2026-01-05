"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Clock,
  Droplets,
  Bug,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface CropEntry {
  id: string;
  plotName: string | null;
  landArea: number | null;
  landAreaUnit: string | null;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  status: string;
  notes: string | null;
  crop: {
    id: string;
    name: string;
    category: string;
    growingPeriodDays: number | null;
  };
  variety: {
    id: string;
    name: string;
  } | null;
  farm: {
    id: string;
    name: string;
  };
  activities: Array<{
    id: string;
    type: string;
    date: string;
    notes: string | null;
    cost: number | null;
  }>;
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

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  PLANTING: <Leaf className="h-4 w-4" />,
  WATERING: <Droplets className="h-4 w-4" />,
  FERTILIZING: <Leaf className="h-4 w-4" />,
  PEST_CONTROL: <Bug className="h-4 w-4" />,
  HARVESTING: <Leaf className="h-4 w-4" />,
};

export default function CropDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cropEntry, setCropEntry] = useState<CropEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCropEntry();
  }, [id]);

  async function fetchCropEntry() {
    try {
      const response = await fetch(`/api/crops/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Crop entry not found");
        } else {
          throw new Error("Failed to fetch crop entry");
        }
        return;
      }
      const data = await response.json();
      setCropEntry(data);
    } catch (err) {
      setError("Failed to load crop entry");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this crop entry?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/crops/${id}`, { method: "DELETE" });
      if (response.ok) {
        router.push("/dashboard/crops");
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      alert("Failed to delete crop entry");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !cropEntry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error || "Crop entry not found"}</p>
        <Button asChild>
          <Link href="/dashboard/crops">Back to Crops</Link>
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
            <Link href="/dashboard/crops">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {cropEntry.crop.name}
              </h1>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  STATUS_COLORS[cropEntry.status] || "bg-gray-100"
                }`}
              >
                {cropEntry.status}
              </span>
            </div>
            {cropEntry.variety && (
              <p className="text-gray-500">Variety: {cropEntry.variety.name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {cropEntry.status !== "COMPLETED" && (
            <Button size="sm" asChild>
              <Link href={`/dashboard/crops/${id}/yield`}>
                Record Harvest
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/crops/${id}/edit`}>
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
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Farm</p>
                <p className="font-medium">{cropEntry.farm.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Leaf className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Plot / Area</p>
                <p className="font-medium">
                  {cropEntry.plotName || "Not specified"}
                  {cropEntry.landArea && (
                    <span className="text-gray-500 ml-1">
                      ({cropEntry.landArea} {cropEntry.landAreaUnit})
                    </span>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Planting Date</p>
                <p className="font-medium">
                  {cropEntry.plantingDate
                    ? new Date(cropEntry.plantingDate).toLocaleDateString()
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
          <CardTitle>Crop Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Category</dt>
              <dd className="font-medium">{cropEntry.crop.category}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Growing Period</dt>
              <dd className="font-medium">
                {cropEntry.crop.growingPeriodDays
                  ? `${cropEntry.crop.growingPeriodDays} days`
                  : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Expected Harvest</dt>
              <dd className="font-medium">
                {cropEntry.expectedHarvestDate
                  ? new Date(cropEntry.expectedHarvestDate).toLocaleDateString()
                  : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Actual Harvest</dt>
              <dd className="font-medium">
                {cropEntry.actualHarvestDate
                  ? new Date(cropEntry.actualHarvestDate).toLocaleDateString()
                  : "Not harvested yet"}
              </dd>
            </div>
            {cropEntry.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="font-medium whitespace-pre-wrap">{cropEntry.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Activities */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activities ({cropEntry._count.activities})
          </CardTitle>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/dashboard/crops/${id}/activities`}>
              <Plus className="h-4 w-4 mr-1" />
              Log Activity
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {cropEntry.activities.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No activities logged yet
            </p>
          ) : (
            <div className="space-y-3">
              {cropEntry.activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border">
                    {ACTIVITY_ICONS[activity.type] || (
                      <Leaf className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">
                        {activity.type.replace("_", " ")}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleDateString()}
                      </span>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.notes}
                      </p>
                    )}
                    {activity.cost && (
                      <p className="text-xs text-gray-500 mt-1">
                        Cost: GHS {activity.cost.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
