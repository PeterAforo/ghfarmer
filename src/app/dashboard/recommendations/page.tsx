"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  RefreshCw,
  Loader2,
  Leaf,
  PawPrint,
  Cloud,
  Wallet,
  Calendar,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Recommendation {
  id: string;
  category: string;
  priority: string;
  title: string;
  description: string | null;
  actionSteps: string[];
  reason: string[];
  confidence: number;
  confidenceLabel: string;
  impactType: string | null;
  impactValue: number | null;
  status: string;
  validUntil: string | null;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-100 text-red-800 border-red-200",
  HIGH: "bg-orange-100 text-orange-800 border-orange-200",
  NORMAL: "bg-blue-100 text-blue-800 border-blue-200",
  LOW: "bg-gray-100 text-gray-800 border-gray-200",
};

const CATEGORY_ICONS: Record<string, any> = {
  CROP: Leaf,
  LIVESTOCK: PawPrint,
  WEATHER: Cloud,
  FINANCE: Wallet,
  TASK: Calendar,
  HEALTH: AlertTriangle,
  MARKET: Wallet,
  AQUACULTURE: Leaf,
};

const CONFIDENCE_COLORS: Record<string, string> = {
  HIGH: "text-green-600",
  MEDIUM: "text-yellow-600",
  LOW: "text-red-600",
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  async function fetchRecommendations() {
    try {
      const res = await fetch("/api/dse/recommendations");
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations");
    } finally {
      setIsLoading(false);
    }
  }

  async function refreshRecommendations() {
    setIsRefreshing(true);
    try {
      await fetch("/api/dse/recommendations", { method: "POST", body: JSON.stringify({}) });
      await fetchRecommendations();
    } catch (error) {
      console.error("Failed to refresh");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleFeedback(recId: string, feedbackType: string) {
    try {
      await fetch("/api/dse/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recommendationId: recId, feedbackType }),
      });
      // Update local state
      setRecommendations((prev) =>
        prev.map((r) =>
          r.id === recId
            ? { ...r, status: feedbackType === "COMPLETED" ? "COMPLETED" : "DISMISSED" }
            : r
        )
      );
    } catch (error) {
      console.error("Failed to submit feedback");
    }
  }

  const filteredRecs = recommendations.filter((r) => {
    if (filter === "all") return r.status === "ACTIVE";
    if (filter === "urgent") return r.status === "ACTIVE" && r.priority === "URGENT";
    if (filter === "completed") return r.status === "COMPLETED";
    return r.category === filter && r.status === "ACTIVE";
  });

  const urgentCount = recommendations.filter(
    (r) => r.status === "ACTIVE" && r.priority === "URGENT"
  ).length;

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
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            Smart Recommendations
          </h1>
          <p className="text-gray-600">
            AI-powered suggestions to improve your farm performance
          </p>
        </div>
        <Button onClick={refreshRecommendations} disabled={isRefreshing}>
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter("all")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter((r) => r.status === "ACTIVE").length}
                </p>
              </div>
              <Lightbulb className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer hover:shadow-md ${urgentCount > 0 ? "border-red-200 bg-red-50" : ""}`}
          onClick={() => setFilter("urgent")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Urgent</p>
                <p className="text-2xl font-bold text-red-600">{urgentCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter("CROP")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Crop</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter((r) => r.category === "CROP" && r.status === "ACTIVE").length}
                </p>
              </div>
              <Leaf className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:shadow-md" onClick={() => setFilter("LIVESTOCK")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Livestock</p>
                <p className="text-2xl font-bold">
                  {recommendations.filter((r) => r.category === "LIVESTOCK" && r.status === "ACTIVE").length}
                </p>
              </div>
              <PawPrint className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "urgent", "CROP", "LIVESTOCK", "WEATHER", "FINANCE", "completed"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Recommendations List */}
      {filteredRecs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Lightbulb className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No recommendations in this category</p>
            <p className="text-sm text-gray-400 mt-2">
              Add more farm data to get personalized recommendations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecs.map((rec) => {
            const Icon = CATEGORY_ICONS[rec.category] || Lightbulb;
            const isExpanded = expandedId === rec.id;

            return (
              <Card
                key={rec.id}
                className={`transition-all ${
                  rec.status === "COMPLETED" ? "opacity-60" : ""
                } ${rec.priority === "URGENT" ? "border-red-200" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        rec.priority === "URGENT"
                          ? "bg-red-100"
                          : rec.priority === "HIGH"
                          ? "bg-orange-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`h-6 w-6 ${
                          rec.priority === "URGENT"
                            ? "text-red-600"
                            : rec.priority === "HIGH"
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full border ${
                                PRIORITY_COLORS[rec.priority]
                              }`}
                            >
                              {rec.priority}
                            </span>
                            <span className="text-xs text-gray-500">{rec.category}</span>
                            <span
                              className={`text-xs ${CONFIDENCE_COLORS[rec.confidenceLabel]}`}
                            >
                              {Math.round(rec.confidence * 100)}% confidence
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{rec.title}</h3>
                          {rec.description && (
                            <p className="text-gray-600 text-sm mt-1">{rec.description}</p>
                          )}
                        </div>

                        {rec.status === "COMPLETED" && (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        )}
                      </div>

                      {/* Reasons */}
                      {rec.reason && rec.reason.length > 0 && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-medium text-gray-500 mb-1">Why this recommendation:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {rec.reason.slice(0, isExpanded ? undefined : 2).map((r, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Steps (expanded) */}
                      {isExpanded && rec.actionSteps && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs font-medium text-green-700 mb-2">Action Steps:</p>
                          <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                            {rec.actionSteps.map((step, i) => (
                              <li key={i}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Impact */}
                      {rec.impactType && rec.impactValue && (
                        <p className="text-xs text-gray-500 mt-2">
                          Expected impact: {Math.round(rec.impactValue * 100)}% {rec.impactType.replace("_", " ")}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                        >
                          {isExpanded ? "Show Less" : "Show More"}
                          <ChevronRight
                            className={`h-4 w-4 ml-1 transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        </Button>

                        {rec.status === "ACTIVE" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleFeedback(rec.id, "COMPLETED")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Done
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(rec.id, "HELPFUL")}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFeedback(rec.id, "NOT_HELPFUL")}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Link
                          href={`/api/dse/explain?recommendationId=${rec.id}`}
                          target="_blank"
                          className="ml-auto"
                        >
                          <Button size="sm" variant="ghost">
                            <Info className="h-4 w-4 mr-1" />
                            Why?
                          </Button>
                        </Link>
                      </div>
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
