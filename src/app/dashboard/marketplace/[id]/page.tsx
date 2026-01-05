"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Calendar,
  Eye,
  MessageSquare,
  Pencil,
  Trash2,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  productType: string;
  quantity: number;
  quantityUnit: string;
  pricePerUnit: number;
  currency: string;
  location: string | null;
  region: string | null;
  status: string;
  views: number;
  createdAt: string;
  user: { id: string; name: string | null; phone: string | null };
}

const CATEGORY_COLORS: Record<string, string> = {
  CROPS: "bg-green-100 text-green-700",
  LIVESTOCK: "bg-orange-100 text-orange-700",
  PRODUCE: "bg-amber-100 text-amber-700",
  EQUIPMENT: "bg-gray-100 text-gray-700",
  SERVICES: "bg-blue-100 text-blue-700",
};

export default function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySent, setInquirySent] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  async function fetchListing() {
    try {
      const res = await fetch(`/api/marketplace/${id}`);
      if (res.ok) {
        const data = await res.json();
        setListing(data);
      } else {
        setError("Listing not found");
      }
    } catch (err) {
      setError("Failed to load listing");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/marketplace/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/marketplace");
      }
    } catch (err) {
      alert("Failed to delete listing");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSendInquiry(e: React.FormEvent) {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;

    setIsSendingInquiry(true);
    try {
      const res = await fetch(`/api/marketplace/${id}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inquiryMessage }),
      });

      if (res.ok) {
        setInquirySent(true);
        setInquiryMessage("");
      }
    } catch (err) {
      alert("Failed to send inquiry");
    } finally {
      setIsSendingInquiry(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">{error || "Listing not found"}</p>
        <Button asChild>
          <Link href="/dashboard/marketplace">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/marketplace">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 text-xs rounded ${CATEGORY_COLORS[listing.category]}`}>
                {listing.category}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(listing.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/marketplace/${id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <span className="text-3xl font-bold text-primary">
                {listing.currency} {listing.pricePerUnit.toLocaleString()}
              </span>
              <span className="text-gray-500">/{listing.quantityUnit}</span>
            </div>
            <span className="text-lg text-gray-600">
              {listing.quantity} {listing.quantityUnit} available
            </span>
          </div>

          {listing.description && (
            <p className="text-gray-700 mb-4 whitespace-pre-wrap">{listing.description}</p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.views} views
            </span>
            {listing.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location}
                {listing.region && `, ${listing.region}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seller Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{listing.user.name || "Anonymous"}</p>
              {listing.user.phone && (
                <p className="text-sm text-gray-500">{listing.user.phone}</p>
              )}
            </div>
            {listing.user.phone && (
              <Button asChild>
                <a href={`tel:${listing.user.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call Seller
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inquiry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inquirySent ? (
            <div className="text-center py-4">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-green-700">Inquiry Sent!</p>
              <p className="text-sm text-gray-500 mt-1">
                The seller will be notified and may contact you soon.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setInquirySent(false)}
              >
                Send Another Inquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <textarea
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  placeholder="Hi, I'm interested in this product. Is it still available? What's your best price for..."
                  className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background"
                  required
                />
              </div>
              <Button type="submit" disabled={isSendingInquiry || !inquiryMessage.trim()}>
                {isSendingInquiry ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Inquiry
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
