"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Fish,
  MapPin,
  Calendar,
  Pencil,
  Trash2,
  Droplets,
  Loader2,
  Scale,
  Beaker,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface PondEntry {
  id: string;
  name: string;
  size: number | null;
  sizeUnit: string | null;
  fishSpecies: string | null;
  stockingDate: string | null;
  stockingDensity: number | null;
  status: string;
  notes: string | null;
  farm: { id: string; name: string };
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  HARVESTED: "bg-blue-100 text-blue-700",
  FALLOW: "bg-gray-100 text-gray-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
};

export default function PondDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [pond, setPond] = useState<PondEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPond();
  }, [id]);

  async function fetchPond() {
    try {
      const res = await fetch(`/api/aquaculture/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPond(data);
      } else {
        setError("Pond not found");
      }
    } catch (err) {
      setError("Failed to load pond");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this pond?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/aquaculture/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/aquaculture");
      }
    } catch (err) {
      alert("Failed to delete pond");
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

  if (error || !pond) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error || "Pond not found"}</p>
        <Button asChild>
          <Link href="/dashboard/aquaculture">Back to Aquaculture</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/aquaculture">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{pond.name}</h1>
              <span className={`px-2 py-0.5 text-xs rounded-full ${STATUS_COLORS[pond.status] || "bg-gray-100"}`}>
                {pond.status}
              </span>
            </div>
            <p className="text-gray-500">Pond</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/aquaculture/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Size</p>
                <p className="font-medium">
                  {pond.size ? `${pond.size} ${pond.sizeUnit || ""}` : "Not specified"}
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
                <p className="font-medium">{pond.farm.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Fish className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fish Species</p>
                <p className="font-medium">{pond.fishSpecies || "Not specified"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pond Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Size</dt>
              <dd className="font-medium">{pond.size ? `${pond.size} ${pond.sizeUnit || ""}` : "Not specified"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Stocking Date</dt>
              <dd className="font-medium">
                {pond.stockingDate ? new Date(pond.stockingDate).toLocaleDateString() : "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Stocking Density</dt>
              <dd className="font-medium">
                {pond.stockingDensity ? `${pond.stockingDensity} fish/m²` : "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Status</dt>
              <dd className="font-medium">{pond.status}</dd>
            </div>
            {pond.notes && (
              <div className="col-span-2">
                <dt className="text-gray-500">Notes</dt>
                <dd className="font-medium whitespace-pre-wrap">{pond.notes}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <Link href={`/dashboard/aquaculture/${id}/water-quality`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Beaker className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Water Quality</p>
                  <p className="text-sm text-gray-500">Monitor pH, temperature, oxygen levels</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <Link href={`/dashboard/aquaculture/${id}/harvest`}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <Scale className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-lg">Harvest Records</p>
                  <p className="text-sm text-gray-500">Track fish harvests and yields</p>
                </div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
