"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Plus,
  Mail,
  Shield,
  Eye,
  Pencil,
  Trash2,
  Check,
  X,
  UserPlus,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface TeamMember {
  id: string;
  member: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
  role: string;
  status: string;
  permissions: Record<string, boolean> | null;
  farmIds: string[];
  invitedAt: string;
  acceptedAt: string | null;
}

interface TeamOwner {
  id: string;
  owner: {
    id: string;
    name: string | null;
    email: string | null;
  };
  role: string;
  permissions: Record<string, boolean> | null;
  farmIds: string[];
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-purple-100 text-purple-700",
  MANAGER: "bg-blue-100 text-blue-700",
  WORKER: "bg-green-100 text-green-700",
  VIEWER: "bg-gray-100 text-gray-700",
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  ADMIN: "Full access to all features",
  MANAGER: "Can edit crops, livestock, and manage tasks",
  WORKER: "Can log activities and update records",
  VIEWER: "Read-only access",
};

export default function TeamManagementPage() {
  const router = useRouter();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [memberOf, setMemberOf] = useState<TeamOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [upgradeRequired, setUpgradeRequired] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "VIEWER",
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  async function fetchTeam() {
    try {
      const res = await fetch("/api/team");
      const data = await res.json();

      if (res.status === 403 && data.upgradeRequired) {
        setUpgradeRequired(true);
        setIsLoading(false);
        return;
      }

      if (res.ok) {
        setTeam(data.team || []);
        setMemberOf(data.memberOf || []);
      } else {
        setError(data.error || "Failed to load team");
      }
    } catch (err) {
      setError("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setIsInviting(true);
    setError("");

    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteForm),
      });

      const data = await res.json();

      if (res.ok) {
        setShowInviteForm(false);
        setInviteForm({ email: "", role: "VIEWER" });
        fetchTeam();
      } else {
        setError(data.error || "Failed to send invitation");
      }
    } catch (err) {
      setError("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchTeam();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to remove member");
      }
    } catch (err) {
      setError("Failed to remove member");
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    try {
      const res = await fetch(`/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchTeam();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update role");
      }
    } catch (err) {
      setError("Failed to update role");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (upgradeRequired) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Upgrade Required</h2>
            <p className="text-gray-600 mb-6">
              Team management is available on Professional and Business plans.
              Upgrade to invite team members like caretakers, accountants, and farm managers.
            </p>
            <Button onClick={() => router.push("/dashboard/settings/subscription")}>
              View Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-gray-600">
            Manage your farm team members and their access permissions
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Invite Form Modal */}
      {showInviteForm && (
        <Card>
          <CardHeader>
            <CardTitle>Invite Team Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="member@example.com"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm({ ...inviteForm, email: e.target.value })
                    }
                    required
                  />
                  <p className="text-xs text-gray-500">
                    The user must already have a Ghana Farmer account
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm({ ...inviteForm, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="WORKER">Worker</SelectItem>
                      <SelectItem value="VIEWER">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {ROLE_DESCRIPTIONS[inviteForm.role]}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isInviting}>
                  {isInviting ? <Spinner size="sm" /> : "Send Invitation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* My Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            My Team ({team.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No team members yet</p>
              <p className="text-sm">Invite caretakers, accountants, or managers to help manage your farm</p>
            </div>
          ) : (
            <div className="space-y-4">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {member.member.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.member.name || "No name"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {member.member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        member.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : member.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {member.status}
                    </span>
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleUpdateRole(member.id, value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                        <SelectItem value="WORKER">Worker</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Teams I'm Part Of */}
      {memberOf.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Teams I&apos;m Part Of
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {memberOf.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{team.owner.name}&apos;s Farm</p>
                    <p className="text-sm text-gray-500">{team.owner.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm ${ROLE_COLORS[team.role]}`}>
                    {team.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Permissions Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Permissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(ROLE_DESCRIPTIONS).map(([role, description]) => (
              <div key={role} className="p-4 border rounded-lg">
                <span className={`px-2 py-1 rounded text-xs font-medium ${ROLE_COLORS[role]}`}>
                  {role}
                </span>
                <p className="text-sm text-gray-600 mt-2">{description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
