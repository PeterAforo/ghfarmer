"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "@/lib/push-notifications";

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    // Check if push notifications are supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      
      // Check current permission status
      if ("Notification" in window) {
        setPermission(Notification.permission);
      }
      
      // Check if already subscribed
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  async function handleToggle() {
    setIsLoading(true);
    
    try {
      if (isSubscribed) {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setIsSubscribed(false);
        }
      } else {
        // Request permission first
        const perm = await requestNotificationPermission();
        setPermission(perm);
        
        if (perm === "granted") {
          // Subscribe
          const subscription = await subscribeToPushNotifications();
          if (subscription) {
            setIsSubscribed(true);
          }
        }
      }
    } catch (error) {
      console.error("Error toggling push notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <BellOff className="h-4 w-4" />
        <span>Push notifications not supported</span>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <BellOff className="h-4 w-4" />
        <span>Notifications blocked. Please enable in browser settings.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isSubscribed ? (
          <Bell className="h-5 w-5 text-green-500" />
        ) : (
          <BellOff className="h-5 w-5 text-gray-400" />
        )}
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-gray-500">
            {isSubscribed
              ? "You'll receive alerts for tasks, weather, and prices"
              : "Enable to receive important farm alerts"}
          </p>
        </div>
      </div>
      <Button
        variant={isSubscribed ? "outline" : "default"}
        size="sm"
        onClick={handleToggle}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isSubscribed ? (
          "Disable"
        ) : (
          "Enable"
        )}
      </Button>
    </div>
  );
}
