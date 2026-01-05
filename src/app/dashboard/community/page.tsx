"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Plus,
  Search,
  Eye,
  Heart,
  MessageCircle,
  Clock,
  Filter,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  isPinned: boolean;
  createdAt: string;
  user: { id: string; name: string | null; image: string | null };
  _count: { comments: number; likes: number };
}

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "CROPS", label: "Crops" },
  { value: "LIVESTOCK", label: "Livestock" },
  { value: "AQUACULTURE", label: "Aquaculture" },
  { value: "PEST_DISEASE", label: "Pest & Disease" },
  { value: "MARKET", label: "Market" },
  { value: "WEATHER", label: "Weather" },
  { value: "EQUIPMENT", label: "Equipment" },
  { value: "FINANCE", label: "Finance" },
  { value: "GENERAL", label: "General" },
];

const CATEGORY_COLORS: Record<string, string> = {
  CROPS: "bg-green-100 text-green-700",
  LIVESTOCK: "bg-orange-100 text-orange-700",
  AQUACULTURE: "bg-blue-100 text-blue-700",
  PEST_DISEASE: "bg-red-100 text-red-700",
  MARKET: "bg-purple-100 text-purple-700",
  WEATHER: "bg-cyan-100 text-cyan-700",
  EQUIPMENT: "bg-gray-100 text-gray-700",
  FINANCE: "bg-yellow-100 text-yellow-700",
  GENERAL: "bg-slate-100 text-slate-700",
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [category]);

  async function fetchPosts() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      if (searchTerm) params.set("search", searchTerm);

      const res = await fetch(`/api/forum?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPosts();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
          <p className="text-gray-600">Ask questions and share knowledge with other farmers</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/community/new">
            <Plus className="h-4 w-4 mr-2" />
            Ask Question
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border bg-white text-gray-900"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-500 mb-4">Be the first to start a discussion!</p>
            <Button asChild>
              <Link href="/dashboard/community/new">
                <Plus className="h-4 w-4 mr-2" />
                Ask a Question
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.id} href={`/dashboard/community/${post.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="py-4">
                  <div className="flex gap-4">
                    <div className="hidden sm:flex flex-col items-center gap-1 text-center min-w-[60px]">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Heart className="h-4 w-4" />
                        <span className="text-sm">{post._count.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        <span className="text-sm">{post._count.comments}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-1">
                        {post.isPinned && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                            Pinned
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            CATEGORY_COLORS[post.category] || "bg-gray-100"
                          }`}
                        >
                          {post.category.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {post.user.name || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.views} views
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
