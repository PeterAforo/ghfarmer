"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Leaf, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LANGUAGES = [
  { value: "ENGLISH", label: "English" },
  { value: "TWI", label: "Twi" },
  { value: "GA", label: "Ga" },
  { value: "EWE", label: "Ewe" },
  { value: "HAUSA", label: "Hausa" },
  { value: "DAGBANI", label: "Dagbani" },
];

const ACCOUNT_TYPES = [
  { value: "FARMER", label: "Farmer", description: "Manage your farm, crops, and livestock" },
  { value: "SUPPLIER", label: "Input Supplier", description: "Sell seeds, fertilizers, equipment to farmers" },
  { value: "VETERINARIAN", label: "Veterinarian", description: "Offer animal health services" },
  { value: "EXTENSION_OFFICER", label: "Extension Officer", description: "Provide agricultural advisory services" },
  { value: "BUYER", label: "Buyer/Aggregator", description: "Purchase farm produce from farmers" },
];

const FARMER_TYPES = [
  { value: "SMALLHOLDER", label: "Smallholder Farmer" },
  { value: "COMMERCIAL", label: "Commercial Farmer" },
];

// Business types mapped by account type
const BUSINESS_TYPES_BY_ACCOUNT: Record<string, { value: string; label: string }[]> = {
  VETERINARIAN: [
    { value: "VETERINARIAN", label: "General Veterinary Practice" },
    { value: "BREEDING_SERVICES", label: "Breeding & AI Services" },
  ],
  EXTENSION_OFFICER: [
    { value: "EXTENSION_OFFICER", label: "Agricultural Extension" },
    { value: "FARM_CONSULTANT", label: "Farm Consultant" },
    { value: "SOIL_TESTING", label: "Soil Testing Services" },
  ],
  SUPPLIER: [
    { value: "INPUT_SUPPLIER", label: "General Input Supplier (Seeds, Fertilizers)" },
    { value: "AGROCHEMICAL_SUPPLIER", label: "Agrochemical Supplier" },
    { value: "FEED_SUPPLIER", label: "Animal Feed Supplier" },
    { value: "EQUIPMENT_SUPPLIER", label: "Farm Equipment Supplier" },
    { value: "SEED_SUPPLIER", label: "Seed Supplier" },
    // Livestock-specific suppliers
    { value: "LIVESTOCK_INPUT_SUPPLIER", label: "Livestock Input Supplier" },
    { value: "POULTRY_EQUIPMENT_SUPPLIER", label: "Poultry Equipment Supplier" },
    { value: "DAIRY_EQUIPMENT_SUPPLIER", label: "Dairy Equipment Supplier" },
    { value: "HATCHERY_SUPPLIER", label: "Hatchery / Day-Old Chicks" },
    { value: "ANIMAL_HEALTH_SUPPLIER", label: "Animal Health Products" },
  ],
  BUYER: [
    { value: "PROCESSING_SERVICES", label: "Processing Services" },
    { value: "STORAGE_SERVICES", label: "Storage Services" },
    { value: "TRANSPORT_LOGISTICS", label: "Transport & Logistics" },
    { value: "OTHER", label: "Produce Buyer / Aggregator" },
  ],
};

