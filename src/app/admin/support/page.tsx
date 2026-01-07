"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    subscription: string;
  };
  assignedTo: {
    id: string;
    name: string | null;
  } | null;
  _count: {
    messages: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_ON_USER: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-gray-600",
  MEDIUM: "text-blue-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600 font-bold",
};

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, priorityFilter]);

  async function fetchTickets() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter && priorityFilter !== "all" && { priority: priorityFilter }),
      });

      const res = await fetch(`/api/admin/support?${params}`);
      const data = await res.json();

      if (res.ok) {
        setTickets(data.tickets);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-600">Manage user support requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <Card className="bg-red-50">
          <CardContent className="py-4 text-center">
            <AlertCircle className="h-6 w-6 mx-auto text-red-600 mb-2" />
            <p className="text-2xl font-bold text-red-700">{stats.OPEN || 0}</p>
            <p className="text-xs text-red-600">Open</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="py-4 text-center">
            <Clock className="h-6 w-6 mx-auto text-yellow-600 mb-2" />
            <p className="text-2xl font-bold text-yellow-700">{stats.IN_PROGRESS || 0}</p>
            <p className="text-xs text-yellow-600">In Progress</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50">
          <CardContent className="py-4 text-center">
            <MessageSquare className="h-6 w-6 mx-auto text-blue-600 mb-2" />
            <p className="text-2xl font-bold text-blue-700">{stats.WAITING_ON_USER || 0}</p>
            <p className="text-xs text-blue-600">Waiting on User</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="py-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
            <p className="text-2xl font-bold text-green-700">{stats.RESOLVED || 0}</p>
            <p className="text-xs text-green-600">Resolved</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50">
          <CardContent className="py-4 text-center">
            <CheckCircle className="h-6 w-6 mx-auto text-gray-600 mb-2" />
            <p className="text-2xl font-bold text-gray-700">{stats.CLOSED || 0}</p>
            <p className="text-xs text-gray-600">Closed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="WAITING_ON_USER">Waiting on User</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setPage(1); }}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tickets found
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Subject</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Priority</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Messages</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((ticket) => (
                      <tr key={ticket.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900 truncate max-w-xs">
                            {ticket.subject}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-900">{ticket.user.name || "No name"}</p>
                            <p className="text-xs text-gray-500">{ticket.user.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{ticket.category}</td>
                        <td className="py-3 px-4">
                          <span className={PRIORITY_COLORS[ticket.priority]}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[ticket.status]}`}>
                            {ticket.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{ticket._count.messages}</td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link href={`/admin/support/${ticket.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-600">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
