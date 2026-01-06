"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Package,
  Phone,
  Calendar,
  CreditCard,
  Truck
} from "lucide-react";

interface PurchaseItem {
  id: string;
  productType: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
}

interface Purchase {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  supplierName: string | null;
  supplierPhone: string | null;
  subtotal: number;
  tax: number;
  shippingCost: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  status: string;
  expectedDelivery: string | null;
  receivedAt: string | null;
  notes: string | null;
  items: PurchaseItem[];
  createdAt: string;
}

export default function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  async function fetchPurchase() {
    try {
      const res = await fetch(`/api/purchases/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPurchase(data);
      } else {
        router.push("/dashboard/purchases");
      }
    } catch (error) {
      console.error("Error fetching purchase:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkReceived() {
    if (!purchase) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RECEIVED" }),
      });
      if (res.ok) {
        fetchPurchase();
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function handleMarkPaid() {
    if (!purchase) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/purchases/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "PAID",
          paidAmount: purchase.totalAmount,
        }),
      });
      if (res.ok) {
        fetchPurchase();
      }
    } catch (error) {
      console.error("Error updating purchase:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this purchase?")) return;
    
    try {
      const res = await fetch(`/api/purchases/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/purchases");
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RECEIVED": return "bg-green-100 text-green-800";
      case "SHIPPED": return "bg-blue-100 text-blue-800";
      case "ORDERED": return "bg-yellow-100 text-yellow-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Purchase not found</p>
        <Link href="/dashboard/purchases" className="text-primary hover:underline mt-2 inline-block">
          Back to Purchases
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{purchase.purchaseNumber}</h1>
            <p className="text-gray-600">
              {new Date(purchase.purchaseDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {purchase.status !== "RECEIVED" && (
            <button
              onClick={handleMarkReceived}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Package className="h-4 w-4" />
              Mark Received
            </button>
          )}
          {purchase.paymentStatus !== "PAID" && (
            <button
              onClick={handleMarkPaid}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Paid
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-3">
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getStatusColor(purchase.status)}`}>
          {purchase.status === "RECEIVED" ? <Package className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
          <span className="font-medium">{purchase.status}</span>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${getPaymentColor(purchase.paymentStatus)}`}>
          {purchase.paymentStatus === "PAID" ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
          <span className="font-medium">{purchase.paymentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold">Items</h2>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchase.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.productType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {item.quantity} {item.unit}
                      {item.receivedQuantity > 0 && item.receivedQuantity < item.quantity && (
                        <p className="text-sm text-orange-600">Received: {item.receivedQuantity}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">GH₵ {item.unitPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-medium">GH₵ {item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Totals */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>GH₵ {purchase.subtotal.toLocaleString()}</span>
                </div>
                {purchase.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>+ GH₵ {purchase.tax.toLocaleString()}</span>
                  </div>
                )}
                {purchase.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>+ GH₵ {purchase.shippingCost.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>GH₵ {purchase.totalAmount.toLocaleString()}</span>
                </div>
                {purchase.paidAmount > 0 && purchase.paidAmount < purchase.totalAmount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid</span>
                      <span>GH₵ {purchase.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Balance Due</span>
                      <span>GH₵ {(purchase.totalAmount - purchase.paidAmount).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-gray-600">{purchase.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Supplier</h2>
            {purchase.supplierName ? (
              <div className="space-y-3">
                <p className="font-medium text-lg">{purchase.supplierName}</p>
                {purchase.supplierPhone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{purchase.supplierPhone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">No supplier specified</p>
            )}
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Delivery</h2>
            <div className="space-y-3">
              {purchase.expectedDelivery && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Expected: {new Date(purchase.expectedDelivery).toLocaleDateString()}</span>
                </div>
              )}
              {purchase.receivedAt && (
                <div className="flex items-center gap-2 text-green-600">
                  <Package className="h-4 w-4" />
                  <span>Received: {new Date(purchase.receivedAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Payment</h2>
            <div className="space-y-3">
              {purchase.paymentMethod && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>{purchase.paymentMethod.replace("_", " ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
