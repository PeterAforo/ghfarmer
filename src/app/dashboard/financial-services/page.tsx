"use client";

import { useState } from "react";
import {
  Banknote,
  Shield,
  Building2,
  Phone,
  ExternalLink,
  Calculator,
  FileText,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoanProduct {
  id: string;
  name: string;
  provider: string;
  providerType: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  interestRate: number;
  tenure: string;
  requirements: string[];
  phone: string | null;
  applicationUrl: string | null;
}

interface InsuranceProduct {
  id: string;
  name: string;
  provider: string;
  type: string;
  description: string;
  coverage: string[];
  premium: string;
  phone: string | null;
  applicationUrl: string | null;
}

// Sample loan products
const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: "1",
    name: "Agric Development Loan",
    provider: "Agricultural Development Bank (ADB)",
    providerType: "Bank",
    description: "Flexible agricultural loans for crop and livestock farmers with competitive rates.",
    minAmount: 5000,
    maxAmount: 500000,
    interestRate: 22,
    tenure: "6-36 months",
    requirements: [
      "Valid Ghana Card",
      "Farm registration documents",
      "6 months bank statement",
      "Collateral (for loans above GHS 50,000)",
    ],
    phone: "+233 30 266 2758",
    applicationUrl: "https://adb.com.gh",
  },
  {
    id: "2",
    name: "Farmer Loan Scheme",
    provider: "GCB Bank",
    providerType: "Bank",
    description: "Short-term loans for smallholder farmers to purchase inputs and equipment.",
    minAmount: 2000,
    maxAmount: 100000,
    interestRate: 24,
    tenure: "3-12 months",
    requirements: [
      "Valid ID",
      "Proof of farming activity",
      "Guarantor",
      "Account with GCB",
    ],
    phone: "+233 30 266 4910",
    applicationUrl: "https://gcbbank.com.gh",
  },
  {
    id: "3",
    name: "Agribusiness Loan",
    provider: "Fidelity Bank",
    providerType: "Bank",
    description: "Comprehensive financing for agricultural value chain activities.",
    minAmount: 10000,
    maxAmount: 1000000,
    interestRate: 25,
    tenure: "12-60 months",
    requirements: [
      "Business registration",
      "Financial statements",
      "Business plan",
      "Collateral",
    ],
    phone: "+233 30 221 4490",
    applicationUrl: "https://fidelitybank.com.gh",
  },
  {
    id: "4",
    name: "Microfinance Agric Loan",
    provider: "Opportunity International",
    providerType: "MFI",
    description: "Small loans for rural farmers with flexible repayment options.",
    minAmount: 500,
    maxAmount: 20000,
    interestRate: 28,
    tenure: "3-18 months",
    requirements: [
      "Valid ID",
      "Group membership (for group loans)",
      "Proof of farming",
    ],
    phone: "+233 30 270 1384",
    applicationUrl: null,
  },
];

// Sample insurance products
const INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: "1",
    name: "Crop Insurance",
    provider: "Ghana Agricultural Insurance Pool (GAIP)",
    type: "Crop",
    description: "Protection against crop losses due to drought, flood, pest, and disease.",
    coverage: [
      "Drought damage",
      "Flood damage",
      "Pest and disease losses",
      "Fire damage",
    ],
    premium: "5-8% of sum insured",
    phone: "+233 30 222 1234",
    applicationUrl: "https://gaip.com.gh",
  },
  {
    id: "2",
    name: "Livestock Insurance",
    provider: "Ghana Agricultural Insurance Pool (GAIP)",
    type: "Livestock",
    description: "Coverage for livestock mortality and theft.",
    coverage: [
      "Death from disease",
      "Accidental death",
      "Theft",
      "Natural disasters",
    ],
    premium: "3-6% of animal value",
    phone: "+233 30 222 1234",
    applicationUrl: "https://gaip.com.gh",
  },
  {
    id: "3",
    name: "Weather Index Insurance",
    provider: "ACRE Africa",
    type: "Weather Index",
    description: "Automatic payouts based on weather data without need for loss assessment.",
    coverage: [
      "Rainfall deficit",
      "Excess rainfall",
      "Temperature extremes",
    ],
    premium: "4-7% of coverage",
    phone: "+233 24 456 7890",
    applicationUrl: null,
  },
];

export default function FinancialServicesPage() {
  const [activeTab, setActiveTab] = useState<"loans" | "insurance">("loans");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Financial Services</h1>
        <p className="text-gray-600">Access loans and insurance products for your farm</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab("loans")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "loans"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Banknote className="h-4 w-4 inline mr-2" />
          Agricultural Loans
        </button>
        <button
          onClick={() => setActiveTab("insurance")}
          className={`px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors ${
            activeTab === "insurance"
              ? "border-primary text-primary"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Shield className="h-4 w-4 inline mr-2" />
          Insurance Products
        </button>
      </div>

      {/* Loans Tab */}
      {activeTab === "loans" && (
        <div className="space-y-4">
          {LOAN_PRODUCTS.map((loan) => (
            <Card key={loan.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {loan.providerType}
                    </span>
                    <CardTitle className="text-lg mt-1">{loan.name}</CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Building2 className="h-4 w-4" />
                      {loan.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{loan.interestRate}%</p>
                    <p className="text-xs text-gray-500">Interest Rate</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{loan.description}</p>

                <div className="grid grid-cols-3 gap-4 text-center py-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500">Min Amount</p>
                    <p className="font-medium">GHS {loan.minAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Max Amount</p>
                    <p className="font-medium">GHS {loan.maxAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Tenure</p>
                    <p className="font-medium">{loan.tenure}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Requirements</p>
                  <ul className="grid grid-cols-2 gap-1">
                    {loan.requirements.map((req, i) => (
                      <li key={i} className="flex items-center gap-1 text-sm text-gray-600">
                        <ChevronRight className="h-3 w-3 text-primary" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-2">
                  {loan.phone && (
                    <Button size="sm" asChild>
                      <a href={`tel:${loan.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                    </Button>
                  )}
                  {loan.applicationUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={loan.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Apply Online
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === "insurance" && (
        <div className="space-y-4">
          {INSURANCE_PRODUCTS.map((insurance) => (
            <Card key={insurance.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded">
                      {insurance.type}
                    </span>
                    <CardTitle className="text-lg mt-1">{insurance.name}</CardTitle>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <Building2 className="h-4 w-4" />
                      {insurance.provider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">{insurance.premium}</p>
                    <p className="text-xs text-gray-500">Premium</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">{insurance.description}</p>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Coverage</p>
                  <div className="flex flex-wrap gap-2">
                    {insurance.coverage.map((item, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {insurance.phone && (
                    <Button size="sm" asChild>
                      <a href={`tel:${insurance.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Contact
                      </a>
                    </Button>
                  )}
                  {insurance.applicationUrl && (
                    <Button size="sm" variant="outline" asChild>
                      <a href={insurance.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Learn More
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
