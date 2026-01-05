"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

interface PriceSettings {
  [key: string]: number;
}

const PRICE_CATEGORIES = {
  "Poultry - Eggs": [
    { key: "eggs", label: "Eggs (per egg)", defaultValue: 1.5 },
  ],
  "Poultry - Meat (per kg live weight)": [
    { key: "chickenMeat", label: "Chicken", defaultValue: 35 },
    { key: "broilerMeat", label: "Broiler", defaultValue: 35 },
    { key: "turkeyMeat", label: "Turkey", defaultValue: 40 },
    { key: "duckMeat", label: "Duck", defaultValue: 35 },
    { key: "guineaFowlMeat", label: "Guinea Fowl", defaultValue: 45 },
  ],
  "Dairy (per liter)": [
    { key: "cowMilk", label: "Cow Milk", defaultValue: 8 },
    { key: "goatMilk", label: "Goat Milk", defaultValue: 12 },
  ],
  "Livestock - Meat (per kg live weight)": [
    { key: "goatMeat", label: "Goat", defaultValue: 50 },
    { key: "sheepMeat", label: "Sheep", defaultValue: 50 },
    { key: "cattleMeat", label: "Cattle/Beef", defaultValue: 45 },
    { key: "pigMeat", label: "Pig/Pork", defaultValue: 25 },
    { key: "rabbitMeat", label: "Rabbit", defaultValue: 50 },
  ],
  "Aquaculture (per kg)": [
    { key: "tilapia", label: "Tilapia", defaultValue: 40 },
    { key: "catfish", label: "Catfish", defaultValue: 45 },
  ],
  "Crops - Grains (per kg)": [
    { key: "maize", label: "Maize/Corn", defaultValue: 5 },
    { key: "rice", label: "Rice", defaultValue: 8 },
  ],
  "Crops - Tubers (per kg)": [
    { key: "cassava", label: "Cassava", defaultValue: 2 },
    { key: "yam", label: "Yam", defaultValue: 6 },
    { key: "plantain", label: "Plantain", defaultValue: 4 },
  ],
  "Crops - Vegetables (per kg)": [
    { key: "tomato", label: "Tomato", defaultValue: 8 },
    { key: "pepper", label: "Pepper", defaultValue: 15 },
    { key: "onion", label: "Onion", defaultValue: 10 },
    { key: "cabbage", label: "Cabbage", defaultValue: 5 },
    { key: "lettuce", label: "Lettuce", defaultValue: 8 },
  ],
  "Cash Crops (per kg)": [
    { key: "cocoa", label: "Cocoa", defaultValue: 25 },
    { key: "cashew", label: "Cashew", defaultValue: 20 },
    { key: "palm", label: "Palm Fruit", defaultValue: 3 },
    { key: "coconut", label: "Coconut (per nut)", defaultValue: 5 },
  ],
};

export default function PriceSettingsPage() {
  const [prices, setPrices] = useState<PriceSettings>({});
  const [defaultPrices, setDefaultPrices] = useState<PriceSettings>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrices();
  }, []);

  async function fetchPrices() {
    try {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        setPrices(data.unitPrices || {});
        setDefaultPrices(data.defaultPrices || {});
      }
    } catch (err) {
      setError("Failed to load price settings");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unitPrices: prices }),
      });

      if (res.ok) {
        setMessage("Prices saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to save prices");
      }
    } catch (err) {
      setError("Failed to save prices");
    } finally {
      setIsSaving(false);
    }
  }

  function handlePriceChange(key: string, value: string) {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setPrices({ ...prices, [key]: numValue });
    } else if (value === "") {
      const newPrices = { ...prices };
      delete newPrices[key];
      setPrices(newPrices);
    }
  }

  function resetToDefaults() {
    setPrices(defaultPrices);
  }

  function resetCategory(categoryPrices: { key: string; defaultValue: number }[]) {
    const newPrices = { ...prices };
    categoryPrices.forEach(({ key, defaultValue }) => {
      newPrices[key] = defaultValue;
    });
    setPrices(newPrices);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/settings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Unit Prices</h1>
            <p className="text-gray-600">
              Set your local market prices for accurate revenue calculations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Prices"}
          </Button>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
          ❌ {error}
        </div>
      )}

      <div className="bg-blue-50 text-blue-700 p-4 rounded-lg border border-blue-200">
        <p className="text-sm">
          <strong>💡 Tip:</strong> These prices are used to calculate expected revenue for your 
          livestock production, crop yields, and aquaculture harvests. Update them to match 
          your local market prices for accurate projections.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(PRICE_CATEGORIES).map(([category, items]) => (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category}</CardTitle>
                <button
                  onClick={() => resetCategory(items)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Reset
                </button>
              </div>
              <CardDescription>Prices in GHS</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map(({ key, label, defaultValue }) => (
                  <div key={key} className="flex items-center gap-3">
                    <Label htmlFor={key} className="flex-1 text-sm">
                      {label}
                    </Label>
                    <div className="relative w-28">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                        ₵
                      </span>
                      <Input
                        id={key}
                        type="number"
                        step="0.01"
                        min="0"
                        value={prices[key] ?? defaultValue}
                        onChange={(e) => handlePriceChange(key, e.target.value)}
                        className="pl-7 text-right"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save All Prices"}
        </Button>
      </div>
    </div>
  );
}
