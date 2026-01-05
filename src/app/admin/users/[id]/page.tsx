"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  CreditCard,
  Leaf,
  PawPrint,
  Ban,
  Key,
  Trash2,
  History,
} from "lucide-react";

interface UserDetail {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  image: string | null;
  role: string;
  accountType: string;
  subscription: string;
  subscriptionEndsAt: string | null;
  farmerType: string;
  region: string | null;
  district: string | null;
  community: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
  farms: Array<{
    id: string;
    name: string;
    size: number | null;
    sizeUnit: string;
    region: string | null;
  }>;
  _count: {
    farms: number;
    crops: number;
    livestock: number;
    expenses: number;
    incomes: number;
    tasks: number;
    supportTickets: number;
  };
}

interface AuditEntry {
  action: string;
  createdAt: string;
  admin: string;
}

export default function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [recentActivity, setRecentActivity] = useState<AuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [editForm, setEditForm] = useState({
    role: "",
    subscription: "",
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  async function fetchUser() {
    try {
      const res = await fetch(`/api/admin/users/${id}`);
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setRecentActivity(data.recentActivity || []);
        setEditForm({
          role: data.user.role,
          subscription: data.user.subscription,
        });
      } else {
        setError(data.error || "Failed to load user");
      }
    } catch (err) {
      setError("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpdateUser() {
    setIsActioning(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
          role: editForm.role,
          subscription: editForm.subscription,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("User updated successfully");
        fetchUser();
      } else {
        setError(data.error || "Failed to update user");
      }
    } catch (err) {
      setError("Failed to update user");
    } finally {
      setIsActioning(false);
    }
  }

  async function handleAction(action: string, reason?: string) {
    if (action === "resetPassword" && !confirm("Reset this user's password?")) return;
    if (action === "delete" && !confirm("DELETE this user? This cannot be undone!")) return;

    setIsActioning(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: action === "delete" ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });

      const data = await res.json();

      if (res.ok) {
        if (action === "delete") {
          router.push("/admin/users");
        } else if (action === "resetPassword") {
          setSuccess(`Password reset. Temporary password: ${data.tempPassword}`);
        } else {
          setSuccess(data.message);
          fetchUser();
        }
      } else {
        setError(data.error || "Action failed");
      }
    } catch (err) {
      setError("Action failed");
    } finally {
      setIsActioning(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "User not found"}</p>
        <Link href="/admin/users">
          <Button className="mt-4">Back to Users</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{user.name || "No Name"}</h1>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* User Info */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{user.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{user.phone || "No phone"}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{user.region || "No region"}, {user.district || ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <hr />

            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Leaf className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{user._count.farms}</p>
                <p className="text-xs text-gray-600">Farms</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Leaf className="h-6 w-6 mx-auto text-green-600 mb-2" />
                <p className="text-2xl font-bold">{user._count.crops}</p>
                <p className="text-xs text-gray-600">Crops</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <PawPrint className="h-6 w-6 mx-auto text-orange-600 mb-2" />
                <p className="text-2xl font-bold">{user._count.livestock}</p>
                <p className="text-xs text-gray-600">Livestock</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <History className="h-6 w-6 mx-auto text-blue-600 mb-2" />
                <p className="text-2xl font-bold">{user._count.tasks}</p>
                <p className="text-xs text-gray-600">Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleAction("resetPassword")}
              disabled={isActioning}
            >
              <Key className="h-4 w-4 mr-2" />
              Reset Password
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={() => handleAction("delete")}
              disabled={isActioning || user.role === "SUPER_ADMIN"}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Edit Role & Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role & Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v) => setEditForm({ ...editForm, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">User</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subscription</Label>
              <Select
                value={editForm.subscription}
                onValueChange={(v) => setEditForm({ ...editForm, subscription: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FREE">Free</SelectItem>
                  <SelectItem value="BASIC">Basic</SelectItem>
                  <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                  <SelectItem value="BUSINESS">Business</SelectItem>
                  <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdateUser} disabled={isActioning}>
                {isActioning ? <Spinner size="sm" /> : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Farms */}
      {user.farms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Farms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {user.farms.map((farm) => (
                <div key={farm.id} className="p-4 border rounded-lg">
                  <p className="font-medium">{farm.name}</p>
                  <p className="text-sm text-gray-600">
                    {farm.size} {farm.sizeUnit} • {farm.region}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Log */}
      {recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Admin Activity on This User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentActivity.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <span className="font-medium">{entry.action}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
