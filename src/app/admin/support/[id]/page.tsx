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
  MessageSquare,
  User,
  Send,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Message {
  id: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    role: string;
  };
}

interface Ticket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  resolution: string | null;
  createdAt: string;
  resolvedAt: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    subscription: string;
    region: string | null;
  };
  assignedTo: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  messages: Message[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_ON_USER: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

export default function AdminTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    fetchTicket();
  }, [id]);

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/admin/support/${id}`);
      const data = await res.json();

      if (res.ok) {
        setTicket(data);
      } else {
        setError(data.error || "Failed to load ticket");
      }
    } catch (err) {
      setError("Failed to load ticket");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage, isInternal }),
      });

      if (res.ok) {
        setNewMessage("");
        setIsInternal(false);
        fetchTicket();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send message");
      }
    } catch (err) {
      setError("Failed to send message");
    } finally {
      setIsSending(false);
    }
  }

  async function handleUpdateStatus(status: string) {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/admin/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchTicket();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update status");
      }
    } catch (err) {
      setError("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || "Ticket not found"}</p>
        <Link href="/admin/support">
          <Button className="mt-4">Back to Tickets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-gray-600">
              {ticket.category} • Created {new Date(ticket.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[ticket.status]}`}>
            {ticket.status.replace("_", " ")}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Original Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Original Request</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation ({ticket.messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.messages.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No messages yet</p>
              ) : (
                ticket.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${
                      msg.isInternal
                        ? "bg-yellow-50 border border-yellow-200"
                        : msg.sender.role === "USER"
                        ? "bg-gray-100"
                        : "bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {msg.sender.name || "User"}
                        </span>
                        {msg.sender.role !== "USER" && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            Support
                          </span>
                        )}
                        {msg.isInternal && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                            Internal Note
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                ))
              )}

              {/* Reply Form */}
              <form onSubmit={handleSendMessage} className="pt-4 border-t">
                <div className="space-y-3">
                  <textarea
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={3}
                    placeholder="Type your response..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="rounded"
                      />
                      Internal note (not visible to user)
                    </label>
                    <Button type="submit" disabled={isSending || !newMessage.trim()}>
                      {isSending ? <Spinner size="sm" /> : <><Send className="h-4 w-4 mr-2" /> Send</>}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                User
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{ticket.user.name || "No name"}</p>
              <p className="text-gray-600">{ticket.user.email}</p>
              <p className="text-gray-600">{ticket.user.phone || "No phone"}</p>
              <p className="text-gray-600">{ticket.user.region || "No region"}</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                ticket.user.subscription === "FREE" ? "bg-gray-100" : "bg-blue-100 text-blue-700"
              }`}>
                {ticket.user.subscription}
              </span>
              <div className="pt-2">
                <Link href={`/admin/users/${ticket.user.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View User Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select
                value={ticket.status}
                onValueChange={handleUpdateStatus}
                disabled={isUpdating}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_ON_USER">Waiting on User</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUpdateStatus("RESOLVED")}
                  disabled={isUpdating}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Priority</span>
                <span className={`font-medium ${
                  ticket.priority === "URGENT" ? "text-red-600" :
                  ticket.priority === "HIGH" ? "text-orange-600" : ""
                }`}>
                  {ticket.priority}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span>{ticket.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              {ticket.resolvedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolved</span>
                  <span>{new Date(ticket.resolvedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
