"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Leaf, Bell, User, LogOut, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MapPin,
  Leaf as LeafIcon,
  PawPrint,
  Calendar,
  Wallet,
  TrendingUp,
  Cloud,
  BookOpen,
  Fish,
  Lightbulb,
  LayoutGrid,
  MessageSquare,
  ShoppingBag,
  BarChart3,
  Store,
  Building2,
  Banknote,
  Bell as BellIcon,
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
      { title: "Crops", href: "/dashboard/crops", icon: LeafIcon },
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
      { title: "Notifications", href: "/dashboard/notifications", icon: BellIcon },
      { title: "Team", href: "/dashboard/team", icon: Users },
      { title: "Support", href: "/dashboard/support", icon: HelpCircle },
      { title: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

function MobileNavCategory({ 
  category, 
  pathname, 
  onClose 
}: { 
  category: NavCategory; 
  pathname: string;
  onClose: () => void;
}) {
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
                  onClick={onClose}
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

function MobileNav({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="p-4">
      <div className="space-y-1">
        {navCategories.map((category) => (
          <MobileNavCategory
            key={category.title}
            category={category}
            pathname={pathname}
            onClose={onClose}
          />
        ))}
      </div>
    </nav>
  );
}

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold hidden sm:inline">Ghana Farmer</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
            >
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-primary" />
                )}
              </div>
              <span className="hidden md:inline text-sm font-medium">
                {user.name || user.email}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 border-b">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="p-1">
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 rounded-md w-full text-left text-red-600"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white z-50 md:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setShowMobileMenu(false)}>
                <Leaf className="h-7 w-7 text-primary" />
                <span className="text-lg font-bold">Ghana Farmer</span>
              </Link>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <MobileNav onClose={() => setShowMobileMenu(false)} />
          </div>
        </>
      )}
    </header>
  );
}
