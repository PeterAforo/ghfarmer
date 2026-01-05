"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Eye, Clock, User, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  views: number;
  createdAt: string;
  user: { id: string; name: string | null };
  comments: Comment[];
  _count: { comments: number; likes: number };
}

interface Comment {
  id: string;
  content: string;
  isAnswer: boolean;
  createdAt: string;
  user: { id: string; name: string | null };
  replies: Comment[];
  _count: { likes: number };
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchLikeStatus();
  }, [params.id]);

  async function fetchPost() {
    try {
      const res = await fetch(`/api/forum/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data);
        setLikeCount(data._count?.likes || 0);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchLikeStatus() {
    try {
      const res = await fetch(`/api/forum/${params.id}/like`);
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.userLiked);
        setLikeCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching like status:", error);
    }
  }

  async function handleLike() {
    setIsLiking(true);
    try {
      const res = await fetch(`/api/forum/${params.id}/like`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setIsLiked(data.liked);
        setLikeCount((prev) => (data.liked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/forum/${params.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        setComment("");
        fetchPost();
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/community">Back to Community</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/community">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Back to Community</span>
      </div>

      {/* Post */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-2 mb-3">
            <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
              {post.category.replace("_", " ")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-700 whitespace-pre-wrap mb-6">{post.content}</p>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.user.name || "Anonymous"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.views}
              </span>
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-1 transition-colors ${
                  isLiked ? "text-red-500" : "hover:text-red-500"
                }`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                {likeCount}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {post._count.comments}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comment Form */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium mb-4">Add a Comment</h3>
          <form onSubmit={handleSubmitComment} className="space-y-4">
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Share your thoughts or answer..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button type="submit" disabled={isSubmitting || !comment.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Comment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">
          {post.comments.length} {post.comments.length === 1 ? "Answer" : "Answers"}
        </h3>
        {post.comments.map((comment) => (
          <Card key={comment.id} className={comment.isAnswer ? "border-green-500" : ""}>
            <CardContent className="pt-4">
              {comment.isAnswer && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded mb-2 inline-block">
                  Best Answer
                </span>
              )}
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {comment.user.name || "Anonymous"}
                  </span>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {comment._count.likes}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
