"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Leaf,
  PawPrint,
  Calendar,
  Wallet,
  TrendingUp,
  Cloud,
  BookOpen,
  Settings,
  Fish,
  Lightbulb,
  LayoutGrid,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Store,
  Building2,
  Banknote,
  Bell,
  Users,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Sprout,
  DollarSign,
  Globe,
  Cog,
  Receipt,
  ShoppingCart,
  Egg,
  Package,
  Utensils,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

interface NavCategory {
  title: string;
  icon: LucideIcon;
  items: NavItem[];
  defaultOpen?: boolean;
}

// Grouped navigation categories
const navCategories: NavCategory[] = [
  {
    title: "Overview",
    icon: LayoutDashboard,
    defaultOpen: true,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Farm Management",
    icon: Sprout,
    defaultOpen: true,
    items: [
      { title: "Farms", href: "/dashboard/farms", icon: MapPin },
      { title: "Plots", href: "/dashboard/plots", icon: LayoutGrid },
      { title: "Crops", href: "/dashboard/crops", icon: Leaf },
      { title: "Livestock", href: "/dashboard/livestock", icon: PawPrint },
      { title: "Production", href: "/dashboard/livestock/production", icon: Egg },
      { title: "Feed", href: "/dashboard/livestock/feed", icon: Utensils },
      { title: "Feed Calculator", href: "/dashboard/livestock/calculator", icon: Calculator },
      { title: "Aquaculture", href: "/dashboard/aquaculture", icon: Fish },
      { title: "Inventory", href: "/dashboard/inventory", icon: Package },
      { title: "Tasks", href: "/dashboard/tasks", icon: Calendar },
    ],
  },
  {
    title: "Sales & Purchases",
    icon: Receipt,
    defaultOpen: false,
    items: [
      { title: "Sales", href: "/dashboard/sales", icon: Receipt },
      { title: "Purchases", href: "/dashboard/purchases", icon: ShoppingCart },
    ],
  },
  {
    title: "Finance & Markets",
    icon: DollarSign,
    defaultOpen: false,
    items: [
      { title: "Finances", href: "/dashboard/finances", icon: Wallet },
      { title: "Markets", href: "/dashboard/markets", icon: TrendingUp },
      { title: "Marketplace", href: "/dashboard/marketplace", icon: ShoppingBag },
      { title: "Financial Services", href: "/dashboard/financial-services", icon: Banknote },
    ],
  },
  {
    title: "Intelligence",
    icon: Lightbulb,
    defaultOpen: false,
    items: [
      { title: "Weather", href: "/dashboard/weather", icon: Cloud },
      { title: "Recommendations", href: "/dashboard/recommendations", icon: Lightbulb },
      { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Resources",
    icon: Globe,
    defaultOpen: false,
    items: [
      { title: "Knowledge", href: "/dashboard/knowledge", icon: BookOpen },
      { title: "Community", href: "/dashboard/community", icon: MessageSquare },
      { title: "Suppliers", href: "/dashboard/suppliers", icon: Store },
      { title: "Programs", href: "/dashboard/programs", icon: Building2 },
    ],
  },
  {
    title: "Account",
    icon: Cog,
    defaultOpen: false,
    items: [
      { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
      { title: "Team", href: "/dashboard/team", icon: Users },
      { title: "Support", href: "/dashboard/support", icon: HelpCircle },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function NavCategorySection({ category, pathname }: { category: NavCategory; pathname: string }) {
  // Check if any item in this category is active
  const hasActiveItem = category.items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const [isOpen, setIsOpen] = useState(category.defaultOpen || hasActiveItem);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          hasActiveItem
            ? "text-primary"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
      >
        <div className="flex items-center gap-2">
          <category.icon className="h-4 w-4" />
          <span>{category.title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
      
      {isOpen && (
        <ul className="mt-1 ml-2 space-y-0.5">
          {category.items.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-white border-r p-4 overflow-y-auto">
      <div className="space-y-1">
        {navCategories.map((category) => (
          <NavCategorySection
            key={category.title}
            category={category}
            pathname={pathname}
          />
        ))}
      </div>
    </nav>
  );
}