// Ghana regions with constituencies and districts
const LOCATION_DATA: Record<string, Record<string, string[]>> = {
  "Greater Accra": {
    "Accra Metropolitan": ["Ablekuma Central", "Ablekuma North", "Ablekuma West", "Ashiedu Keteke", "Ayawaso Central", "Ayawaso East", "Ayawaso North", "Ayawaso West", "Okaikwei Central", "Okaikwei North"],
    "Tema Metropolitan": ["Tema Central", "Tema East", "Tema West"],
    "Ga East": ["Abokobi", "Dome-Kwabenya"],
    "Ga West": ["Amasaman", "Trobu"],
    "Ga South": ["Weija-Gbawe", "Bortianor-Ngleshie Amanfro"],
    "Ga Central": ["Ablekuma South", "Dansoman"],
    "La Dade-Kotopon": ["La Dadekotopon"],
    "La Nkwantanang-Madina": ["Madina", "Abokobi"],
    "Adentan": ["Adentan"],
    "Ledzokuku": ["Ledzokuku", "Teshie"],
    "Kpone Katamanso": ["Kpone", "Katamanso"],
    "Ada East": ["Ada"],
    "Ada West": ["Sege"],
    "Ningo Prampram": ["Prampram", "Ningo"],
    "Shai-Osudoku": ["Dodowa", "Osudoku"],
  },
  "Ashanti": {
    "Kumasi Metropolitan": ["Asokwa", "Bantama", "Kwadaso", "Manhyia North", "Manhyia South", "Nhyiaeso", "Oforikrom", "Old Tafo", "Suame", "Subin"],
    "Obuasi Municipal": ["Obuasi East", "Obuasi West"],
    "Ejisu Municipal": ["Ejisu"],
    "Asante Akim Central": ["Asante Akim Central"],
    "Asante Akim North": ["Agogo"],
    "Asante Akim South": ["Juaso"],
    "Atwima Kwanwoma": ["Atwima Kwanwoma"],
    "Atwima Mponua": ["Nyinahin"],
    "Atwima Nwabiagya North": ["Nkawie North"],
    "Atwima Nwabiagya South": ["Nkawie South"],
    "Bekwai Municipal": ["Bekwai"],
    "Bosomtwe": ["Bosomtwe"],
    "Offinso North": ["Offinso North"],
    "Offinso South": ["Offinso South"],
    "Sekyere Afram Plains": ["Sekyere Afram Plains"],
    "Sekyere Central": ["Sekyere Central"],
    "Sekyere East": ["Effiduase"],
    "Sekyere Kumawu": ["Kumawu"],
    "Sekyere South": ["Agona"],
  },
  "Western": {
    "Sekondi-Takoradi Metropolitan": ["Sekondi", "Takoradi", "Essikado-Ketan", "Effia"],
    "Ahanta West": ["Agona Nkwanta"],
    "Ellembelle": ["Nkroful"],
    "Jomoro": ["Half Assini"],
    "Mpohor": ["Mpohor"],
    "Nzema East": ["Axim"],
    "Prestea-Huni Valley": ["Prestea", "Bogoso"],
    "Shama": ["Shama"],
    "Tarkwa-Nsuaem": ["Tarkwa"],
    "Wassa Amenfi Central": ["Wassa Akropong"],
    "Wassa Amenfi East": ["Wassa Amenfi East"],
    "Wassa Amenfi West": ["Asankragwa"],
    "Wassa East": ["Daboase"],
  },
  "Central": {
    "Cape Coast Metropolitan": ["Cape Coast North", "Cape Coast South"],
    "Awutu Senya East": ["Kasoa"],
    "Awutu Senya West": ["Awutu Senya West"],
    "Effutu": ["Winneba"],
    "Gomoa Central": ["Afransi"],
    "Gomoa East": ["Potsin"],
    "Gomoa West": ["Apam"],
    "Agona East": ["Nsaba"],
    "Agona West": ["Swedru"],
    "Asikuma-Odoben-Brakwa": ["Breman Asikuma"],
    "Assin Central": ["Assin Fosu"],
    "Assin North": ["Assin North"],
    "Assin South": ["Assin South"],
    "Ekumfi": ["Essarkyir"],
    "Komenda-Edina-Eguafo-Abirem": ["Komenda", "Elmina"],
    "Mfantsiman": ["Saltpond"],
    "Twifo Atti-Morkwa": ["Twifo Praso"],
    "Twifo-Hemang-Lower Denkyira": ["Hemang"],
    "Upper Denkyira East": ["Dunkwa"],
    "Upper Denkyira West": ["Diaso"],
  },
  "Eastern": {
    "New Juaben South": ["Koforidua"],
    "New Juaben North": ["Effiduase"],
    "Abuakwa North": ["Kukurantumi"],
    "Abuakwa South": ["Kibi"],
    "Achiase": ["Achiase"],
    "Akuapim North": ["Akropong"],
    "Akuapim South": ["Nsawam"],
    "Akyemansa": ["Akyemansa"],
    "Asene Manso Akroso": ["Asene"],
    "Atiwa East": ["Anyinam"],
    "Atiwa West": ["Kwabeng"],
    "Ayensuano": ["Ayensuano"],
    "Birim Central": ["Akim Oda"],
    "Birim North": ["New Abirem"],
    "Birim South": ["Akim Swedru"],
    "Denkyembour": ["Akwatia"],
    "Fanteakwa North": ["Begoro"],
    "Fanteakwa South": ["Osino"],
    "Kwaebibirem": ["Kade"],
    "Kwahu Afram Plains North": ["Donkorkrom"],
    "Kwahu Afram Plains South": ["Tease"],
    "Kwahu East": ["Abetifi"],
    "Kwahu South": ["Mpraeso"],
    "Kwahu West": ["Nkawkaw"],
    "Lower Manya Krobo": ["Odumase Krobo"],
    "Nsawam Adoagyiri": ["Nsawam"],
    "Okere": ["Adukrom"],
    "Suhum": ["Suhum"],
    "Upper Manya Krobo": ["Asesewa"],
    "Upper West Akim": ["Adeiso"],
    "West Akim": ["Asamankese"],
    "Yilo Krobo": ["Somanya"],
  },
  "Volta": {
    "Ho Municipal": ["Ho Central", "Ho West"],
    "Adaklu": ["Adaklu"],
    "Afadzato South": ["Ve-Golokwati"],
    "Agotime Ziope": ["Kpetoe"],
    "Akatsi North": ["Ave Dakpa"],
    "Akatsi South": ["Akatsi"],
    "Anloga": ["Anloga"],
    "Central Tongu": ["Adidome"],
    "Ho West": ["Dzolokpuita"],
    "Hohoe": ["Hohoe"],
    "Keta": ["Keta"],
    "Ketu North": ["Dzodze"],
    "Ketu South": ["Aflao"],
    "Kpando": ["Kpando"],
    "North Dayi": ["Anfoega"],
    "North Tongu": ["Battor"],
    "South Dayi": ["Kpeve"],
    "South Tongu": ["Sogakope"],
  },
  "Northern": {
    "Tamale Metropolitan": ["Tamale Central", "Tamale North", "Tamale South"],
    "Gushegu": ["Gushegu"],
    "Karaga": ["Karaga"],
    "Kpandai": ["Kpandai"],
    "Kumbungu": ["Kumbungu"],
    "Mion": ["Sang"],
    "Nanton": ["Nanton"],
    "Nanumba North": ["Bimbilla"],
    "Nanumba South": ["Wulensi"],
    "Saboba": ["Saboba"],
    "Sagnarigu": ["Sagnarigu"],
    "Savelugu": ["Savelugu"],
    "Tatale Sanguli": ["Tatale"],
    "Tolon": ["Tolon"],
    "Yendi": ["Yendi"],
    "Zabzugu": ["Zabzugu"],
  },
  "Upper East": {
    "Bolgatanga Municipal": ["Bolgatanga Central", "Bolgatanga East"],
    "Bawku Municipal": ["Bawku Central"],
    "Bawku West": ["Zebilla"],
    "Binduri": ["Binduri"],
    "Bongo": ["Bongo"],
    "Builsa North": ["Sandema"],
    "Builsa South": ["Fumbisi"],
    "Garu": ["Garu"],
    "Kassena Nankana East": ["Navrongo"],
    "Kassena Nankana West": ["Paga"],
    "Nabdam": ["Nangodi"],
    "Pusiga": ["Pusiga"],
    "Talensi": ["Tongo"],
    "Tempane": ["Tempane"],
  },
  "Upper West": {
    "Wa Municipal": ["Wa Central", "Wa East", "Wa West"],
    "Daffiama Bussie Issa": ["Issa"],
    "Jirapa": ["Jirapa"],
    "Lambussie Karni": ["Lambussie"],
    "Lawra": ["Lawra"],
    "Nadowli-Kaleo": ["Nadowli"],
    "Nandom": ["Nandom"],
    "Sissala East": ["Tumu"],
    "Sissala West": ["Gwollu"],
    "Wa East": ["Funsi"],
    "Wa West": ["Wechiau"],
  },
  "Bono": {
    "Sunyani Municipal": ["Sunyani East", "Sunyani West"],
    "Berekum East": ["Berekum"],
    "Berekum West": ["Jinijini"],
    "Dormaa Central": ["Dormaa Ahenkro"],
    "Dormaa East": ["Wamfie"],
    "Dormaa West": ["Nkrankwanta"],
    "Jaman North": ["Sampa"],
    "Jaman South": ["Drobo"],
    "Sunyani West": ["Odumasi"],
    "Tain": ["Nsawkaw"],
    "Wenchi": ["Wenchi"],
  },
  "Bono East": {
    "Techiman Municipal": ["Techiman North", "Techiman South"],
    "Atebubu-Amantin": ["Atebubu"],
    "Kintampo North": ["Kintampo"],
    "Kintampo South": ["Jema"],
    "Nkoranza North": ["Busunya"],
    "Nkoranza South": ["Nkoranza"],
    "Pru East": ["Yeji"],
    "Pru West": ["Prang"],
    "Sene East": ["Kajaji"],
    "Sene West": ["Kwame Danso"],
    "Techiman North": ["Tuobodom"],
  },
  "Ahafo": {
    "Asunafo North": ["Goaso"],
    "Asunafo South": ["Kukuom"],
    "Asutifi North": ["Kenyasi"],
    "Asutifi South": ["Hwidiem"],
    "Tano North": ["Duayaw Nkwanta"],
    "Tano South": ["Bechem"],
  },
  "Western North": {
    "Sefwi Wiawso": ["Sefwi Wiawso"],
    "Aowin": ["Enchi"],
    "Bia East": ["Adabokrom"],
    "Bia West": ["Essam"],
    "Bibiani-Anhwiaso-Bekwai": ["Bibiani"],
    "Bodi": ["Bodi"],
    "Juaboso": ["Juaboso"],
    "Sefwi Akontombra": ["Akontombra"],
    "Suaman": ["Dadieso"],
  },
  "Oti": {
    "Biakoye": ["Nkonya"],
    "Jasikan": ["Jasikan"],
    "Kadjebi": ["Kadjebi"],
    "Krachi East": ["Dambai"],
    "Krachi Nchumuru": ["Chinderi"],
    "Krachi West": ["Kete Krachi"],
    "Nkwanta North": ["Kpassa"],
    "Nkwanta South": ["Nkwanta"],
  },
  "North East": {
    "Bunkpurugu-Nakpanduri": ["Bunkpurugu"],
    "Chereponi": ["Chereponi"],
    "East Mamprusi": ["Gambaga"],
    "Mamprugu Moagduri": ["Yagaba"],
    "West Mamprusi": ["Walewale"],
    "Yunyoo-Nasuan": ["Yunyoo"],
  },
  "Savannah": {
    "Bole": ["Bole"],
    "Central Gonja": ["Buipe"],
    "East Gonja": ["Salaga"],
    "North East Gonja": ["Kpalbe"],
    "North Gonja": ["Daboya"],
    "Sawla-Tuna-Kalba": ["Sawla"],
    "West Gonja": ["Damongo"],
  },
};

