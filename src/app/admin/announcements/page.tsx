"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Megaphone, Plus, Trash2, AlertCircle, Info, CheckCircle, Wrench } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  targetRoles: string[];
  targetRegions: string[];
  publishAt: string;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: {
    name: string | null;
    email: string | null;
  };
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  INFO: <Info className="h-5 w-5 text-blue-600" />,
  WARNING: <AlertCircle className="h-5 w-5 text-yellow-600" />,
  SUCCESS: <CheckCircle className="h-5 w-5 text-green-600" />,
  MAINTENANCE: <Wrench className="h-5 w-5 text-orange-600" />,
};

const TYPE_COLORS: Record<string, string> = {
  INFO: "bg-blue-50 border-blue-200",
  WARNING: "bg-yellow-50 border-yellow-200",
  SUCCESS: "bg-green-50 border-green-200",
  MAINTENANCE: "bg-orange-50 border-orange-200",
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    content: "",
    type: "INFO",
    expiresAt: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/admin/announcements?includeExpired=true");
      const data = await res.json();

      if (res.ok) {
        setAnnouncements(data);
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setIsCreating(true);
    setError("");

    try {
      const res = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiresAt: form.expiresAt || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowForm(false);
        setForm({ title: "", content: "", type: "INFO", expiresAt: "" });
        fetchAnnouncements();
      } else {
        setError(data.error || "Failed to create announcement");
      }
    } catch (err) {
      setError("Failed to create announcement");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Send announcements to all users</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Announcement</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Announcement title"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="WARNING">Warning</SelectItem>
                      <SelectItem value="SUCCESS">Success</SelectItem>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <textarea
                  id="content"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Announcement content..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? <Spinner size="sm" /> : "Publish Announcement"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            All Announcements ({announcements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Megaphone className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No announcements yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((announcement) => {
                const isExpired = announcement.expiresAt && new Date(announcement.expiresAt) < new Date();
                
                return (
                  <div
                    key={announcement.id}
                    className={`p-4 border rounded-lg ${TYPE_COLORS[announcement.type]} ${isExpired ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {TYPE_ICONS[announcement.type]}
                        <div>
                          <h3 className="font-medium">{announcement.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>By {announcement.createdBy.name || announcement.createdBy.email}</span>
                            <span>Published {new Date(announcement.publishAt).toLocaleDateString()}</span>
                            {announcement.expiresAt && (
                              <span className={isExpired ? "text-red-600" : ""}>
                                {isExpired ? "Expired" : `Expires ${new Date(announcement.expiresAt).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          announcement.isActive && !isExpired
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {isExpired ? "Expired" : announcement.isActive ? "Active" : "Inactive"}
                        </span>
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
