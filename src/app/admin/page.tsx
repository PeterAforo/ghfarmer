import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Leaf, Store, CreditCard, TrendingUp, Activity } from "lucide-react";

async function getStats() {
  const [
    totalUsers,
    totalFarms,
    totalCrops,
    totalLivestock,
    totalMarkets,
    recentUsers,
  ] = await Promise.all([
    db.user.count(),
    db.farm.count(),
    db.cropEntry.count(),
    db.livestockEntry.count(),
    db.market.count(),
    db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        subscription: true,
        createdAt: true,
      },
    }),
  ]);

  // Count by subscription
  const subscriptionCounts = await db.user.groupBy({
    by: ["subscription"],
    _count: true,
  });

  return {
    totalUsers,
    totalFarms,
    totalCrops,
    totalLivestock,
    totalMarkets,
    recentUsers,
    subscriptionCounts,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const stats = await getStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Farms
            </CardTitle>
            <Leaf className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFarms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Crop Entries
            </CardTitle>
            <Activity className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCrops}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Markets
            </CardTitle>
            <Store className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMarkets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.subscriptionCounts.map((sub) => (
                <div
                  key={sub.subscription}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        sub.subscription === "FREE"
                          ? "bg-gray-400"
                          : sub.subscription === "PROFESSIONAL"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <span className="font-medium">{sub.subscription}</span>
                  </div>
                  <span className="text-gray-600">{sub._count} users</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <p className="font-medium">{user.name || "No name"}</p>
                    <p className="text-gray-500 text-xs">{user.email}</p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      user.subscription === "FREE"
                        ? "bg-gray-100 text-gray-700"
                        : user.subscription === "PROFESSIONAL"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user.subscription}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
