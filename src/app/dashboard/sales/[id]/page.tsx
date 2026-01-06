"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard
} from "lucide-react";

interface SaleItem {
  id: string;
  productType: string;
  productName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  saleNumber: string;
  saleDate: string;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: string | null;
  notes: string | null;
  items: SaleItem[];
  createdAt: string;
}

export default function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSale();
  }, [id]);

  async function fetchSale() {
    try {
      const res = await fetch(`/api/sales/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSale(data);
      } else {
        router.push("/dashboard/sales");
      }
    } catch (error) {
      console.error("Error fetching sale:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkPaid() {
    if (!sale) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "PAID",
          paidAmount: sale.totalAmount,
        }),
      });
      if (res.ok) {
        fetchSale();
      }
    } catch (error) {
      console.error("Error updating sale:", error);
    } finally {
      setUpdating(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this sale? This will restore inventory quantities.")) return;
    
    try {
      const res = await fetch(`/api/sales/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard/sales");
      }
    } catch (error) {
      console.error("Error deleting sale:", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "bg-green-100 text-green-800";
      case "PARTIAL": return "bg-yellow-100 text-yellow-800";
      case "PENDING": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PAID": return <CheckCircle className="h-5 w-5" />;
      case "PARTIAL": return <Clock className="h-5 w-5" />;
      case "PENDING": return <AlertCircle className="h-5 w-5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Sale not found</p>
        <Link href="/dashboard/sales" className="text-primary hover:underline mt-2 inline-block">
          Back to Sales
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/sales" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{sale.saleNumber}</h1>
            <p className="text-gray-600">
              {new Date(sale.saleDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sale.paymentStatus !== "PAID" && (
            <button
              onClick={handleMarkPaid}
              disabled={updating}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Mark as Paid
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

      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(sale.paymentStatus)}`}>
        {getStatusIcon(sale.paymentStatus)}
        <span className="font-medium">{sale.paymentStatus}</span>
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
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">{item.productType}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">{item.quantity} {item.unit}</td>
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
                  <span>GH₵ {sale.subtotal.toLocaleString()}</span>
                </div>
                {sale.discount > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Discount</span>
                    <span>- GH₵ {sale.discount.toLocaleString()}</span>
                  </div>
                )}
                {sale.tax > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>+ GH₵ {sale.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>GH₵ {sale.totalAmount.toLocaleString()}</span>
                </div>
                {sale.paidAmount > 0 && sale.paidAmount < sale.totalAmount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Paid</span>
                      <span>GH₵ {sale.paidAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-orange-600 font-medium">
                      <span>Balance Due</span>
                      <span>GH₵ {(sale.totalAmount - sale.paidAmount).toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold mb-2">Notes</h2>
              <p className="text-gray-600">{sale.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Customer</h2>
            {sale.customerName ? (
              <div className="space-y-3">
                <p className="font-medium text-lg">{sale.customerName}</p>
                {sale.customerPhone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{sale.customerPhone}</span>
                  </div>
                )}
                {sale.customerEmail && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{sale.customerEmail}</span>
                  </div>
                )}
                {sale.customerAddress && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{sale.customerAddress}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Walk-in customer</p>
            )}
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold mb-4">Payment</h2>
            <div className="space-y-3">
              {sale.paymentMethod && (
                <div className="flex items-center gap-2 text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>{sale.paymentMethod.replace("_", " ")}</span>
                </div>
              )}
              {sale.paidAt && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Paid on {new Date(sale.paidAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
