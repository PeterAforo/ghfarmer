"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Leaf, LogOut, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <div>
              <span className="text-lg font-bold">Ghana Farmer</span>
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded">
                ADMIN
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/notifications"
            className="p-2 hover:bg-gray-800 rounded-lg relative"
          >
            <Bell className="h-5 w-5" />
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                {user.name ? (
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <span className="text-sm font-medium hidden md:block">
                {user.name || user.email}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
