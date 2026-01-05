// Ghana Regions, Constituencies, and Districts Data
// Structure: Region -> Constituency -> Districts

export interface ConstituencyData {
  name: string;
  districts: string[];
}

export interface RegionData {
  constituencies: ConstituencyData[];
}

export const GHANA_LOCATIONS: Record<string, RegionData> = {
  "Greater Accra": {
    constituencies: [
      { name: "Ablekuma Central", districts: ["Ablekuma Central Municipal"] },
      { name: "Ablekuma North", districts: ["Ablekuma North Municipal"] },
      { name: "Ablekuma West", districts: ["Ablekuma West Municipal", "Weija Gbawe Municipal"] },
      { name: "Accra Central", districts: ["Accra Metropolitan"] },
      { name: "Ada", districts: ["Ada East", "Ada West"] },
      { name: "Adentan", districts: ["Adentan Municipal"] },
      { name: "Ashaiman", districts: ["Ashaiman Municipal"] },
      { name: "Ayawaso Central", districts: ["Ayawaso Central Municipal"] },
      { name: "Ayawaso East", districts: ["Ayawaso East Municipal"] },
      { name: "Ayawaso North", districts: ["Ayawaso North Municipal"] },
      { name: "Ayawaso West Wuogon", districts: ["Ayawaso West Municipal"] },
      { name: "Bortianor Ngleshie Amanfro", districts: ["Ga South Municipal"] },
      { name: "Dade Kotopon", districts: ["La Dade Kotopon Municipal"] },
      { name: "Dome Kwabenya", districts: ["Ga East Municipal"] },
      { name: "Klottey Korle", districts: ["Korle Klottey Municipal"] },
      { name: "Kpone Katamanso", districts: ["Kpone Katamanso Municipal"] },
      { name: "Krowor", districts: ["Krowor Municipal"] },
      { name: "Ledzokuku", districts: ["Ledzokuku Municipal"] },
      { name: "Madina", districts: ["La Nkwantanang Madina Municipal"] },
      { name: "Ningo Prampram", districts: ["Ningo Prampram"] },
      { name: "Odododiodio", districts: ["Accra Metropolitan"] },
      { name: "Okaikwei Central", districts: ["Okaikwei North Municipal"] },
      { name: "Okaikwei North", districts: ["Okaikwei North Municipal"] },
      { name: "Shai Osudoku", districts: ["Shai Osudoku"] },
      { name: "Tema Central", districts: ["Tema Metropolitan"] },
      { name: "Tema East", districts: ["Tema Metropolitan"] },
      { name: "Tema West", districts: ["Tema Metropolitan"] },
      { name: "Trobu", districts: ["Ga North Municipal"] },
      { name: "Weija Gbawe", districts: ["Weija Gbawe Municipal"] },
    ],
  },
  "Ashanti": {
    constituencies: [
      { name: "Ahafo Ano North", districts: ["Ahafo Ano North Municipal"] },
      { name: "Ahafo Ano South East", districts: ["Ahafo Ano South East"] },
      { name: "Ahafo Ano South West", districts: ["Ahafo Ano South West"] },
      { name: "Asante Akim Central", districts: ["Asante Akim Central Municipal"] },
      { name: "Asante Akim North", districts: ["Asante Akim North Municipal"] },
      { name: "Asante Akim South", districts: ["Asante Akim South Municipal"] },
      { name: "Asawase", districts: ["Asokore Mampong Municipal"] },
      { name: "Asokwa", districts: ["Asokwa Municipal"] },
      { name: "Atwima Kwanwoma", districts: ["Atwima Kwanwoma"] },
      { name: "Atwima Mponua", districts: ["Atwima Mponua"] },
      { name: "Atwima Nwabiagya North", districts: ["Atwima Nwabiagya North"] },
      { name: "Atwima Nwabiagya South", districts: ["Atwima Nwabiagya Municipal"] },
      { name: "Bantama", districts: ["Bantama Municipal"] },
      { name: "Bekwai", districts: ["Bekwai Municipal"] },
      { name: "Bosome Freho", districts: ["Bosome Freho"] },
      { name: "Bosomtwe", districts: ["Bosomtwe"] },
      { name: "Ejisu", districts: ["Ejisu Municipal"] },
      { name: "Ejura Sekyedumase", districts: ["Ejura Sekyedumase Municipal"] },
      { name: "Fomena", districts: ["Adansi North"] },
      { name: "Juaben", districts: ["Juaben Municipal"] },
      { name: "Kumasi Central", districts: ["Kumasi Metropolitan"] },
      { name: "Kwabre East", districts: ["Kwabre East Municipal"] },
      { name: "Kwadaso", districts: ["Kwadaso Municipal"] },
      { name: "Mampong", districts: ["Mampong Municipal"] },
      { name: "Manso Adubia", districts: ["Amansie West"] },
      { name: "Manso Nkwanta", districts: ["Amansie South"] },
      { name: "New Edubiase", districts: ["Adansi South"] },
      { name: "Nhyiaeso", districts: ["Nhyiaeso Municipal"] },
      { name: "Nsuta Kwamang Beposo", districts: ["Sekyere Central"] },
      { name: "Obuasi East", districts: ["Obuasi East"] },
      { name: "Obuasi West", districts: ["Obuasi Municipal"] },
      { name: "Odotobri", districts: ["Bosomtwe"] },
      { name: "Offinso North", districts: ["Offinso North"] },
      { name: "Offinso South", districts: ["Offinso Municipal"] },
      { name: "Old Tafo", districts: ["Old Tafo Municipal"] },
      { name: "Oforikrom", districts: ["Oforikrom Municipal"] },
      { name: "Sekyere Afram Plains", districts: ["Sekyere Afram Plains"] },
      { name: "Sekyere Kumawu", districts: ["Sekyere Kumawu"] },
      { name: "Suame", districts: ["Suame Municipal"] },
      { name: "Subin", districts: ["Kumasi Metropolitan"] },
      { name: "Tafo Pankrono", districts: ["Tafo Pankrono Municipal"] },
    ],
  },
  "Western": {
    constituencies: [
      { name: "Ahanta West", districts: ["Ahanta West Municipal"] },
      { name: "Effia", districts: ["Effia Kwesimintsim Municipal"] },
      { name: "Ellembelle", districts: ["Ellembelle"] },
      { name: "Evalue Ajomoro Gwira", districts: ["Nzema East Municipal"] },
      { name: "Essikado Ketan", districts: ["Essikado Ketan Municipal"] },
      { name: "Jomoro", districts: ["Jomoro Municipal"] },
      { name: "Mpohor", districts: ["Mpohor"] },
      { name: "Prestea Huni Valley", districts: ["Prestea Huni Valley Municipal"] },
      { name: "Sekondi", districts: ["Sekondi Takoradi Metropolitan"] },
      { name: "Shama", districts: ["Shama"] },
      { name: "Takoradi", districts: ["Sekondi Takoradi Metropolitan"] },
      { name: "Tarkwa Nsuaem", districts: ["Tarkwa Nsuaem Municipal"] },
      { name: "Wassa East", districts: ["Wassa East"] },
      { name: "Wassa Amenfi Central", districts: ["Wassa Amenfi Central"] },
      { name: "Wassa Amenfi East", districts: ["Wassa Amenfi East Municipal"] },
      { name: "Wassa Amenfi West", districts: ["Wassa Amenfi West Municipal"] },
    ],
  },
  "Central": {
    constituencies: [
      { name: "Abura Asebu Kwamankese", districts: ["Abura Asebu Kwamankese"] },
      { name: "Agona East", districts: ["Agona East"] },
      { name: "Agona West", districts: ["Agona West Municipal"] },
      { name: "Ajumako Enyan Essiam", districts: ["Ajumako Enyan Essiam"] },
      { name: "Asikuma Odoben Brakwa", districts: ["Asikuma Odoben Brakwa"] },
      { name: "Assin Central", districts: ["Assin Central Municipal"] },
      { name: "Assin North", districts: ["Assin North Municipal"] },
      { name: "Assin South", districts: ["Assin South", "Assin Fosu Municipal"] },
      { name: "Awutu Senya East", districts: ["Awutu Senya East Municipal"] },
      { name: "Awutu Senya West", districts: ["Awutu Senya West"] },
      { name: "Cape Coast North", districts: ["Cape Coast Metropolitan"] },
      { name: "Cape Coast South", districts: ["Cape Coast Metropolitan"] },
      { name: "Effutu", districts: ["Effutu Municipal"] },
      { name: "Ekumfi", districts: ["Ekumfi"] },
      { name: "Gomoa Central", districts: ["Gomoa Central Municipal"] },
      { name: "Gomoa East", districts: ["Gomoa East"] },
      { name: "Gomoa West", districts: ["Gomoa West"] },
      { name: "KEEA", districts: ["Komenda Edina Eguafo Abirem Municipal"] },
      { name: "Mfantsiman", districts: ["Mfantsiman Municipal"] },
      { name: "Twifo Atti Morkwa", districts: ["Twifo Atti Morkwa"] },
      { name: "Twifo Hemang Lower Denkyira", districts: ["Twifo Hemang Lower Denkyira"] },
      { name: "Upper Denkyira East", districts: ["Upper Denkyira East Municipal"] },
      { name: "Upper Denkyira West", districts: ["Upper Denkyira West"] },
    ],
  },
  "Eastern": {
    constituencies: [
      { name: "Abirem", districts: ["Birim North"] },
      { name: "Abuakwa North", districts: ["Abuakwa North Municipal"] },
      { name: "Abuakwa South", districts: ["Abuakwa South Municipal"] },
      { name: "Achiase", districts: ["Achiase"] },
      { name: "Akuapim North", districts: ["Akuapim North Municipal"] },
      { name: "Akuapim South", districts: ["Akuapim South Municipal"] },
      { name: "Akyem Mansa", districts: ["Akyemansa"] },
      { name: "Asuogyaman", districts: ["Asuogyaman"] },
      { name: "Atiwa East", districts: ["Atiwa East"] },
      { name: "Atiwa West", districts: ["Atiwa West"] },
      { name: "Ayensuano", districts: ["Ayensuano"] },
      { name: "Birim Central", districts: ["Birim Central Municipal"] },
      { name: "Birim South", districts: ["Birim South"] },
      { name: "Fanteakwa North", districts: ["Fanteakwa North"] },
      { name: "Fanteakwa South", districts: ["Fanteakwa South"] },
      { name: "Kade", districts: ["Kwaebibirem Municipal"] },
      { name: "Kwahu Afram Plains North", districts: ["Kwahu Afram Plains North"] },
      { name: "Kwahu Afram Plains South", districts: ["Kwahu Afram Plains South"] },
      { name: "Kwahu East", districts: ["Kwahu East"] },
      { name: "Kwahu South", districts: ["Kwahu South"] },
      { name: "Kwahu West", districts: ["Kwahu West Municipal"] },
      { name: "Lower Manya Krobo", districts: ["Lower Manya Krobo Municipal"] },
      { name: "New Juaben North", districts: ["New Juaben North Municipal"] },
      { name: "New Juaben South", districts: ["New Juaben South Municipal"] },
      { name: "Nsawam Adoagyiri", districts: ["Nsawam Adoagyiri Municipal"] },
      { name: "Okere", districts: ["Okere"] },
      { name: "Suhum", districts: ["Suhum Municipal"] },
      { name: "Upper Manya Krobo", districts: ["Upper Manya Krobo"] },
      { name: "Upper West Akim", districts: ["Upper West Akim"] },
      { name: "West Akim", districts: ["West Akim Municipal"] },
      { name: "Yilo Krobo", districts: ["Yilo Krobo Municipal"] },
    ],
  },
  "Volta": {
    constituencies: [
      { name: "Adaklu", districts: ["Adaklu"] },
      { name: "Afadjato South", districts: ["Afadjato South"] },
      { name: "Agotime Ziope", districts: ["Agotime Ziope"] },
      { name: "Akatsi North", districts: ["Akatsi North"] },
      { name: "Akatsi South", districts: ["Akatsi South"] },
      { name: "Anloga", districts: ["Anloga"] },
      { name: "Central Tongu", districts: ["Central Tongu"] },
      { name: "Ho Central", districts: ["Ho Municipal"] },
      { name: "Ho West", districts: ["Ho West"] },
      { name: "Hohoe", districts: ["Hohoe Municipal"] },
      { name: "Keta", districts: ["Keta Municipal"] },
      { name: "Ketu North", districts: ["Ketu North Municipal"] },
      { name: "Ketu South", districts: ["Ketu South Municipal"] },
      { name: "Kpando", districts: ["Kpando Municipal"] },
      { name: "North Dayi", districts: ["North Dayi"] },
      { name: "North Tongu", districts: ["North Tongu"] },
      { name: "South Dayi", districts: ["South Dayi"] },
      { name: "South Tongu", districts: ["South Tongu"] },
    ],
  },
  "Northern": {
    constituencies: [
      { name: "Gushegu", districts: ["Gushegu Municipal"] },
      { name: "Karaga", districts: ["Karaga"] },
      { name: "Kpandai", districts: ["Kpandai"] },
      { name: "Kumbungu", districts: ["Kumbungu"] },
      { name: "Mion", districts: ["Mion"] },
      { name: "Nanumba North", districts: ["Nanumba North Municipal"] },
      { name: "Nanumba South", districts: ["Nanumba South"] },
      { name: "Nanton", districts: ["Nanton"] },
      { name: "Saboba", districts: ["Saboba"] },
      { name: "Sagnarigu", districts: ["Sagnarigu Municipal"] },
      { name: "Savelugu", districts: ["Savelugu Municipal"] },
      { name: "Tamale Central", districts: ["Tamale Metropolitan"] },
      { name: "Tamale North", districts: ["Tamale Metropolitan"] },
      { name: "Tamale South", districts: ["Tamale Metropolitan"] },
      { name: "Tatale Sanguli", districts: ["Tatale Sanguli"] },
      { name: "Tolon", districts: ["Tolon"] },
      { name: "Yendi", districts: ["Yendi Municipal"] },
      { name: "Zabzugu", districts: ["Zabzugu"] },
    ],
  },
  "Upper East": {
    constituencies: [
      { name: "Bawku Central", districts: ["Bawku Municipal"] },
      { name: "Bawku West", districts: ["Bawku West"] },
      { name: "Binduri", districts: ["Binduri"] },
      { name: "Bolgatanga Central", districts: ["Bolgatanga Municipal"] },
      { name: "Bolgatanga East", districts: ["Bolgatanga East"] },
      { name: "Bongo", districts: ["Bongo"] },
      { name: "Builsa North", districts: ["Builsa North Municipal"] },
      { name: "Builsa South", districts: ["Builsa South"] },
      { name: "Garu", districts: ["Garu"] },
      { name: "Kassena Nankana West", districts: ["Kassena Nankana West"] },
      { name: "Nabdam", districts: ["Nabdam"] },
      { name: "Navrongo Central", districts: ["Kassena Nankana Municipal"] },
      { name: "Pusiga", districts: ["Pusiga"] },
      { name: "Talensi", districts: ["Talensi"] },
      { name: "Tempane", districts: ["Tempane"] },
    ],
  },
  "Upper West": {
    constituencies: [
      { name: "Daffiama Bussie Issa", districts: ["Daffiama Bussie Issa"] },
      { name: "Jirapa", districts: ["Jirapa Municipal"] },
      { name: "Lambussie", districts: ["Lambussie Karni"] },
      { name: "Lawra", districts: ["Lawra Municipal"] },
      { name: "Nadowli Kaleo", districts: ["Nadowli Kaleo"] },
      { name: "Nandom", districts: ["Nandom Municipal"] },
      { name: "Sissala East", districts: ["Sissala East Municipal"] },
      { name: "Sissala West", districts: ["Sissala West"] },
      { name: "Wa Central", districts: ["Wa Municipal"] },
      { name: "Wa East", districts: ["Wa East"] },
      { name: "Wa West", districts: ["Wa West"] },
    ],
  },
  "Bono": {
    constituencies: [
      { name: "Banda", districts: ["Banda"] },
      { name: "Berekum East", districts: ["Berekum East Municipal"] },
      { name: "Berekum West", districts: ["Berekum West"] },
      { name: "Dormaa Central", districts: ["Dormaa Municipal"] },
      { name: "Dormaa East", districts: ["Dormaa East"] },
      { name: "Dormaa West", districts: ["Dormaa West"] },
      { name: "Jaman North", districts: ["Jaman North"] },
      { name: "Jaman South", districts: ["Jaman South Municipal"] },
      { name: "Sunyani East", districts: ["Sunyani Municipal"] },
      { name: "Sunyani West", districts: ["Sunyani West"] },
      { name: "Tain", districts: ["Tain"] },
      { name: "Wenchi", districts: ["Wenchi Municipal"] },
    ],
  },
  "Bono East": {
    constituencies: [
      { name: "Atebubu Amantin", districts: ["Atebubu Amantin Municipal"] },
      { name: "Kintampo North", districts: ["Kintampo North Municipal"] },
      { name: "Kintampo South", districts: ["Kintampo South"] },
      { name: "Nkoranza North", districts: ["Nkoranza North"] },
      { name: "Nkoranza South", districts: ["Nkoranza South Municipal"] },
      { name: "Pru East", districts: ["Pru East"] },
      { name: "Pru West", districts: ["Pru West"] },
      { name: "Sene East", districts: ["Sene East"] },
      { name: "Sene West", districts: ["Sene West"] },
      { name: "Techiman North", districts: ["Techiman North"] },
      { name: "Techiman South", districts: ["Techiman Municipal"] },
    ],
  },
  "Ahafo": {
    constituencies: [
      { name: "Asunafo North", districts: ["Asunafo North Municipal"] },
      { name: "Asunafo South", districts: ["Asunafo South"] },
      { name: "Asutifi North", districts: ["Asutifi North"] },
      { name: "Asutifi South", districts: ["Asutifi South"] },
      { name: "Tano North", districts: ["Tano North Municipal"] },
      { name: "Tano South", districts: ["Tano South Municipal"] },
    ],
  },
  "Western North": {
    constituencies: [
      { name: "Aowin", districts: ["Aowin Municipal"] },
      { name: "Bia East", districts: ["Bia East"] },
      { name: "Bia West", districts: ["Bia West"] },
      { name: "Bibiani Anhwiaso Bekwai", districts: ["Sefwi Bibiani Anhwiaso Bekwai Municipal"] },
      { name: "Bodi", districts: ["Bodi"] },
      { name: "Juaboso", districts: ["Juaboso"] },
      { name: "Sefwi Akontombra", districts: ["Sefwi Akontombra"] },
      { name: "Sefwi Wiawso", districts: ["Sefwi Wiawso Municipal"] },
      { name: "Suaman", districts: ["Suaman"] },
    ],
  },
  "Oti": {
    constituencies: [
      { name: "Biakoye", districts: ["Biakoye"] },
      { name: "Buem", districts: ["Jasikan"] },
      { name: "Guan", districts: ["Guan"] },
      { name: "Kadjebi", districts: ["Kadjebi"] },
      { name: "Krachi East", districts: ["Krachi East Municipal"] },
      { name: "Krachi Nchumuru", districts: ["Krachi Nchumuru"] },
      { name: "Krachi West", districts: ["Krachi West"] },
      { name: "Nkwanta North", districts: ["Nkwanta North"] },
      { name: "Nkwanta South", districts: ["Nkwanta South Municipal"] },
    ],
  },
  "North East": {
    constituencies: [
      { name: "Bunkpurugu", districts: ["Bunkpurugu Nakpanduri"] },
      { name: "Chereponi", districts: ["Chereponi"] },
      { name: "East Mamprusi", districts: ["East Mamprusi Municipal"] },
      { name: "Nalerigu Gambaga", districts: ["Nalerigu Gambaga Municipal"] },
      { name: "Mamprugu Moagduri", districts: ["Mamprugu Moagduri"] },
      { name: "West Mamprusi", districts: ["West Mamprusi Municipal"] },
      { name: "Yunyoo Nasuan", districts: ["Yunyoo Nasuan"] },
    ],
  },
  "Savannah": {
    constituencies: [
      { name: "Bole Bamboi", districts: ["Bole"] },
      { name: "Central Gonja", districts: ["Central Gonja"] },
      { name: "Daboya Mankarigu", districts: ["North Gonja"] },
      { name: "Damongo", districts: ["Damongo Municipal", "West Gonja"] },
      { name: "Salaga North", districts: ["East Gonja Municipal"] },
      { name: "Salaga South", districts: ["East Gonja Municipal"] },
      { name: "Sawla Tuna Kalba", districts: ["Sawla Tuna Kalba"] },
    ],
  },
};

// Legacy support - flat list of regions
export const REGIONS = Object.keys(GHANA_LOCATIONS);

// Legacy support - flat region to districts mapping
export const GHANA_REGIONS_DISTRICTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(GHANA_LOCATIONS).map(([region, data]) => [
    region,
    [...new Set(data.constituencies.flatMap((c) => c.districts))],
  ])
);

// Get constituencies by region
export function getConstituenciesByRegion(region: string): string[] {
  const regionData = GHANA_LOCATIONS[region];
  if (!regionData) return [];
  return regionData.constituencies.map((c) => c.name);
}

// Get districts by constituency
export function getDistrictsByConstituency(region: string, constituency: string): string[] {
  const regionData = GHANA_LOCATIONS[region];
  if (!regionData) return [];
  const constituencyData = regionData.constituencies.find((c) => c.name === constituency);
  return constituencyData?.districts || [];
}

// Legacy function - get all districts by region (flat)
export function getDistrictsByRegion(region: string): string[] {
  return GHANA_REGIONS_DISTRICTS[region] || [];
}
