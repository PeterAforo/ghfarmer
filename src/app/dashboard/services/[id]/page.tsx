"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  Package,
  Wrench,
  MessageSquare,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface ServiceProvider {
  id: string;
  businessName: string;
  businessType: string;
  description: string | null;
  specializations: string[] | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  region: string | null;
  district: string | null;
  licenseNumber: string | null;
  yearsExperience: number | null;
  operatingHours: Record<string, string> | null;
  rating: number | null;
  reviewCount: number;
  isVerified: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  services: ServiceListing[];
  products: ProductListing[];
  reviews: Review[];
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
  description: string | null;
  category: string;
  priceType: string;
  price: number | null;
  priceUnit: string | null;
  serviceLocation: string;
}

interface ProductListing {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  unit: string;
  inStock: boolean;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export default function ServiceProviderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProvider() {
      try {
        const res = await fetch(`/api/service-providers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProvider(data);
        } else {
          setError("Provider not found");
        }
      } catch (err) {
        console.error("Error loading provider:", err);
        setError("Failed to load provider");
      } finally {
        setIsLoading(false);
      }
    }

    loadProvider();
  }, [id]);

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
        <Link href="/dashboard/services">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Services
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || "Provider Not Found"}
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/services">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {provider.businessName}
            </h1>
            {provider.isVerified && (
              <span className="inline-flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            )}
          </div>
          <p className="text-gray-600 capitalize mt-1">
            {provider.businessType.replace(/_/g, " ").toLowerCase()}
          </p>
          {provider.rating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <span className="font-semibold">{provider.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-500">
                ({provider.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {provider.phone && (
            <a href={`tel:${provider.phone}`}>
              <Button variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </a>
          )}
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      </div>

      {/* Contact Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {provider.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-400" />
              <span>{provider.phone}</span>
            </div>
          )}
          {provider.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <a href={`mailto:${provider.email}`} className="text-primary hover:underline">
                {provider.email}
              </a>
            </div>
          )}
          {provider.website && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {provider.website}
              </a>
            </div>
          )}
          {(provider.region || provider.district) && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>
                {[provider.district, provider.region].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {provider.yearsExperience && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{provider.yearsExperience} years experience</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {provider.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{provider.description}</p>
            {provider.specializations && provider.specializations.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Specializations:</p>
                <div className="flex flex-wrap gap-2">
                  {(provider.specializations as string[]).map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Services & Products Tabs */}
      <Tabs defaultValue="services" className="w-full">
        <TabsList>
          <TabsTrigger value="services" className="gap-2">
            <Wrench className="h-4 w-4" />
            Services ({provider._count.services})
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-2">
            <Package className="h-4 w-4" />
            Products ({provider._count.products})
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Star className="h-4 w-4" />
            Reviews ({provider._count.reviews})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          {provider.services.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No services listed yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {provider.services.map((service) => (
                <Card key={service.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{service.title}</CardTitle>
                    <CardDescription className="capitalize">
                      {service.category.replace(/_/g, " ").toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        {service.price ? (
                          <span className="font-semibold text-primary">
                            GHS {service.price.toFixed(2)}
                            {service.priceUnit && ` / ${service.priceUnit}`}
                          </span>
                        ) : (
                          <span className="text-gray-500 capitalize">
                            {service.priceType.replace(/_/g, " ").toLowerCase()}
                          </span>
                        )}
                      </div>
                      <Button size="sm">Book Now</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          {provider.products.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No products listed yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {provider.products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{product.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {product.category.replace(/_/g, " ").toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {product.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-primary">
                          GHS {product.price.toFixed(2)} / {product.unit}
                        </span>
                        <p className={`text-xs ${product.inStock ? "text-green-600" : "text-red-600"}`}>
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </p>
                      </div>
                      <Button size="sm" disabled={!product.inStock}>
                        Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          {provider.reviews.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No reviews yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {provider.reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700">{review.comment}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
