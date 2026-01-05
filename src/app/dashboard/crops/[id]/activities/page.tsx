"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Loader2,
  Shovel,
  Leaf,
  Droplets,
  Bug,
  Scissors,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

const ACTIVITY_TYPES = [
  { value: "LAND_PREPARATION", label: "Land Preparation", icon: Shovel },
  { value: "PLANTING", label: "Planting", icon: Leaf },
  { value: "FERTILIZER_APPLICATION", label: "Fertilizer Application", icon: Droplets },
  { value: "PEST_TREATMENT", label: "Pest Treatment", icon: Bug },
  { value: "DISEASE_TREATMENT", label: "Disease Treatment", icon: Bug },
  { value: "WEEDING", label: "Weeding", icon: Scissors },
  { value: "PRUNING", label: "Pruning", icon: Scissors },
  { value: "IRRIGATION", label: "Irrigation", icon: Droplets },
  { value: "HARVESTING", label: "Harvest", icon: Wheat },
  { value: "POST_HARVEST", label: "Post Harvest", icon: Wheat },
  { value: "OTHER", label: "Other", icon: Leaf },
];

interface Activity {
  id: string;
  type: string;
  date: string;
  cost: number | null;
  notes: string | null;
}

export default function CropActivitiesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "LAND_PREPARATION",
    date: new Date().toISOString().split("T")[0],
    cost: "",
    notes: "",
  });

  useEffect(() => {
    fetchActivities();
  }, [id]);

  async function fetchActivities() {
    try {
      const res = await fetch(`/api/crops/${id}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (error) {
      console.error("Failed to fetch activities");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsAdding(true);

    try {
      const res = await fetch(`/api/crops/${id}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cost: formData.cost ? parseFloat(formData.cost) : undefined,
        }),
      });

      if (res.ok) {
        const newActivity = await res.json();
        setActivities([newActivity, ...activities]);
        setShowForm(false);
        setFormData({
          type: "LAND_PREPARATION",
          date: new Date().toISOString().split("T")[0],
          cost: "",
          notes: "",
        });
      }
    } catch (error) {
      console.error("Failed to add activity");
    } finally {
      setIsAdding(false);
    }
  }

  const getActivityIcon = (type: string) => {
    const activity = ACTIVITY_TYPES.find((a) => a.value === type);
    return activity?.icon || Leaf;
  };

  const getActivityLabel = (type: string) => {
    const activity = ACTIVITY_TYPES.find((a) => a.value === type);
    return activity?.label || type.replace("_", " ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/crops/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Crop Activities</h1>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Activity
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Log New Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Activity Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost">Cost (GHS)</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full min-h-[80px] px-3 py-2 rounded-md border bg-background"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Activity
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No activities logged yet. Click "Log Activity" to add your first entry.
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{getActivityLabel(activity.type)}</p>
                        <span className="text-sm text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                      {activity.notes && (
                        <p className="text-sm text-gray-600 mt-1">{activity.notes}</p>
                      )}
                      {activity.cost && (
                        <p className="text-sm text-gray-500 mt-1">
                          Cost: GHS {activity.cost.toLocaleString()}
                        </p>
                      )}
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
