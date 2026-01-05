"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Program {
  id: string;
  name: string;
  shortName: string | null;
  description: string;
  ministry: string | null;
  eligibility: string[] | null;
  benefits: string[] | null;
  applicationUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  regions: string[] | null;
  status: string;
}

// Sample programs data (in production, this would come from the database)
const SAMPLE_PROGRAMS: Program[] = [
  {
    id: "pfj",
    name: "Planting for Food and Jobs",
    shortName: "PFJ",
    description: "A flagship agricultural program aimed at modernizing agriculture, creating jobs, and ensuring food security in Ghana through subsidized inputs and extension services.",
    ministry: "Ministry of Food and Agriculture (MoFA)",
    eligibility: [
      "Registered farmer with valid ID",
      "Farm size of at least 0.5 hectares",
      "Located in participating district",
      "No outstanding debts from previous programs",
    ],
    benefits: [
      "50% subsidy on certified seeds",
      "50% subsidy on fertilizers",
      "Free extension services",
      "Access to mechanization services",
      "Guaranteed market for produce",
    ],
    applicationUrl: "https://mofa.gov.gh/pfj",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    regions: ["All Regions"],
    status: "ACTIVE",
  },
  {
    id: "rearing",
    name: "Rearing for Food and Jobs",
    shortName: "RFJ",
    description: "A livestock development initiative to boost domestic meat production, reduce imports, and create employment opportunities in the livestock sector.",
    ministry: "Ministry of Food and Agriculture (MoFA)",
    eligibility: [
      "Registered livestock farmer",
      "Adequate housing facilities",
      "Basic training in animal husbandry",
    ],
    benefits: [
      "Subsidized day-old chicks",
      "Subsidized feed",
      "Veterinary support",
      "Training programs",
    ],
    applicationUrl: "https://mofa.gov.gh/rfj",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    regions: ["All Regions"],
    status: "ACTIVE",
  },
  {
    id: "greenhouse",
    name: "Greenhouse Village Program",
    shortName: "GVP",
    description: "An initiative to promote greenhouse farming technology for year-round vegetable production and youth employment in agriculture.",
    ministry: "Ministry of Food and Agriculture (MoFA)",
    eligibility: [
      "Youth aged 18-35",
      "Interest in greenhouse farming",
      "Willingness to undergo training",
      "Access to land (owned or leased)",
    ],
    benefits: [
      "Greenhouse infrastructure support",
      "Technical training",
      "Startup inputs",
      "Market linkages",
    ],
    applicationUrl: null,
    startDate: "2024-03-01",
    endDate: null,
    regions: ["Greater Accra", "Ashanti", "Eastern", "Western"],
    status: "ACTIVE",
  },
  {
    id: "youth-agric",
    name: "Youth in Agriculture Programme",
    shortName: "YIAP",
    description: "A program designed to attract youth into agriculture through training, mentorship, and startup support.",
    ministry: "Ministry of Food and Agriculture (MoFA)",
    eligibility: [
      "Ghanaian citizen aged 18-35",
      "Completed at least JHS education",
      "Passion for agriculture",
    ],
    benefits: [
      "6-month practical training",
      "Startup kit worth GHS 5,000",
      "Mentorship from experienced farmers",
      "Access to land",
    ],
    applicationUrl: null,
    startDate: null,
    endDate: null,
    regions: ["All Regions"],
    status: "UPCOMING",
  },
];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>(SAMPLE_PROGRAMS);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedPrograms, setAppliedPrograms] = useState<Set<string>>(new Set());
  const [applying, setApplying] = useState<string | null>(null);

  async function handleApply(programId: string) {
    setApplying(programId);
    try {
      const res = await fetch(`/api/programs/${programId}/apply`, {
        method: "POST",
      });
      if (res.ok) {
        setAppliedPrograms((prev) => new Set([...prev, programId]));
      }
    } catch (error) {
      console.error("Error applying:", error);
    } finally {
      setApplying(null);
    }
  }

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    UPCOMING: "bg-blue-100 text-blue-700",
    CLOSED: "bg-gray-100 text-gray-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Government Programs</h1>
        <p className="text-gray-600">
          Explore and apply for agricultural support programs
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid gap-6">
          {programs.map((program) => (
            <Card key={program.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {program.shortName && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                          {program.shortName}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded ${
                          STATUS_COLORS[program.status]
                        }`}
                      >
                        {program.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{program.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{program.description}</p>

                {program.ministry && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building2 className="h-4 w-4" />
                    {program.ministry}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {program.eligibility && program.eligibility.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Eligibility</h4>
                      <ul className="space-y-1">
                        {program.eligibility.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {program.benefits && program.benefits.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                      <ul className="space-y-1">
                        {program.benefits.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-primary">•</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2 border-t">
                  {program.startDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(program.startDate).toLocaleDateString()} -{" "}
                      {program.endDate
                        ? new Date(program.endDate).toLocaleDateString()
                        : "Ongoing"}
                    </span>
                  )}
                  {program.regions && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {program.regions.join(", ")}
                    </span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  {program.status === "ACTIVE" && (
                    <Button
                      onClick={() => handleApply(program.id)}
                      disabled={applying === program.id || appliedPrograms.has(program.id)}
                    >
                      {appliedPrograms.has(program.id) ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : applying === program.id ? (
                        "Applying..."
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Apply Now
                        </>
                      )}
                    </Button>
                  )}
                  {program.applicationUrl && (
                    <Button variant="outline" asChild>
                      <a
                        href={program.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Official Website
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
