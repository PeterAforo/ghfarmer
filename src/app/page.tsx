import Link from "next/link";
import { Leaf, TrendingUp, Cloud, Users, Check } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gray-900">Ghana Farmer</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-600 hover:text-primary">
              Pricing
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-primary">
              About
            </Link>
            <Link href="#contact" className="text-gray-600 hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-gray-600 hover:text-primary font-medium"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Empowering Ghanaian Farmers
          <br />
          <span className="text-primary">Digitally</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Comprehensive farm management, market access, and agricultural
          intelligence at your fingertips. Track crops, manage livestock, and
          grow your farm business.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 font-medium text-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="#features"
            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 font-medium text-lg"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything You Need to Manage Your Farm
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Leaf className="h-10 w-10 text-primary" />}
            title="Crop & Livestock Management"
            description="Track planting, harvesting, vaccinations, and all farm activities in one place."
          />
          <FeatureCard
            icon={<TrendingUp className="h-10 w-10 text-primary" />}
            title="Market Intelligence"
            description="Real-time market prices, buyer connections, and price alerts to maximize profits."
          />
          <FeatureCard
            icon={<Cloud className="h-10 w-10 text-primary" />}
            title="Weather & Alerts"
            description="Weather forecasts, pest alerts, and timely reminders for farm activities."
          />
          <FeatureCard
            icon={<Users className="h-10 w-10 text-primary" />}
            title="Community & Support"
            description="Connect with other farmers, extension officers, and agricultural experts."
          />
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the plan that fits your farm. Start free and upgrade as you grow.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
            <p className="text-gray-600 mb-4">Perfect for smallholder farmers</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">Free</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature>1 Farm</PricingFeature>
              <PricingFeature>Up to 5 crop entries</PricingFeature>
              <PricingFeature>Up to 10 livestock</PricingFeature>
              <PricingFeature>Basic market prices</PricingFeature>
              <PricingFeature>Task management</PricingFeature>
              <PricingFeature>Mobile access</PricingFeature>
            </ul>
            <Link
              href="/auth/register"
              className="block w-full text-center border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 font-medium"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="bg-primary p-8 rounded-xl shadow-lg border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
            <p className="text-green-100 mb-4">For growing farm businesses</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">GH₵ 49</span>
              <span className="text-green-100">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature light>Up to 5 Farms</PricingFeature>
              <PricingFeature light>Unlimited crop entries</PricingFeature>
              <PricingFeature light>Unlimited livestock</PricingFeature>
              <PricingFeature light>Real-time market prices</PricingFeature>
              <PricingFeature light>Financial reports</PricingFeature>
              <PricingFeature light>Weather alerts</PricingFeature>
              <PricingFeature light>Price alerts</PricingFeature>
              <PricingFeature light>Priority support</PricingFeature>
            </ul>
            <Link
              href="/auth/register?plan=pro"
              className="block w-full text-center bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 font-medium"
            >
              Start 14-Day Free Trial
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <p className="text-gray-600 mb-4">For cooperatives & large farms</p>
            <div className="mb-6">
              <span className="text-4xl font-bold text-gray-900">GH₵ 199</span>
              <span className="text-gray-600">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              <PricingFeature>Unlimited Farms</PricingFeature>
              <PricingFeature>Everything in Professional</PricingFeature>
              <PricingFeature>Multi-user access</PricingFeature>
              <PricingFeature>Team management</PricingFeature>
              <PricingFeature>Advanced analytics</PricingFeature>
              <PricingFeature>API access</PricingFeature>
              <PricingFeature>Custom integrations</PricingFeature>
              <PricingFeature>Dedicated support</PricingFeature>
            </ul>
            <Link
              href="/auth/register?plan=enterprise"
              className="block w-full text-center border border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary/5 font-medium"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Farm?
          </h2>
          <p className="text-green-100 mb-8 max-w-xl mx-auto">
            Join thousands of Ghanaian farmers already using Ghana Farmer to
            increase productivity and profits.
          </p>
          <Link
            href="/auth/register"
            className="bg-white text-primary px-8 py-3 rounded-lg hover:bg-gray-100 font-medium text-lg inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-white font-bold">Ghana Farmer</span>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} Ghana Farmer. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function PricingFeature({
  children,
  light = false,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  return (
    <li className={`flex items-center gap-2 ${light ? "text-green-100" : "text-gray-600"}`}>
      <Check className={`h-5 w-5 flex-shrink-0 ${light ? "text-green-200" : "text-primary"}`} />
      {children}
    </li>
  );
}
