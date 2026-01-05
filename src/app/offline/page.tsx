"use client";

import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-6">
          <WifiOff className="h-8 w-8 text-gray-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Some features may
          not be available until you're back online.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <p className="text-sm text-gray-500">
            Your data will be synced automatically when you reconnect.
          </p>
        </div>
      </div>
    </div>
  );
}
