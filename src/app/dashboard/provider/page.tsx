"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Wrench,
  Star,
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface ServiceProvider {
  id: string;
  businessName: string;
  businessType: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  region: string | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  _count: {
    services: number;
    products: number;
    reviews: number;
    bookings: number;
  };
}

interface ServiceListing {
  id: string;
  title: string;
  category: string;
  price: number | null;
  priceType: string;
  status: string;
}

interface ProductListing {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
  status: string;
}

export default function ProviderDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [products, setProducts] = useState<ProductListing[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch provider profile
        const profileRes = await fetch("/api/service-providers/me");
        if (profileRes.ok) {
          const data = await profileRes.json();
          setProvider(data.provider);
          setServices(data.services || []);
          setProducts(data.products || []);
        } else if (profileRes.status === 404) {
          setError("No service provider profile found. Please complete your registration.");
        }
      } catch (err) {
        console.error("Error loading provider data:", err);
        setError("Failed to load provider data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Provider Profile Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">
            You need to set up your service provider profile to access this dashboard.
          </p>
          <Link href="/dashboard/provider/setup">
            <Button>Set Up Provider Profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Services",
      value: provider._count.services,
      icon: Wrench,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Products",
      value: provider._count.products,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reviews",
      value: provider._count.reviews,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Bookings",
      value: provider._count.bookings,
      icon: Calendar,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{provider.businessName}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600 capitalize">
              {provider.businessType.replace(/_/g, " ").toLowerCase()}
            </span>
            {provider.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                <CheckCircle className="h-3 w-3" />
                Verified
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/provider/services/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Service
            </Button>
          </Link>
          <Link href="/dashboard/provider/products/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rating Card */}
      {provider.rating && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{provider.rating.toFixed(1)}</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  Based on {provider.reviewCount} reviews
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {provider.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{provider.email}</span>
            </div>
          )}
          {provider.region && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{provider.region}</span>
            </div>
          )}
          <Link href="/dashboard/provider/profile">
            <Button variant="outline" size="sm" className="mt-2">
              Edit Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Services List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Services</CardTitle>
            <CardDescription>Services you offer to farmers</CardDescription>
          </div>
          <Link href="/dashboard/provider/services/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No services listed yet</p>
              <Link href="/dashboard/provider/services/new">
                <Button variant="link" size="sm">
                  Add your first service
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {services.slice(0, 5).map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{service.title}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {service.category.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    {service.price ? (
                      <p className="font-medium">GHS {service.price.toFixed(2)}</p>
                    ) : (
                      <p className="text-sm text-gray-500">{service.priceType}</p>
                    )}
                  </div>
                </div>
              ))}
              {services.length > 5 && (
                <Link href="/dashboard/provider/services">
                  <Button variant="link" size="sm" className="w-full">
                    View all {services.length} services
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Your Products</CardTitle>
            <CardDescription>Products available for sale</CardDescription>
          </div>
          <Link href="/dashboard/provider/products/new">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No products listed yet</p>
              <Link href="/dashboard/provider/products/new">
                <Button variant="link" size="sm">
                  Add your first product
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {product.category.replace(/_/g, " ").toLowerCase()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      GHS {product.price.toFixed(2)}/{product.unit}
                    </p>
                    <p className={`text-xs ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                </div>
              ))}
              {products.length > 5 && (
                <Link href="/dashboard/provider/products">
                  <Button variant="link" size="sm" className="w-full">
                    View all {products.length} products
                  </Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
