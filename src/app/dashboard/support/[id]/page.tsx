"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MessageSquare, Send, Clock, User } from "lucide-react";

interface Message {
  id: string;
  message: string;
  createdAt: string;
  sender: {
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
  createdAt: string;
  assignedTo: { name: string | null } | null;
  messages: Message[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_ON_USER: "bg-blue-100 text-blue-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-700",
};

export default function UserTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchTicket();
  }, [id]);

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/support/${id}`);
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
    setError("");

    try {
      const res = await fetch(`/api/support/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
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
        <Link href="/dashboard/support">
          <Button className="mt-4">Back to Support</Button>
        </Link>
      </div>
    );
  }

  const isClosed = ticket.status === "CLOSED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/support">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{ticket.category}</span>
              <span>•</span>
              <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <span className={`px-3 py-1 rounded text-sm font-medium ${STATUS_COLORS[ticket.status]}`}>
          {ticket.status.replace("_", " ")}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Status Info */}
      {ticket.status === "WAITING_ON_USER" && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Our support team is waiting for your response. Please reply below.
        </div>
      )}

      {ticket.status === "RESOLVED" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          This ticket has been resolved. If you still need help, you can reply to reopen it.
        </div>
      )}

      {/* Original Request */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Your Original Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{ticket.description}</p>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-10 w-10 mx-auto mb-2 text-gray-300" />
              <p>No responses yet</p>
              <p className="text-sm">Our support team will respond soon.</p>
            </div>
          ) : (
            ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg ${
                  msg.sender.role === "USER"
                    ? "bg-gray-100 ml-8"
                    : "bg-blue-50 mr-8"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {msg.sender.role === "USER" ? "You" : msg.sender.name || "Support Team"}
                    </span>
                    {msg.sender.role !== "USER" && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                        Support
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
          {!isClosed && (
            <form onSubmit={handleSendMessage} className="pt-4 border-t">
              <div className="space-y-3">
                <textarea
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={isSending || !newMessage.trim()}>
                    {isSending ? (
                      <Spinner size="sm" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {isClosed && (
            <div className="pt-4 border-t text-center text-gray-500">
              This ticket is closed. If you need further assistance, please create a new ticket.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
