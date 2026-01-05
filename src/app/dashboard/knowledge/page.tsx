"use client";

import { useState } from "react";
import {
  BookOpen,
  Search,
  Leaf,
  PawPrint,
  Bug,
  Droplets,
  Sun,
  Sprout,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  {
    id: "crops",
    title: "Crop Farming",
    icon: Leaf,
    color: "text-green-600 bg-green-100",
    articles: [
      {
        title: "Maize Cultivation Guide",
        description: "Complete guide to growing maize in Ghana - planting, care, and harvesting",
        readTime: "8 min",
      },
      {
        title: "Rice Farming Best Practices",
        description: "Lowland and upland rice cultivation techniques for maximum yield",
        readTime: "10 min",
      },
      {
        title: "Cassava Production Manual",
        description: "From planting to processing - everything about cassava farming",
        readTime: "12 min",
      },
      {
        title: "Vegetable Farming in Ghana",
        description: "Growing tomatoes, peppers, onions and other vegetables commercially",
        readTime: "15 min",
      },
    ],
  },
  {
    id: "livestock",
    title: "Livestock Management",
    icon: PawPrint,
    color: "text-orange-600 bg-orange-100",
    articles: [
      {
        title: "Poultry Farming Basics",
        description: "Starting and managing a successful poultry farm in Ghana",
        readTime: "10 min",
      },
      {
        title: "Goat Rearing Guide",
        description: "Breeds, feeding, housing and health management for goats",
        readTime: "8 min",
      },
      {
        title: "Cattle Farming Essentials",
        description: "Dairy and beef cattle management practices",
        readTime: "12 min",
      },
      {
        title: "Pig Farming Manual",
        description: "Commercial pig production from breeding to marketing",
        readTime: "9 min",
      },
    ],
  },
  {
    id: "pests",
    title: "Pest & Disease Control",
    icon: Bug,
    color: "text-red-600 bg-red-100",
    articles: [
      {
        title: "Fall Armyworm Management",
        description: "Identifying and controlling fall armyworm in maize and other crops",
        readTime: "7 min",
      },
      {
        title: "Common Poultry Diseases",
        description: "Prevention and treatment of Newcastle, Gumboro and other diseases",
        readTime: "10 min",
      },
      {
        title: "Tomato Pest Control",
        description: "Managing whiteflies, fruit worms and other tomato pests",
        readTime: "6 min",
      },
      {
        title: "Organic Pest Management",
        description: "Natural methods to control pests without chemicals",
        readTime: "8 min",
      },
    ],
  },
  {
    id: "irrigation",
    title: "Water & Irrigation",
    icon: Droplets,
    color: "text-blue-600 bg-blue-100",
    articles: [
      {
        title: "Drip Irrigation Systems",
        description: "Setting up and maintaining drip irrigation for vegetables",
        readTime: "9 min",
      },
      {
        title: "Rainwater Harvesting",
        description: "Collecting and storing rainwater for dry season farming",
        readTime: "7 min",
      },
      {
        title: "Irrigation Scheduling",
        description: "When and how much to water different crops",
        readTime: "6 min",
      },
    ],
  },
  {
    id: "soil",
    title: "Soil Management",
    icon: Sprout,
    color: "text-amber-600 bg-amber-100",
    articles: [
      {
        title: "Soil Testing Guide",
        description: "Understanding soil tests and what they mean for your farm",
        readTime: "8 min",
      },
      {
        title: "Composting for Farmers",
        description: "Making and using compost to improve soil fertility",
        readTime: "7 min",
      },
      {
        title: "Fertilizer Application",
        description: "Types of fertilizers and proper application methods",
        readTime: "10 min",
      },
    ],
  },
  {
    id: "climate",
    title: "Climate Smart Agriculture",
    icon: Sun,
    color: "text-yellow-600 bg-yellow-100",
    articles: [
      {
        title: "Drought-Resistant Farming",
        description: "Crops and techniques for farming in dry conditions",
        readTime: "9 min",
      },
      {
        title: "Agroforestry Practices",
        description: "Integrating trees with crops for sustainable farming",
        readTime: "11 min",
      },
      {
        title: "Climate Adaptation Strategies",
        description: "Preparing your farm for changing weather patterns",
        readTime: "8 min",
      },
    ],
  },
];

const QUICK_TIPS = [
  "Plant maize at the onset of rains for best results",
  "Vaccinate poultry against Newcastle disease every 3 months",
  "Apply fertilizer in bands beside plants, not directly on them",
  "Harvest cassava between 9-12 months for optimal starch content",
  "Rotate crops to prevent soil nutrient depletion",
  "Keep livestock housing well-ventilated to prevent diseases",
];

export default function KnowledgePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = CATEGORIES.filter((category) => {
    if (selectedCategory && category.id !== selectedCategory) return false;
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      category.title.toLowerCase().includes(searchLower) ||
      category.articles.some(
        (article) =>
          article.title.toLowerCase().includes(searchLower) ||
          article.description.toLowerCase().includes(searchLower)
      )
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600">
          Learn best practices for farming in Ghana
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory || ""}
          onChange={(e) => setSelectedCategory(e.target.value || null)}
          className="px-4 py-2 rounded-lg border bg-white text-gray-900"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.title}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Tips */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {QUICK_TIPS.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <span className="text-primary font-bold">•</span>
                {tip}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </span>
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {category.articles
                  .filter(
                    (article) =>
                      !searchTerm ||
                      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      article.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((article, index) => (
                    <div
                      key={index}
                      className="group p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 group-hover:text-primary">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {article.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {article.readTime} read
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No articles found matching your search</p>
        </div>
      )}

      {/* External Resources */}
      <Card>
        <CardHeader>
          <CardTitle>External Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://mofa.gov.gh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Ministry of Food & Agriculture</p>
                <p className="text-sm text-gray-500">Official MOFA resources</p>
              </div>
            </a>
            <a
              href="https://csir.org.gh"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">CSIR Ghana</p>
                <p className="text-sm text-gray-500">Agricultural research</p>
              </div>
            </a>
            <a
              href="https://www.fao.org/ghana"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">FAO Ghana</p>
                <p className="text-sm text-gray-500">UN food & agriculture</p>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
