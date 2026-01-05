"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Knowledge base articles data
const ARTICLES: Record<string, {
  title: string;
  category: string;
  author: string;
  readTime: string;
  content: string[];
  tips: string[];
  resources: { title: string; url: string }[];
}> = {
  "maize-farming-guide": {
    title: "Complete Guide to Maize Farming in Ghana",
    category: "Crop Farming",
    author: "MOFA Extension",
    readTime: "8 min read",
    content: [
      "Maize is one of the most important cereal crops in Ghana, serving as a staple food for millions. This guide covers everything you need to know about successful maize farming.",
      "## Land Preparation\nProper land preparation is crucial for maize cultivation. Clear the land of weeds and debris, then plough to a depth of 15-20cm. Create ridges or mounds depending on your region's rainfall patterns. In high rainfall areas, ridges help with drainage.",
      "## Seed Selection\nChoose certified seeds from reputable sources. Popular varieties in Ghana include Obatanpa, Mamaba, and Abontem. Consider your local climate and market preferences when selecting varieties.",
      "## Planting\nPlant at the onset of the rainy season (March-April for major season, August-September for minor season). Space plants 75-80cm between rows and 40cm within rows. Plant 2-3 seeds per hole at 5cm depth.",
      "## Fertilizer Application\nApply NPK 15-15-15 at planting (2 bags per acre). Top-dress with Sulphate of Ammonia or Urea 3-4 weeks after planting. Split application improves nutrient uptake.",
      "## Weed Control\nFirst weeding should be done 2-3 weeks after planting. Second weeding at 5-6 weeks. You can use pre-emergence herbicides like Atrazine for effective weed control.",
      "## Pest and Disease Management\nCommon pests include stem borers, armyworms, and weevils. Use integrated pest management combining cultural practices, biological control, and judicious use of pesticides.",
      "## Harvesting\nMaize is ready for harvest 90-120 days after planting depending on variety. Harvest when husks turn brown and kernels are hard. Dry to 12-13% moisture content for storage.",
    ],
    tips: [
      "Test your soil before planting to determine exact fertilizer needs",
      "Plant early to avoid late-season drought stress",
      "Practice crop rotation to maintain soil health",
      "Store harvested maize in airtight containers to prevent weevil damage",
    ],
    resources: [
      { title: "MOFA Maize Production Guide", url: "https://mofa.gov.gh" },
      { title: "CSIR Crop Research Institute", url: "https://csir-cri.org.gh" },
    ],
  },
  "poultry-management": {
    title: "Poultry Management Best Practices",
    category: "Livestock Management",
    author: "Veterinary Services",
    readTime: "10 min read",
    content: [
      "Poultry farming is a profitable venture in Ghana when managed properly. This guide covers essential practices for both layers and broilers.",
      "## Housing Requirements\nProvide adequate space: 2-3 sq ft per bird for broilers, 4 sq ft for layers. Ensure proper ventilation while protecting from rain and predators. Orient houses east-west to minimize direct sunlight.",
      "## Brooding\nMaintain brooding temperature at 32-35°C for the first week, reducing by 3°C weekly until 21°C. Use infrared lamps or charcoal pots. Provide 24-hour lighting for the first 3 days.",
      "## Feeding\nUse quality commercial feeds appropriate for each growth stage. Starter feed (0-4 weeks), grower feed (4-8 weeks), finisher/layer feed (8+ weeks). Ensure clean water is always available.",
      "## Health Management\nFollow a strict vaccination schedule. Common vaccines include Newcastle Disease, Gumboro, and Fowl Pox. Maintain biosecurity by limiting farm visitors and disinfecting equipment.",
      "## Record Keeping\nTrack daily feed consumption, water intake, mortality, and egg production. Good records help identify problems early and improve profitability.",
    ],
    tips: [
      "Buy day-old chicks from certified hatcheries only",
      "Vaccinate on schedule - prevention is cheaper than treatment",
      "Clean and disinfect waterers and feeders daily",
      "Cull unproductive birds to reduce feed costs",
    ],
    resources: [
      { title: "Ghana Poultry Network", url: "https://ghanapoultry.org" },
      { title: "Veterinary Services Directorate", url: "https://mofa.gov.gh/vsd" },
    ],
  },
  "fish-farming-basics": {
    title: "Getting Started with Fish Farming",
    category: "Aquaculture",
    author: "Fisheries Commission",
    readTime: "7 min read",
    content: [
      "Fish farming (aquaculture) is growing rapidly in Ghana. Tilapia and catfish are the most commonly farmed species due to their adaptability and market demand.",
      "## Pond Construction\nChoose a site with good water supply and clay soil. Pond size can range from 200-1000 sq meters for beginners. Ensure proper inlet and outlet structures for water management.",
      "## Water Quality\nMaintain optimal water parameters: pH 6.5-8.5, temperature 25-30°C, dissolved oxygen above 5mg/L. Test water regularly and change 10-20% weekly.",
      "## Stocking\nStock fingerlings at 3-5 fish per square meter. Purchase from certified hatcheries. Acclimatize fingerlings to pond temperature before release.",
      "## Feeding\nFeed 2-3 times daily at 3-5% of body weight. Use quality floating pellets. Reduce feeding during cold weather or when water quality is poor.",
      "## Harvesting\nTilapia reaches market size (250-400g) in 6-8 months. Catfish takes 4-6 months. Partial harvesting helps manage pond density.",
    ],
    tips: [
      "Start small and expand as you gain experience",
      "Join a fish farmers association for support and market access",
      "Keep detailed records of inputs and outputs",
      "Consider integrated farming with crops or livestock",
    ],
    resources: [
      { title: "Fisheries Commission Ghana", url: "https://fishcom.gov.gh" },
      { title: "WorldFish Center", url: "https://worldfishcenter.org" },
    ],
  },
  "soil-management": {
    title: "Soil Health and Fertility Management",
    category: "Soil Management",
    author: "Soil Research Institute",
    readTime: "6 min read",
    content: [
      "Healthy soil is the foundation of productive farming. Understanding your soil and managing it properly ensures sustainable yields.",
      "## Soil Testing\nTest your soil every 2-3 years. Tests reveal pH, nutrient levels, and organic matter content. Contact your local agricultural office for testing services.",
      "## Organic Matter\nIncrease soil organic matter through composting, mulching, and cover cropping. Organic matter improves water retention, nutrient availability, and soil structure.",
      "## pH Management\nMost crops prefer pH 6.0-7.0. Apply agricultural lime to raise pH in acidic soils. Sulfur or organic matter can lower pH in alkaline soils.",
      "## Nutrient Management\nApply fertilizers based on soil test results and crop requirements. Combine organic and inorganic sources for best results. Avoid over-application which wastes money and harms the environment.",
      "## Erosion Control\nUse contour farming on slopes. Maintain vegetative cover. Build terraces or bunds where necessary. Avoid burning crop residues.",
    ],
    tips: [
      "Never leave soil bare - use cover crops or mulch",
      "Rotate crops to break pest cycles and balance nutrients",
      "Incorporate crop residues instead of burning",
      "Use legumes in rotation to fix nitrogen naturally",
    ],
    resources: [
      { title: "CSIR Soil Research Institute", url: "https://csir-sri.org.gh" },
      { title: "Ghana Soil Information", url: "https://soilghana.org" },
    ],
  },
  "pest-disease-control": {
    title: "Integrated Pest and Disease Management",
    category: "Pest & Disease Control",
    author: "Plant Protection Division",
    readTime: "9 min read",
    content: [
      "Integrated Pest Management (IPM) combines multiple strategies to control pests while minimizing environmental impact and costs.",
      "## Prevention\nUse resistant varieties, practice crop rotation, maintain field hygiene, and time planting to avoid peak pest periods. Prevention is always better than cure.",
      "## Monitoring\nRegularly scout fields for pests and diseases. Learn to identify common problems. Keep records of pest occurrences to predict future outbreaks.",
      "## Cultural Control\nAdjust planting dates, spacing, and irrigation to create unfavorable conditions for pests. Remove and destroy infected plant material promptly.",
      "## Biological Control\nEncourage natural enemies like ladybugs, parasitic wasps, and predatory mites. Avoid broad-spectrum pesticides that kill beneficial insects.",
      "## Chemical Control\nUse pesticides as a last resort. Choose selective products that target specific pests. Follow label instructions carefully. Rotate chemical classes to prevent resistance.",
      "## Common Pests in Ghana\nFall Armyworm: Use pheromone traps, apply Bt-based products early. Stem Borers: Plant early, remove crop residues. Aphids: Encourage natural enemies, use neem-based products.",
    ],
    tips: [
      "Scout fields at least twice weekly during critical growth stages",
      "Identify pests correctly before applying any treatment",
      "Wear protective equipment when handling pesticides",
      "Keep pesticides in original containers, locked away from children",
    ],
    resources: [
      { title: "Plant Protection & Regulatory Services", url: "https://pprsd.gov.gh" },
      { title: "FAO Pest Management", url: "https://fao.org/pest-management" },
    ],
  },
};

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Article Not Found</h2>
        <p className="text-gray-500 mb-4">The article you're looking for doesn't exist.</p>
        <Button asChild>
          <Link href="/dashboard/knowledge">Back to Knowledge Base</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/knowledge">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <span className="text-sm text-gray-500">Back to Knowledge Base</span>
      </div>

      {/* Article Header */}
      <div>
        <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-sm rounded-full mb-3">
          {article.category}
        </span>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {article.readTime}
          </span>
        </div>
      </div>

      {/* Article Content */}
      <Card>
        <CardContent className="pt-6 prose prose-green max-w-none">
          {article.content.map((section, index) => (
            <div key={index} className="mb-6">
              {section.split("\n").map((paragraph, pIndex) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={pIndex} className="text-xl font-bold text-gray-900 mt-6 mb-3">
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }
                return (
                  <p key={pIndex} className="text-gray-700 leading-relaxed mb-3">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <h3 className="font-bold text-green-800 mb-4">💡 Quick Tips</h3>
          <ul className="space-y-2">
            {article.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-green-700">
                <span className="text-green-500 mt-1">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Resources Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-bold text-gray-900 mb-4">📚 Additional Resources</h3>
          <div className="space-y-2">
            {article.resources.map((resource, index) => (
              <a
                key={index}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-gray-700">{resource.title}</span>
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/knowledge">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Articles
          </Link>
        </Button>
      </div>
    </div>
  );
}