const REGIONS = Object.keys(LOCATION_DATA);

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    accountType: "FARMER",
    farmerType: "SMALLHOLDER",
    language: "ENGLISH",
    region: "",
    constituency: "",
    district: "",
    // Service provider fields
    businessName: "",
    businessType: "",
    licenseNumber: "",
  });

  // Get constituencies based on selected region
  const constituencies = formData.region ? Object.keys(LOCATION_DATA[formData.region] || {}) : [];
  
  // Get districts based on selected constituency
  const districts = formData.region && formData.constituency 
    ? LOCATION_DATA[formData.region]?.[formData.constituency] || [] 
    : [];

  // Get business types based on account type
  const availableBusinessTypes = BUSINESS_TYPES_BY_ACCOUNT[formData.accountType] || [];

  function updateFormData(field: string, value: string) {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Reset dependent fields when parent changes
      if (field === "region") {
        updated.constituency = "";
        updated.district = "";
      } else if (field === "constituency") {
        updated.district = "";
      } else if (field === "accountType") {
        updated.businessType = "";
      }
      return updated;
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    if (step === 1) {
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      setError("");
      setStep(2);
      return;
    }

    if (step === 2) {
      setError("");
      setStep(3);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          accountType: formData.accountType,
          farmerType: formData.accountType === "FARMER" ? formData.farmerType : undefined,
          language: formData.language,
          region: formData.region || undefined,
          constituency: formData.constituency || undefined,
          district: formData.district || undefined,
          // Service provider fields
          businessName: formData.accountType !== "FARMER" ? formData.businessName : undefined,
          businessType: formData.accountType !== "FARMER" ? formData.businessType : undefined,
          licenseNumber: formData.licenseNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/auth/login?registered=true");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Ghana Farmer</span>
            </Link>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            {step === 1 && "Enter your details to get started"}
            {step === 2 && "What type of account do you need?"}
            {step === 3 && formData.accountType === "FARMER" && "Tell us about your farm"}
            {step === 3 && formData.accountType !== "FARMER" && "Tell us about your business"}
          </CardDescription>
          <div className="flex justify-center gap-2 pt-2">
            <div
              className={`h-2 w-12 rounded-full ${
                step >= 1 ? "bg-primary" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step >= 2 ? "bg-primary" : "bg-gray-200"
              }`}
            />
            <div
              className={`h-2 w-12 rounded-full ${
                step >= 3 ? "bg-primary" : "bg-gray-200"
              }`}
            />
          </div>
        </CardHeader>
        <form onSubmit={onSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Kwame Asante"
                    required
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="farmer@example.com"
                    required
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+233 XX XXX XXXX"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => updateFormData("password", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      updateFormData("confirmPassword", e.target.value)
                    }
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <div className="grid gap-2">
                    {ACCOUNT_TYPES.map((type) => (
                      <div
                        key={type.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.accountType === type.value
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => updateFormData("accountType", type.value)}
                      >
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-gray-500">{type.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 3 && formData.accountType === "FARMER" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="farmerType">Farmer Type</Label>
                  <Select
                    value={formData.farmerType}
                    onValueChange={(value) => updateFormData("farmerType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select farmer type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FARMER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Preferred Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => updateFormData("language", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region (Optional)</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => updateFormData("region", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.region && (
                  <div className="space-y-2">
                    <Label htmlFor="constituency">Constituency</Label>
                    <Select
                      value={formData.constituency}
                      onValueChange={(value) => updateFormData("constituency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select constituency" />
                      </SelectTrigger>
                      <SelectContent>
                        {constituencies.map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.constituency && (
                  <div className="space-y-2">
                    <Label htmlFor="district">District/Town</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => updateFormData("district", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}

            {step === 3 && formData.accountType !== "FARMER" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business/Practice Name *</Label>
                  <Input
                    id="businessName"
                    placeholder="e.g., Accra Veterinary Services"
                    required
                    value={formData.businessName}
                    onChange={(e) => updateFormData("businessName", e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={formData.businessType}
                    onValueChange={(value) => updateFormData("businessType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBusinessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(formData.accountType === "VETERINARIAN" || formData.accountType === "EXTENSION_OFFICER") && (
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License/Registration Number</Label>
                    <Input
                      id="licenseNumber"
                      placeholder="e.g., VET-2024-001"
                      value={formData.licenseNumber}
                      onChange={(e) => updateFormData("licenseNumber", e.target.value)}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">
                      Required for verification as a licensed professional
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="region">Service Region</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => updateFormData("region", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region} value={region}>
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.region && (
                  <div className="space-y-2">
                    <Label htmlFor="constituency">Constituency</Label>
                    <Select
                      value={formData.constituency}
                      onValueChange={(value) => updateFormData("constituency", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select constituency" />
                      </SelectTrigger>
                      <SelectContent>
                        {constituencies.map((constituency) => (
                          <SelectItem key={constituency} value={constituency}>
                            {constituency}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {formData.constituency && (
                  <div className="space-y-2">
                    <Label htmlFor="district">District/Town</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(value) => updateFormData("district", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district} value={district}>
                            {district}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex gap-2 w-full">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(step - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                className={step === 1 ? "w-full" : "flex-1"}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {step < 3 ? "Continue" : "Create Account"}
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
