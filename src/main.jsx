import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  Coffee,
  Download,
  FileText,
  Filter,
  Gauge,
  LocateFixed,
  MapPin,
  MessageSquareWarning,
  Navigation,
  QrCode,
  Search,
  Star,
  TrendingDown,
  TrendingUp,
  Users,
  X
} from "lucide-react";
import QRCode from "qrcode";
import { Line, LineChart, ResponsiveContainer, Tooltip as RechartsTooltip, YAxis } from "recharts";
import "./styles.css";

const GEOLOCATION_TIMEOUT_MS = 8000;
const DEFAULT_GEOFENCE_RADIUS_M = 750;

const CATEGORIES = [
  { key: "coffee_quality_score", responseKey: "coffee_quality_yes", label: "Coffee Quality", short: "Coffee", color: "#d71920" },
  { key: "speed_score", responseKey: "speed_yes", label: "Speed", short: "Speed", color: "#f2a900" },
  { key: "staff_service_score", responseKey: "staff_service_yes", label: "Staff Service", short: "Service", color: "#4b5563" },
  { key: "cleanliness_score", responseKey: "cleanliness_yes", label: "Cleanliness", short: "Clean", color: "#138a36" },
  { key: "overall_score", label: "Overall Score", short: "Overall", color: "#111827" }
];

const SURVEY_QUESTIONS = [
  { key: "coffee_quality_yes", label: "Was your coffee enjoyable?" },
  { key: "speed_yes", label: "Were you served quickly enough?" },
  { key: "staff_service_yes", label: "Was the staff friendly and helpful?" },
  { key: "cleanliness_yes", label: "Was the coffee area clean and comfortable?" }
];

const negativeCommentExamples = [
  "Queue moved slowly during the morning rush.",
  "Coffee tasted weak and the milk station needed attention.",
  "Staff member seemed distracted and did not greet customers.",
  "Counter area was sticky and bins were full.",
  "The machine was out of cups and nobody noticed quickly.",
  "Coffee was lukewarm by the time I reached the till."
];

const baseBranches = [
  ["SHELL001", "Shell Bryanston", "Gauteng", "Johannesburg", -26.0527, 28.0248, 750, "Thabo Mokoena", 146, 0.96, 0.91, 0.95, 0.93],
  ["SHELL002", "Shell Rosebank", "Gauteng", "Johannesburg", -26.1458, 28.0416, 750, "Naledi Khumalo", 128, 0.91, 0.86, 0.89, 0.88],
  ["SHELL003", "Shell Boksburg East", "Gauteng", "Boksburg", -26.2119, 28.2596, 850, "Pieter Botha", 88, 0.67, 0.71, 0.74, 0.69],
  ["SHELL004", "Shell Pretoria Hatfield", "Gauteng", "Pretoria", -25.7479, 28.2380, 750, "Lerato Dlamini", 112, 0.86, 0.79, 0.83, 0.81],
  ["SHELL005", "Shell Centurion Mall", "Gauteng", "Centurion", -25.8601, 28.1894, 700, "Jaco van Wyk", 74, 0.78, 0.82, 0.76, 0.80],
  ["SHELL006", "Shell Sandton Drive", "Gauteng", "Sandton", -26.1076, 28.0567, 750, "Ayesha Naidoo", 156, 0.94, 0.90, 0.92, 0.91],
  ["SHELL007", "Shell Midrand N1", "Gauteng", "Midrand", -25.9992, 28.1263, 900, "Sipho Nkosi", 41, 0.73, 0.64, 0.78, 0.72],
  ["SHELL008", "Shell Soweto Maponya", "Gauteng", "Soweto", -26.2587, 27.9029, 850, "Boitumelo Maseko", 62, 0.82, 0.77, 0.80, 0.74],
  ["SHELL009", "Shell Durban North", "KwaZulu-Natal", "Durban", -29.7935, 31.0341, 750, "Sibusiso Zulu", 119, 0.90, 0.87, 0.88, 0.90],
  ["SHELL010", "Shell Umhlanga Ridge", "KwaZulu-Natal", "Umhlanga", -29.7249, 31.0663, 750, "Meera Pillay", 132, 0.93, 0.88, 0.91, 0.92],
  ["SHELL011", "Shell Pietermaritzburg Central", "KwaZulu-Natal", "Pietermaritzburg", -29.6006, 30.3794, 800, "Andile Mthembu", 58, 0.76, 0.72, 0.79, 0.70],
  ["SHELL012", "Shell Ballito Junction", "KwaZulu-Natal", "Ballito", -29.5381, 31.2141, 750, "Priya Singh", 83, 0.87, 0.83, 0.85, 0.84],
  ["SHELL013", "Shell Pinetown M13", "KwaZulu-Natal", "Pinetown", -29.8207, 30.8640, 900, "Warren Govender", 26, 0.81, 0.69, 0.73, 0.77],
  ["SHELL014", "Shell Richards Bay Harbour", "KwaZulu-Natal", "Richards Bay", -28.7807, 32.0383, 850, "Nokuthula Zungu", 49, 0.74, 0.70, 0.68, 0.71],
  ["SHELL015", "Shell Cape Town Waterfront", "Western Cape", "Cape Town", -33.9068, 18.4208, 750, "Megan Jacobs", 171, 0.97, 0.92, 0.94, 0.95],
  ["SHELL016", "Shell Stellenbosch", "Western Cape", "Stellenbosch", -33.9367, 18.8602, 700, "Ruan de Klerk", 101, 0.92, 0.84, 0.90, 0.89],
  ["SHELL017", "Shell Bellville N1", "Western Cape", "Bellville", -33.8925, 18.6294, 850, "Chantelle Williams", 67, 0.80, 0.75, 0.77, 0.73],
  ["SHELL018", "Shell George Garden Route", "Western Cape", "George", -33.9648, 22.4590, 850, "Johan Engelbrecht", 94, 0.88, 0.82, 0.86, 0.87],
  ["SHELL019", "Shell Paarl Main Road", "Western Cape", "Paarl", -33.7342, 18.9621, 750, "Farah Davids", 37, 0.79, 0.66, 0.72, 0.76],
  ["SHELL020", "Shell Worcester N1", "Western Cape", "Worcester", -33.6457, 19.4485, 900, "Hennie Meyer", 24, 0.69, 0.62, 0.67, 0.65],
  ["SHELL021", "Shell Gqeberha Beachfront", "Eastern Cape", "Gqeberha", -33.9821, 25.6560, 800, "Luvo Mbeki", 97, 0.87, 0.80, 0.85, 0.82],
  ["SHELL022", "Shell East London Hemingways", "Eastern Cape", "East London", -32.9831, 27.9011, 800, "Yolisa Ndlovu", 64, 0.77, 0.74, 0.79, 0.72],
  ["SHELL023", "Shell Mthatha Plaza", "Eastern Cape", "Mthatha", -31.5889, 28.7844, 850, "Zanele Mfono", 28, 0.71, 0.63, 0.66, 0.68],
  ["SHELL024", "Shell Queenstown N6", "Eastern Cape", "Komani", -31.8976, 26.8753, 850, "Akhona Vena", 35, 0.75, 0.70, 0.73, 0.69],
  ["SHELL025", "Shell Bloemfontein Nelson Mandela", "Free State", "Bloemfontein", -29.1165, 26.2144, 750, "Kabelo Moloi", 86, 0.84, 0.78, 0.82, 0.80],
  ["SHELL026", "Shell Welkom Goldfields", "Free State", "Welkom", -27.9854, 26.7351, 850, "Rene Coetzee", 44, 0.72, 0.68, 0.71, 0.66],
  ["SHELL027", "Shell Bethlehem N5", "Free State", "Bethlehem", -28.2308, 28.3071, 850, "Mpho Radebe", 22, 0.80, 0.73, 0.75, 0.78],
  ["SHELL028", "Shell Kimberley Diamond", "Northern Cape", "Kimberley", -28.7383, 24.7639, 800, "Anika September", 59, 0.81, 0.76, 0.78, 0.77],
  ["SHELL029", "Shell Upington Kalahari", "Northern Cape", "Upington", -28.4478, 21.2561, 900, "Dawid Visser", 31, 0.73, 0.69, 0.70, 0.72],
  ["SHELL030", "Shell Springbok N7", "Northern Cape", "Springbok", -29.6650, 17.8860, 900, "Leigh Fortuin", 18, 0.68, 0.61, 0.65, 0.63],
  ["SHELL031", "Shell Polokwane Gateway", "Limpopo", "Polokwane", -23.9045, 29.4689, 800, "Rendani Mudau", 92, 0.86, 0.83, 0.84, 0.81],
  ["SHELL032", "Shell Tzaneen Junction", "Limpopo", "Tzaneen", -23.8332, 30.1635, 850, "Kgabo Matlala", 47, 0.78, 0.72, 0.76, 0.74],
  ["SHELL033", "Shell Thohoyandou", "Limpopo", "Thohoyandou", -22.9456, 30.4840, 900, "Azwinndini Ramabulana", 29, 0.70, 0.64, 0.69, 0.67],
  ["SHELL034", "Shell Nelspruit Riverside", "Mpumalanga", "Mbombela", -25.4658, 30.9853, 750, "Nandi Khoza", 105, 0.89, 0.85, 0.88, 0.86],
  ["SHELL035", "Shell Witbank Highveld", "Mpumalanga", "Emalahleni", -25.8770, 29.2330, 850, "Francois Steyn", 53, 0.75, 0.71, 0.73, 0.69],
  ["SHELL036", "Shell Secunda Energy", "Mpumalanga", "Secunda", -26.5155, 29.1903, 850, "Themba Mahlangu", 39, 0.80, 0.77, 0.79, 0.76],
  ["SHELL037", "Shell Rustenburg Platinum", "North West", "Rustenburg", -25.6676, 27.2421, 850, "Karabo Molefe", 71, 0.82, 0.75, 0.80, 0.78],
  ["SHELL038", "Shell Potchefstroom Campus", "North West", "Potchefstroom", -26.7145, 27.0960, 750, "Elri Pretorius", 46, 0.79, 0.74, 0.76, 0.75],
  ["SHELL039", "Shell Mahikeng Central", "North West", "Mahikeng", -25.8636, 25.6420, 850, "Oarabile Setlhodi", 27, 0.69, 0.62, 0.68, 0.66],
  ["SHELL040", "Shell Klerksdorp N12", "North West", "Klerksdorp", -26.8664, 26.6696, 850, "Louis Kruger", 57, 0.76, 0.70, 0.74, 0.71],
  ["SHELL041", "Shell Vanderbijlpark Vaal", "Gauteng", "Vanderbijlpark", -26.7117, 27.8379, 850, "Neo Mokoena", 65, 0.83, 0.78, 0.81, 0.79],
  ["SHELL042", "Shell Mossel Bay Harbour", "Western Cape", "Mossel Bay", -34.1831, 22.1460, 800, "Bianca Smit", 33, 0.85, 0.81, 0.83, 0.82]
];

const seededResponses = [
  {
    response_id: "MOCK-GEO-001",
    timestamp: "2026-05-13T07:42:00.000Z",
    branch_id: null,
    latitude: null,
    longitude: null,
    location_permission_status: "Denied",
    nearest_branch_id: null,
    nearest_branch_distance_m: null,
    mapping_status: "Unmapped - Permission Denied",
    coffee_quality_yes: false,
    speed_yes: true,
    staff_service_yes: true,
    cleanliness_yes: false,
    optional_comment: "I did not want to share my location, but the coffee station needed cleaning.",
    is_mock_data: true
  },
  {
    response_id: "MOCK-GEO-002",
    timestamp: "2026-05-13T08:18:00.000Z",
    branch_id: null,
    latitude: null,
    longitude: null,
    location_permission_status: "Timed Out",
    nearest_branch_id: null,
    nearest_branch_distance_m: null,
    mapping_status: "Unmapped - Location Error",
    coffee_quality_yes: true,
    speed_yes: false,
    staff_service_yes: true,
    cleanliness_yes: true,
    optional_comment: "The page could not get my location before timing out. Service was slow.",
    is_mock_data: true
  },
  {
    response_id: "MOCK-GEO-003",
    timestamp: "2026-05-13T09:04:00.000Z",
    branch_id: null,
    latitude: null,
    longitude: null,
    location_permission_status: "Unavailable",
    nearest_branch_id: null,
    nearest_branch_distance_m: null,
    mapping_status: "Unmapped - Location Error",
    coffee_quality_yes: false,
    speed_yes: false,
    staff_service_yes: true,
    cleanliness_yes: false,
    optional_comment: "Location was unavailable on my device. Coffee tasted weak and the counter was messy.",
    is_mock_data: true
  },
  {
    response_id: "MOCK-GEO-004",
    timestamp: "2026-05-13T10:36:00.000Z",
    branch_id: null,
    latitude: -26.0802,
    longitude: 28.0864,
    location_permission_status: "Allowed",
    nearest_branch_id: "SHELL006",
    nearest_branch_distance_m: 4175,
    mapping_status: "Unmapped - Outside Branch Radius",
    coffee_quality_yes: true,
    speed_yes: false,
    staff_service_yes: false,
    cleanliness_yes: true,
    optional_comment: "I was too far away from the branch geofence when I submitted, but the queue had been long.",
    is_mock_data: true
  },
  {
    response_id: "MOCK-GEO-005",
    timestamp: "2026-05-13T11:12:00.000Z",
    branch_id: null,
    latitude: -33.9209,
    longitude: 18.4451,
    location_permission_status: "Allowed",
    nearest_branch_id: "SHELL015",
    nearest_branch_distance_m: 2820,
    mapping_status: "Unmapped - Outside Branch Radius",
    coffee_quality_yes: false,
    speed_yes: true,
    staff_service_yes: false,
    cleanliness_yes: true,
    optional_comment: "Submitted after leaving the area, so it could not be confidently tied to the branch.",
    is_mock_data: true
  },
  {
    response_id: "MOCK-GEO-006",
    timestamp: "2026-05-13T12:05:00.000Z",
    branch_id: "SHELL010",
    latitude: -29.7241,
    longitude: 31.0656,
    location_permission_status: "Allowed",
    nearest_branch_id: "SHELL010",
    nearest_branch_distance_m: 112,
    mapping_status: "Mapped",
    coffee_quality_yes: true,
    speed_yes: true,
    staff_service_yes: true,
    cleanliness_yes: true,
    optional_comment: "Mapped mock response: clean area and quick service.",
    is_mock_data: true
  }
];

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value) {
  return Math.round(value * 1000) / 10;
}

function formatPercent(value) {
  return `${roundScore(value)}%`;
}

function formatMeters(value) {
  if (value == null) return "Not available";
  return value >= 1000 ? `${(value / 1000).toFixed(2)} km` : `${Math.round(value)} m`;
}

function getOverall(branch) {
  return (
    branch.coffee_quality_score +
    branch.speed_score +
    branch.staff_service_score +
    branch.cleanliness_score
  ) / 4;
}

function getStatus(overall) {
  if (overall >= 0.9) return "Excellent";
  if (overall >= 0.8) return "Healthy";
  if (overall >= 0.7) return "Watchlist";
  return "Intervention Required";
}

function getStatusClass(status) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function getCriticalCategories(branch) {
  return CATEGORIES.slice(0, 4)
    .filter((category) => branch[category.key] < 0.65)
    .map((category) => category.label);
}

function seededTrend(seed, base) {
  return Array.from({ length: 6 }, (_, index) => {
    const wave = Math.sin(seed * 1.7 + index * 0.85) * 0.035;
    const drift = (index - 2.5) * 0.006;
    return clamp(base + wave + drift, 0.48, 0.99);
  });
}

// Haversine distance calculation. It converts latitude/longitude into radians and
// estimates the great-circle distance between two points on Earth in metres.
function haversineDistanceMeters(fromLat, fromLng, toLat, toLng) {
  const earthRadiusM = 6371000;
  const toRad = (degrees) => (degrees * Math.PI) / 180;
  const dLat = toRad(toLat - fromLat);
  const dLng = toRad(toLng - fromLng);
  const lat1 = toRad(fromLat);
  const lat2 = toRad(toLat);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusM * c;
}

function getBaseBranchObjects() {
  return baseBranches.map((item, index) => {
    const [
      branch_id,
      branch_name,
      region,
      city,
      latitude,
      longitude,
      geofence_radius_m,
      manager_name,
      monthly_response_count,
      coffee,
      speed,
      staff,
      clean
    ] = item;
    const branch = {
      branch_id,
      branch_name,
      region,
      city,
      latitude,
      longitude,
      geofence_radius_m,
      manager_name,
      monthly_response_count,
      mapped_response_count: monthly_response_count,
      coffee_quality_score: coffee,
      speed_score: speed,
      staff_service_score: staff,
      cleanliness_score: clean,
      time_of_day: {
        morning: clamp(coffee - 0.01 + ((index % 4) - 1.5) * 0.008),
        midday: clamp(speed + ((index % 5) - 2) * 0.01),
        afternoon: clamp(staff - 0.015 + ((index % 3) - 1) * 0.012),
        evening: clamp(clean - 0.02 + ((index % 6) - 2.5) * 0.006)
      },
      recent_trend: seededTrend(index + 1, (coffee + speed + staff + clean) / 4),
      comments: negativeCommentExamples.slice(index % 4, (index % 4) + 3)
    };
    branch.overall_score = getOverall(branch);
    return branch;
  });
}

// Branch assignment logic. The nearest Shell branch is found first; the response
// is mapped only if the distance is inside that branch's own geofence radius.
function mapCoordinatesToNearestBranch(latitude, longitude, branches) {
  const nearest = branches
    .map((branch) => ({
      branch,
      distance_m: haversineDistanceMeters(latitude, longitude, branch.latitude, branch.longitude)
    }))
    .sort((a, b) => a.distance_m - b.distance_m)[0];

  if (!nearest) {
    return {
      branch_id: null,
      nearest_branch_id: null,
      nearest_branch_distance_m: null,
      mapping_status: "Unmapped - Location Error"
    };
  }

  const insideRadius = nearest.distance_m <= nearest.branch.geofence_radius_m;
  return {
    branch_id: insideRadius ? nearest.branch.branch_id : null,
    nearest_branch_id: nearest.branch.branch_id,
    nearest_branch_distance_m: nearest.distance_m,
    mapping_status: insideRadius ? "Mapped" : "Unmapped - Outside Branch Radius"
  };
}

function createResponse({ answers, comment, locationResult }) {
  return {
    response_id: `RESP-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    branch_id: locationResult.branch_id,
    latitude: locationResult.latitude,
    longitude: locationResult.longitude,
    location_permission_status: locationResult.location_permission_status,
    nearest_branch_id: locationResult.nearest_branch_id,
    nearest_branch_distance_m: locationResult.nearest_branch_distance_m,
    mapping_status: locationResult.mapping_status,
    coffee_quality_yes: answers.coffee_quality_yes,
    speed_yes: answers.speed_yes,
    staff_service_yes: answers.staff_service_yes,
    cleanliness_yes: answers.cleanliness_yes,
    optional_comment: comment || "",
    is_test_mode: Boolean(locationResult.is_test_mode)
  };
}

function makeBranches(extraResponses = []) {
  const byId = new Map(getBaseBranchObjects().map((branch) => [branch.branch_id, { ...branch }]));

  // Branch scores use mapped responses only. Unmapped feedback is retained for review
  // but never blended into branch-level operational scoring.
  extraResponses
    .filter((response) => response.mapping_status === "Mapped" && response.branch_id)
    .forEach((response) => {
      const branch = byId.get(response.branch_id);
      if (!branch) return;
      const previousCount = branch.monthly_response_count;
      const nextCount = previousCount + 1;
      CATEGORIES.slice(0, 4).forEach((category) => {
        const yesValue = response[category.responseKey] ? 1 : 0;
        branch[category.key] = (branch[category.key] * previousCount + yesValue) / nextCount;
      });
      branch.monthly_response_count = nextCount;
      branch.mapped_response_count = nextCount;
      branch.overall_score = getOverall(branch);
      if (response.optional_comment) {
        branch.comments = [response.optional_comment, ...branch.comments].slice(0, 5);
      }
    });

  return [...byId.values()].map((branch) => ({
    ...branch,
    status: getStatus(branch.overall_score),
    low_confidence: branch.monthly_response_count < 30,
    critical_categories: getCriticalCategories(branch)
  }));
}

function percentile(values, p) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[index];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function getOutlierStats(branches) {
  // Box-and-whisker outlier logic remains in the data layer even though the visible
  // box/whisker overlay has been removed from the chart.
  return CATEGORIES.reduce((acc, category) => {
    const values = branches.map((branch) => branch[category.key]);
    const q1 = percentile(values, 0.25);
    const q3 = percentile(values, 0.75);
    const iqr = q3 - q1;
    acc[category.key] = {
      lowerFence: q1 - 1.5 * iqr,
      upperFence: q3 + 1.5 * iqr
    };
    return acc;
  }, {});
}

function getBranchIssue(branch) {
  const weakCategories = CATEGORIES.slice(0, 4)
    .filter((category) => branch[category.key] < 0.75)
    .sort((a, b) => branch[a.key] - branch[b.key])
    .map((category) => category.short);
  if (branch.status === "Intervention Required") return "Intervention threshold breached";
  if (branch.critical_categories.length) return `Critical: ${branch.critical_categories.join(", ")}`;
  if (branch.low_confidence) return "Low confidence sample";
  if (weakCategories.length) return `Watch ${weakCategories.slice(0, 2).join(" and ")}`;
  return "No major flags";
}

function getMappingSummary(responses, branches) {
  const baselineMapped = getBaseBranchObjects().reduce((sum, branch) => sum + branch.mapped_response_count, 0);
  const submittedTotal = responses.length;
  const submittedMapped = responses.filter((response) => response.mapping_status === "Mapped").length;
  const permissionDenied = responses.filter((response) => response.location_permission_status === "Denied").length;
  const locationErrors = responses.filter((response) =>
    ["Unavailable", "Timed Out"].includes(response.location_permission_status)
  ).length;
  const outsideRadius = responses.filter((response) => response.mapping_status === "Unmapped - Outside Branch Radius").length;
  const unmapped = responses.filter((response) => response.mapping_status !== "Mapped").length;
  const totalResponses = baselineMapped + submittedTotal;
  const mappedResponses = baselineMapped + submittedMapped;
  return {
    totalResponses,
    mappedResponses,
    unmappedResponses: unmapped,
    permissionDenied,
    locationErrors,
    outsideRadius,
    mappingRate: totalResponses ? mappedResponses / totalResponses : 0
  };
}

function getShellSaSummary(branches, mappingSummary) {
  const categoryAverages = CATEGORIES.slice(0, 4).map((category) => ({
    ...category,
    average: branches.reduce((sum, branch) => sum + branch[category.key], 0) / branches.length
  }));
  const averageOverall = branches.reduce((sum, branch) => sum + branch.overall_score, 0) / branches.length;
  return {
    overall: averageOverall,
    totalResponses: mappingSummary.totalResponses,
    bestCategory: [...categoryAverages].sort((a, b) => b.average - a.average)[0],
    worstCategory: [...categoryAverages].sort((a, b) => a.average - b.average)[0],
    belowThreshold: branches.filter((branch) => branch.overall_score < 0.8).length
  };
}

function ShellMark() {
  return (
    <div className="shell-mark" aria-label="Shell">
      <span />
    </div>
  );
}

function Badge({ status, children }) {
  return <span className={`badge ${status ? getStatusClass(status) : ""}`}>{children ?? status}</span>;
}

function RealQrCode({ value }) {
  const [svg, setSvg] = useState("");

  React.useEffect(() => {
    let active = true;
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: 172,
      color: {
        dark: "#15171a",
        light: "#ffffff"
      }
    }).then((nextSvg) => {
      if (active) setSvg(nextSvg);
    });
    return () => {
      active = false;
    };
  }, [value]);

  return (
    <div
      className="qr-real"
      title={value}
      aria-label={`QR code for ${value}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

function MetricCard({ icon: Icon, label, value, tone, detail, tooltip }) {
  return (
    <article className={`metric-card ${tone || ""}`} title={tooltip || ""} tabIndex={tooltip ? 0 : undefined}>
      <div className="metric-icon">{Icon ? <Icon size={19} /> : null}</div>
      <div>
        <p>
          {label}
          {tooltip ? <span className="help-dot" aria-label={tooltip}>?</span> : null}
        </p>
        <strong>{value}</strong>
        {detail ? <span>{detail}</span> : null}
        {tooltip ? <em className="metric-tooltip">{tooltip}</em> : null}
      </div>
    </article>
  );
}

function Filters({ filters, setFilters, branches }) {
  const regions = ["All", ...new Set(branches.map((branch) => branch.region))];
  const statuses = ["All", "Excellent", "Healthy", "Watchlist", "Intervention Required"];
  const mappingFilters = ["All", "Mapped only", "Unmapped only", "Permission denied", "Outside branch radius"];

  return (
    <section className="filters band geotag-filters">
      <div className="filter-title">
        <Filter size={18} />
        <span>Filters</span>
      </div>
      <label>
        Feedback mapping
        <select value={filters.mapping} onChange={(event) => setFilters({ ...filters, mapping: event.target.value })}>
          {mappingFilters.map((filter) => <option key={filter}>{filter}</option>)}
        </select>
      </label>
      <label>
        Region
        <select value={filters.region} onChange={(event) => setFilters({ ...filters, region: event.target.value })}>
          {regions.map((region) => <option key={region}>{region}</option>)}
        </select>
      </label>
      <label>
        Branch status
        <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
          {statuses.map((status) => <option key={status}>{status}</option>)}
        </select>
      </label>
      <label>
        Min mapped responses
        <input
          type="number"
          min="0"
          value={filters.minResponses}
          onChange={(event) => setFilters({ ...filters, minResponses: Number(event.target.value) || 0 })}
        />
      </label>
    </section>
  );
}

function ExecutiveSummary({ branches }) {
  const totals = useMemo(() => {
    const totalResponses = branches.reduce((sum, branch) => sum + branch.monthly_response_count, 0);
    const averageOverall = branches.reduce((sum, branch) => sum + branch.overall_score, 0) / branches.length;
    const categoryAverages = CATEGORIES.slice(0, 4).map((category) => ({
      ...category,
      average: branches.reduce((sum, branch) => sum + branch[category.key], 0) / branches.length
    }));
    const worst = [...categoryAverages].sort((a, b) => a.average - b.average)[0];
    const best = [...categoryAverages].sort((a, b) => b.average - a.average)[0];
    return {
      totalResponses,
      averageOverall,
      belowThreshold: branches.filter((branch) => branch.overall_score < 0.8).length,
      lowConfidence: branches.filter((branch) => branch.low_confidence).length,
      worst,
      best
    };
  }, [branches]);

  return (
    <section className="summary-grid">
      <MetricCard icon={Users} label="Mapped branch responses" value={totals.totalResponses.toLocaleString()} detail="branch scores only" />
      <MetricCard icon={MapPin} label="Active branches" value={branches.length} detail="South Africa" />
      <MetricCard icon={Gauge} label="Average overall" value={formatPercent(totals.averageOverall)} tone="gold" />
      <MetricCard icon={AlertTriangle} label="Below threshold" value={totals.belowThreshold} tone="red" detail="below 80%" />
      <MetricCard icon={MessageSquareWarning} label="Low confidence" value={totals.lowConfidence} detail="< 30 mapped responses" />
      <MetricCard icon={TrendingDown} label="Worst category" value={totals.worst.label} detail={formatPercent(totals.worst.average)} />
      <MetricCard icon={TrendingUp} label="Best category" value={totals.best.label} detail={formatPercent(totals.best.average)} tone="green" />
    </section>
  );
}

function MappingQuality({ summary }) {
  return (
    <section className="summary-grid mapping-grid">
      <MetricCard
        icon={Users}
        label="Total responses"
        value={summary.totalResponses.toLocaleString()}
        detail="mapped baseline + new"
        tooltip="All feedback records represented in the prototype: seeded branch totals plus new submitted survey responses."
      />
      <MetricCard
        icon={LocateFixed}
        label="Mapped responses"
        value={summary.mappedResponses.toLocaleString()}
        tone="green"
        tooltip="Responses assigned to a Shell branch because GPS was allowed and the customer was inside that branch's geofence radius."
      />
      <MetricCard
        icon={AlertTriangle}
        label="Unmapped responses"
        value={summary.unmappedResponses}
        tone="red"
        tooltip="Submitted feedback that was saved but not assigned to a branch. These comments are reviewed separately and excluded from branch scoring."
      />
      <MetricCard
        icon={X}
        label="Permission denied"
        value={summary.permissionDenied}
        tooltip="Responses where the customer declined browser location permission after clicking Submit."
      />
      <MetricCard
        icon={MessageSquareWarning}
        label="Location errors"
        value={summary.locationErrors}
        tooltip="Responses where location could not be captured because GPS was unavailable, blocked by the device, or timed out."
      />
      <MetricCard
        icon={Navigation}
        label="Outside radius"
        value={summary.outsideRadius}
        tooltip="Responses where GPS was captured, but the nearest Shell branch was farther away than its configured geofence radius."
      />
      <MetricCard
        icon={Gauge}
        label="Mapping rate"
        value={formatPercent(summary.mappingRate)}
        tone="gold"
        tooltip="Mapped responses divided by total responses. A higher rate means more feedback can be confidently used in branch-level scoring."
      />
    </section>
  );
}

function ExecutiveTakeaway({ branches, mappingSummary, activeMapping, setMapping }) {
  const shellSa = getShellSaSummary(branches, mappingSummary);
  const quickFilters = ["All", "Mapped only", "Unmapped only"];
  const satisfactionTone = shellSa.overall >= 0.8 ? "green" : shellSa.overall >= 0.7 ? "amber" : "red";

  return (
    <section className="exec-takeaway panel">
      <div className="exec-main">
        <div>
          <p className="eyebrow">Executive Summary</p>
          <h2>Shell SA coffee satisfaction is {formatPercent(shellSa.overall)}</h2>
          <p>
            Best category is <strong>{shellSa.bestCategory.label}</strong> at {formatPercent(shellSa.bestCategory.average)}.
            Worst category is <strong>{shellSa.worstCategory.label}</strong> at {formatPercent(shellSa.worstCategory.average)}.
          </p>
        </div>
      </div>
      <div className="exec-metrics">
        <MetricCard icon={Gauge} label="Overall satisfaction" value={formatPercent(shellSa.overall)} tone={`satisfaction-${satisfactionTone}`} detail="Shell SA" />
        <MetricCard icon={TrendingDown} label="Worst category" value={shellSa.worstCategory.label} detail={formatPercent(shellSa.worstCategory.average)} />
        <MetricCard icon={TrendingUp} label="Best category" value={shellSa.bestCategory.label} tone="green" detail={formatPercent(shellSa.bestCategory.average)} />
        <MetricCard icon={Users} label="Total responses" value={shellSa.totalResponses.toLocaleString()} detail={`${mappingSummary.unmappedResponses} unmapped`} />
      </div>
      <div className="quick-filter-row" aria-label="Mapped versus unmapped quick filter">
        <span>View</span>
        {quickFilters.map((filter) => (
          <button
            key={filter}
            className={activeMapping === filter ? "active" : ""}
            onClick={() => setMapping(filter)}
          >
            {filter}
          </button>
        ))}
      </div>
    </section>
  );
}

function Leaderboard({ branches, onSelectBranch }) {
  const top = [...branches].sort((a, b) => b.overall_score - a.overall_score).slice(0, 5);
  const bottom = [...branches].sort((a, b) => a.overall_score - b.overall_score).slice(0, 5);

  const Row = ({ branch, rank }) => (
    <button className="leader-row" onClick={() => onSelectBranch(branch)}>
      <span className="rank">{rank}</span>
      <span>
        <strong>{branch.branch_name}</strong>
        <small>{branch.city}, {branch.region} · {branch.manager_name}</small>
      </span>
      <span className="leader-issue">{getBranchIssue(branch)}</span>
      <Badge status={branch.status}>{formatPercent(branch.overall_score)}</Badge>
    </button>
  );

  return (
    <section className="two-col">
      <div className="panel">
        <header className="panel-header">
          <div>
            <h2>Top 5 Branches</h2>
            <p>Best overall mapped-response scores</p>
          </div>
          <Star size={20} />
        </header>
        {top.map((branch, index) => <Row key={branch.branch_id} branch={branch} rank={index + 1} />)}
      </div>
      <div className="panel">
        <header className="panel-header">
          <div>
            <h2>Bottom 5 Branches</h2>
            <p>Priority operational attention</p>
          </div>
          <AlertTriangle size={20} />
        </header>
        {bottom.map((branch, index) => <Row key={branch.branch_id} branch={branch} rank={index + 1} />)}
      </div>
    </section>
  );
}

function CategoryPlot({ branches, onSelectBranch }) {
  const stats = getOutlierStats(branches);
  const [hovered, setHovered] = useState(null);
  const width = 920;
  const height = 430;
  const pad = { top: 26, right: 42, bottom: 70, left: 54 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;
  const xFor = (categoryIndex) => pad.left + (chartW / (CATEGORIES.length - 1)) * categoryIndex;
  const yFor = (score) => pad.top + chartH - score * chartH;

  return (
    <section className="panel plot-panel">
      <header className="panel-header">
        <div>
          <h2>Category Performance Dot Plot</h2>
          <p>Branch scores use mapped responses only; stars and crosses come from outlier logic</p>
        </div>
        <BarChart3 size={21} />
      </header>
      <div className="plot-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Category score distribution by branch">
          {[0, 0.25, 0.5, 0.65, 0.8, 0.9, 1].map((tick) => (
            <g key={tick}>
              <line x1={pad.left} x2={width - pad.right} y1={yFor(tick)} y2={yFor(tick)} className="grid-line" />
              <text x={pad.left - 12} y={yFor(tick) + 4} textAnchor="end" className="axis-text">{Math.round(tick * 100)}%</text>
            </g>
          ))}
          <line x1={pad.left} x2={width - pad.right} y1={yFor(0.8)} y2={yFor(0.8)} className="threshold-line" />
          {CATEGORIES.map((category, categoryIndex) => (
            <text key={category.key} x={xFor(categoryIndex)} y={height - 28} textAnchor="middle" className="axis-label">
              {category.short}
            </text>
          ))}
          {branches.flatMap((branch, branchIndex) =>
            CATEGORIES.map((category, categoryIndex) => {
              const stat = stats[category.key];
              const score = branch[category.key];
              const outlier = score > stat.upperFence ? "top" : score < stat.lowerFence ? "bottom" : "normal";
              const jitter = ((branchIndex % 9) - 4) * 4.2;
              const x = xFor(categoryIndex) + jitter;
              const y = yFor(score);
              const warning = branch.overall_score < 0.8;
              const faded = branch.low_confidence;
              const payload = { branch, category, score, outlier };
              const common = {
                key: `${branch.branch_id}-${category.key}`,
                onMouseEnter: () => setHovered({ ...payload, x, y }),
                onMouseLeave: () => setHovered(null),
                onClick: () => onSelectBranch(branch),
                className: `plot-point ${warning ? "warning" : ""} ${faded ? "low-confidence" : ""}`,
                style: { "--point-color": category.color }
              };
              if (outlier === "top") {
                return (
                  <text {...common} x={x} y={y + 5} textAnchor="middle" fontSize="22" className={`${common.className} star-point`}>
                    ★
                  </text>
                );
              }
              if (outlier === "bottom") {
                return (
                  <g {...common}>
                    <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
                    <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
                  </g>
                );
              }
              return <circle {...common} cx={x} cy={y} r={faded ? 6.5 : 5.5} />;
            })
          )}
        </svg>
        {hovered ? (
          <div className="tooltip" style={{ left: `${Math.min(82, (hovered.x / width) * 100)}%`, top: `${Math.max(8, (hovered.y / height) * 100)}%` }}>
            <strong>{hovered.branch.branch_name}</strong>
            <span>{hovered.branch.region} · {hovered.category.label}</span>
            <span>Score: {formatPercent(hovered.score)}</span>
            <span>Mapped responses: {hovered.branch.monthly_response_count}</span>
            <span>Status: {hovered.branch.status}{hovered.branch.low_confidence ? " · Low confidence" : ""}</span>
          </div>
        ) : null}
      </div>
      <div className="legend-row">
        {CATEGORIES.map((category) => <span key={category.key}><i style={{ background: category.color }} />{category.label}</span>)}
        <span><b className="hollow-dot" />Low volume</span>
        <span><b className="warning-dot" />Below threshold</span>
      </div>
    </section>
  );
}

function RankingTables({ branches }) {
  return (
    <section className="ranking-grid">
      {CATEGORIES.slice(0, 4).map((category) => {
        const sorted = [...branches].sort((a, b) => b[category.key] - a[category.key]);
        const rows = [
          ...sorted.slice(0, 3).map((branch) => ({ branch, type: "Top", action: "Inspect this facility and document best practices." })),
          ...sorted.slice(-3).reverse().map((branch) => ({ branch, type: "Bottom", action: "Apply learnings from top-performing branches and schedule operational review." }))
        ];
        return (
          <div className="panel" key={category.key}>
            <header className="mini-header">
              <h3>{category.label}</h3>
              <span style={{ background: category.color }} />
            </header>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Branch</th>
                    <th>Score</th>
                    <th>Region</th>
                    <th>Mapped responses</th>
                    <th>Suggested action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ branch, type, action }, index) => (
                    <tr key={`${category.key}-${branch.branch_id}-${type}`}>
                      <td><Badge>{type} {type === "Top" ? index + 1 : index - 2}</Badge></td>
                      <td>{branch.branch_name}</td>
                      <td><strong>{formatPercent(branch[category.key])}</strong></td>
                      <td>{branch.region}</td>
                      <td>{branch.monthly_response_count}</td>
                      <td>{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function QrDemoPage() {
  const surveyLink = `${window.location.origin}${window.location.pathname}?view=survey`;

  return (
    <main className="qr-demo-page">
      <section className="qr-demo-hero">
        <div>
          <ShellMark />
          <p className="eyebrow">Cup scan concept</p>
          <h1>Shell Coffee Survey QR</h1>
          <p>This separate demo link shows how a customer could scan a QR code printed on a Shell coffee cup and open the generic survey.</p>
          <div className="generic-link qr-demo-link">
            <span>{surveyLink}</span>
            <a className="primary-button" href="?view=survey">Open Survey</a>
          </div>
        </div>
        <div className="cup-mockup" role="img" aria-label="Shell coffee cup with scannable survey QR code">
          <div className="cup-lid" />
          <div className="cup-body">
            <ShellMark />
            <strong>Shell Coffee</strong>
            <span>Scan to rate your coffee</span>
            <div className="cup-qr">
              <RealQrCode value={surveyLink} />
            </div>
          </div>
          <div className="cup-shadow" />
        </div>
      </section>
    </main>
  );
}

function UnmappedFeedback({ responses, branches, mappingFilter }) {
  const branchById = new Map(branches.map((branch) => [branch.branch_id, branch]));
  const unmapped = responses.filter((response) => {
    if (mappingFilter === "Mapped only") return false;
    if (mappingFilter === "Permission denied") return response.location_permission_status === "Denied";
    if (mappingFilter === "Outside branch radius") return response.mapping_status === "Unmapped - Outside Branch Radius";
    return response.mapping_status !== "Mapped";
  });

  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>Unmapped Feedback</h2>
          <p>Retained for comments and sentiment, but excluded from branch scores</p>
        </div>
        <MessageSquareWarning size={21} />
      </header>
      {unmapped.length ? (
        <div className="unmapped-list">
          {unmapped.map((response) => {
            const nearest = response.nearest_branch_id ? branchById.get(response.nearest_branch_id) : null;
            return (
              <article key={response.response_id}>
                <div>
                  <strong>{response.mapping_status}</strong>
                  <span>{new Date(response.timestamp).toLocaleString()}</span>
                </div>
                <p>{response.optional_comment || "No optional comment supplied."}</p>
                <span>Nearest branch: {nearest ? nearest.branch_name : "Not available"} · {formatMeters(response.nearest_branch_distance_m)}</span>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">No unmapped feedback in the current prototype session.</p>
      )}
    </section>
  );
}

function MonthlyReport({ branches, mappingSummary }) {
  const [open, setOpen] = useState(false);
  const categoryBlocks = CATEGORIES.slice(0, 4).map((category) => {
    const sorted = [...branches].sort((a, b) => b[category.key] - a[category.key]);
    return { category, top: sorted.slice(0, 3), bottom: sorted.slice(-3).reverse() };
  });
  const intervention = branches.filter((branch) => branch.status === "Intervention Required");
  const recommendedInspections = [...new Set(categoryBlocks.flatMap((block) => block.top.map((branch) => branch.branch_name)))].slice(0, 8);

  return (
    <section className="panel report-panel">
      <header className="panel-header">
        <div>
          <h2>Monthly Report</h2>
          <p>Branch rankings are based only on mapped responses</p>
        </div>
        <button className="primary-button" onClick={() => setOpen(!open)}>
          <FileText size={18} />
          Generate Monthly Report
          <ChevronDown size={16} className={open ? "rotate" : ""} />
        </button>
      </header>
      {open ? (
        <div className="report-body">
          <div className="report-summary">
            <p>
              Shell coffee operations captured <strong>{mappingSummary.totalResponses.toLocaleString()}</strong> prototype responses, with a mapping rate of <strong>{formatPercent(mappingSummary.mappingRate)}</strong>.
            </p>
            <p>
              <strong>{mappingSummary.unmappedResponses}</strong> responses are currently unmapped, including <strong>{mappingSummary.permissionDenied}</strong> denied permissions, <strong>{mappingSummary.locationErrors}</strong> location errors, and <strong>{mappingSummary.outsideRadius}</strong> outside-radius responses.
            </p>
            <p>Branch-level rankings, category scores, and intervention thresholds are based only on mapped responses.</p>
          </div>
          <div className="report-columns">
            {categoryBlocks.map((block) => (
              <div key={block.category.key}>
                <h3>{block.category.label}</h3>
                <p><strong>Top 3:</strong> {block.top.map((branch) => branch.branch_name).join(", ")}</p>
                <p><strong>Bottom 3:</strong> {block.bottom.map((branch) => branch.branch_name).join(", ")}</p>
                <p>Inspect {block.top[0].branch_name} and transfer {block.category.label.toLowerCase()} practices to {block.bottom[0].branch_name}.</p>
              </div>
            ))}
          </div>
          <div className="action-list">
            <h3>Recommended inspections</h3>
            <p>{recommendedInspections.join(", ")}</p>
            <h3>Branches requiring intervention</h3>
            <p>{intervention.length ? intervention.map((branch) => branch.branch_name).join(", ") : "None in the filtered view."}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BranchTable({ branches, onSelectBranch }) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div>
          <h2>All Branches</h2>
          <p>Mapped-response operating view</p>
        </div>
        <Search size={20} />
      </header>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Manager</th>
              <th>Region</th>
              <th>Mapped responses</th>
              <th>Coffee</th>
              <th>Speed</th>
              <th>Service</th>
              <th>Cleanliness</th>
              <th>Overall</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((branch) => (
              <tr key={branch.branch_id} onClick={() => onSelectBranch(branch)} className="clickable-row">
                <td><strong>{branch.branch_name}</strong><small>{branch.city}</small></td>
                <td>{branch.manager_name}</td>
                <td>{branch.region}</td>
                <td>{branch.monthly_response_count}{branch.low_confidence ? <span className="muted-tag">low</span> : null}</td>
                <td>{formatPercent(branch.coffee_quality_score)}</td>
                <td>{formatPercent(branch.speed_score)}</td>
                <td>{formatPercent(branch.staff_service_score)}</td>
                <td>{formatPercent(branch.cleanliness_score)}</td>
                <td><strong>{formatPercent(branch.overall_score)}</strong></td>
                <td><Badge status={branch.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BranchModal({ branch, onClose }) {
  if (!branch) return null;
  const weakest = [...CATEGORIES.slice(0, 4)].sort((a, b) => branch[a.key] - branch[b.key])[0];
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-button" onClick={onClose}><X size={18} /></button>
        <header>
          <div>
            <h2>{branch.branch_name}</h2>
            <p>{branch.city}, {branch.region} · {branch.branch_id} · {branch.manager_name}</p>
          </div>
          <Badge status={branch.status} />
        </header>
        <div className="geo-detail">
          <span>Latitude: {branch.latitude.toFixed(5)}</span>
          <span>Longitude: {branch.longitude.toFixed(5)}</span>
          <span>Geofence radius: {branch.geofence_radius_m} m</span>
        </div>
        <div className="drill-grid">
          {CATEGORIES.map((category) => (
            <MetricCard key={category.key} label={category.label} value={formatPercent(branch[category.key])} />
          ))}
        </div>
        <div className="time-grid">
          {Object.entries(branch.time_of_day).map(([part, score]) => (
            <div key={part}>
              <span>{part}</span>
              <strong>{formatPercent(score)}</strong>
              <div className="mini-bar"><i style={{ width: `${score * 100}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="trend">
          <h3>Recent Trend</h3>
          <div className="trend-chart">
            <ResponsiveContainer width="100%" height={76}>
              <LineChart data={branch.recent_trend.map((value, index) => ({ month: index + 1, score: roundScore(value) }))}>
                <YAxis domain={[50, 100]} hide />
                <RechartsTooltip formatter={(value) => [`${value}%`, "Score"]} labelFormatter={(label) => `Month ${label}`} />
                <Line type="monotone" dataKey="score" stroke="#d71920" strokeWidth={4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="comments">
          <h3>Negative Comment Examples</h3>
          {branch.comments.map((comment, index) => <p key={`${comment}-${index}`}>{comment}</p>)}
        </div>
        <div className="recommendation">
          <strong>Recommended action</strong>
          <p>
            Focus first on {weakest.label.toLowerCase()}. {branch.status === "Intervention Required" ? "Schedule an operational review this month and pair the branch with a top performer." : "Monitor the branch and transfer best practices from higher-scoring facilities."}
          </p>
        </div>
      </section>
    </div>
  );
}

function SurveyPage({ branches, onSubmit }) {
  const [answers, setAnswers] = useState(SURVEY_QUESTIONS.reduce((acc, question) => ({ ...acc, [question.key]: true }), {}));
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [useLocationAssist, setUseLocationAssist] = useState(false);
  const [locationResult, setLocationResult] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [testBranchId, setTestBranchId] = useState(branches[0].branch_id);
  const [testPosition, setTestPosition] = useState("inside");
  const hasNo = SURVEY_QUESTIONS.some((question) => answers[question.key] === false);

  function simulatedCoordinates() {
    const branch = branches.find((item) => item.branch_id === testBranchId) || branches[0];
    if (testPosition === "outside") {
      return { latitude: branch.latitude + 0.018, longitude: branch.longitude + 0.018 };
    }
    return { latitude: branch.latitude + 0.0015, longitude: branch.longitude + 0.001 };
  }

  async function requestLocationMapping() {
    if (testMode) {
      const coords = simulatedCoordinates();
      const mapped = mapCoordinatesToNearestBranch(coords.latitude, coords.longitude, branches);
      const result = {
        ...mapped,
        latitude: coords.latitude,
        longitude: coords.longitude,
        location_permission_status: "Allowed",
        is_test_mode: true
      };
      setLocationResult(result);
      if (result.branch_id) {
        setSelectedBranchId(result.branch_id);
        setLocationMessage(`Test coordinates mapped to ${branches.find((branch) => branch.branch_id === result.branch_id)?.branch_name}.`);
      } else {
        setSelectedBranchId("");
        setLocationMessage(`Test coordinates are outside the nearest branch radius (${formatMeters(result.nearest_branch_distance_m)} away).`);
      }
      return result;
    }

    // Location permission flow: the browser prompt is requested only when the
    // customer actively ticks the location checkbox. Every failure path still
    // allows a saved survey response later.
    if (!navigator.geolocation) {
      const result = {
        branch_id: null,
        latitude: null,
        longitude: null,
        location_permission_status: "Unavailable",
        nearest_branch_id: null,
        nearest_branch_distance_m: null,
        mapping_status: "Unmapped - Location Error"
      };
      setLocationResult(result);
      setLocationMessage("Location is unavailable on this browser or device.");
      return result;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const mapped = mapCoordinatesToNearestBranch(latitude, longitude, branches);
          const result = {
            ...mapped,
            latitude,
            longitude,
            location_permission_status: "Allowed"
          };
          setLocationResult(result);
          if (result.branch_id) {
            setSelectedBranchId(result.branch_id);
            setLocationMessage(`Nearest branch selected: ${branches.find((branch) => branch.branch_id === result.branch_id)?.branch_name}.`);
          } else {
            setSelectedBranchId("");
            setLocationMessage(`Location captured, but the nearest branch is ${formatMeters(result.nearest_branch_distance_m)} away and outside its radius.`);
          }
          resolve(result);
        },
        (error) => {
          const timedOut = error.code === error.TIMEOUT;
          const denied = error.code === error.PERMISSION_DENIED;
          const result = {
            branch_id: null,
            latitude: null,
            longitude: null,
            location_permission_status: denied ? "Denied" : timedOut ? "Timed Out" : "Unavailable",
            nearest_branch_id: null,
            nearest_branch_distance_m: null,
            mapping_status: denied ? "Unmapped - Permission Denied" : "Unmapped - Location Error"
          };
          setLocationResult(result);
          setLocationMessage(denied ? "Location permission was denied. You can still submit without branch mapping." : "Location could not be captured. You can still submit without branch mapping.");
          resolve(result);
        },
        { enableHighAccuracy: true, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: 0 }
      );
    });
  }

  async function handleLocationToggle(checked) {
    setUseLocationAssist(checked);
    if (!checked) {
      setLocationResult(null);
      setLocationMessage("");
      return;
    }
    setLocating(true);
    await requestLocationMapping();
    setLocating(false);
  }

  function buildSubmissionLocationResult() {
    if (selectedBranchId) {
      const branch = branches.find((item) => item.branch_id === selectedBranchId);
      return {
        branch_id: selectedBranchId,
        latitude: locationResult?.branch_id === selectedBranchId ? locationResult.latitude : null,
        longitude: locationResult?.branch_id === selectedBranchId ? locationResult.longitude : null,
        location_permission_status: locationResult?.branch_id === selectedBranchId ? locationResult.location_permission_status : "Not Requested",
        nearest_branch_id: locationResult?.nearest_branch_id || selectedBranchId,
        nearest_branch_distance_m: locationResult?.branch_id === selectedBranchId ? locationResult.nearest_branch_distance_m : 0,
        mapping_status: "Mapped",
        selected_branch_name: branch?.branch_name,
        selected_by_customer: locationResult?.branch_id === selectedBranchId ? false : true
      };
    }

    return locationResult || {
      branch_id: null,
      latitude: null,
      longitude: null,
      location_permission_status: "Not Requested",
      nearest_branch_id: null,
      nearest_branch_distance_m: null,
      mapping_status: "Unmapped - Branch Not Selected"
    };
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    const response = createResponse({ answers, comment, locationResult: buildSubmissionLocationResult() });
    onSubmit(response);
    setSubmitted(response);
    setSubmitting(false);
  }

  if (submitted) {
    const mappedBranch = submitted.branch_id ? branches.find((branch) => branch.branch_id === submitted.branch_id) : null;
    return (
      <main className="survey-shell">
        <section className="survey-card thanks">
          <ShellMark />
          <Check size={44} />
          <h1>Thank you</h1>
          <p>
            Your feedback was saved. {mappedBranch ? `It was mapped to ${mappedBranch.branch_name}.` : "It was stored as unmapped feedback."}
          </p>
          <Badge status={mappedBranch?.status}>{submitted.mapping_status}</Badge>
          <a className="primary-button" href="?view=dashboard">Return to dashboard</a>
        </section>
      </main>
    );
  }

  return (
    <main className="survey-shell">
      <form className="survey-card" onSubmit={submit}>
        <ShellMark />
        <p className="eyebrow">Shell coffee experience</p>
        <h1>Tell us about your coffee</h1>
        <p className="survey-location">Select your Shell branch or let us use your location to find the nearest one.</p>
        <section className="branch-select-panel">
          <label>
            Shell branch
            <select value={selectedBranchId} onChange={(event) => setSelectedBranchId(event.target.value)}>
              <option value="">Select branch manually, or leave blank</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name} - {branch.city}
                </option>
              ))}
            </select>
          </label>
          <label className="switch-row location-consent-row">
            <input
              type="checkbox"
              checked={useLocationAssist}
              onChange={(event) => handleLocationToggle(event.target.checked)}
              disabled={locating}
            />
            Use my location to find the nearest Shell branch and auto-select it.
          </label>
          {locating || locationMessage ? <p className="location-status">{locating ? "Requesting location..." : locationMessage}</p> : null}
        </section>
        <div className="question-list">
          {SURVEY_QUESTIONS.map((question) => (
            <div className="question" key={question.key}>
              <span>{question.label}</span>
              <div className="segmented">
                <button type="button" className={answers[question.key] === true ? "active" : ""} onClick={() => setAnswers({ ...answers, [question.key]: true })}>Yes</button>
                <button type="button" className={answers[question.key] === false ? "active no" : ""} onClick={() => setAnswers({ ...answers, [question.key]: false })}>No</button>
              </div>
            </div>
          ))}
        </div>
        <label className={hasNo ? "comment needed" : "comment"}>
          Comment {hasNo ? "recommended" : "optional"}
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder={hasNo ? "Tell us what went wrong so the branch can fix it." : "Anything else Shell should know?"}
          />
        </label>
        <section className="test-mode-panel">
          <label className="switch-row">
            <input type="checkbox" checked={testMode} onChange={(event) => setTestMode(event.target.checked)} />
            Development test mode: simulate coordinates when location checkbox is ticked
          </label>
          {testMode ? (
            <div className="test-controls">
              <label>
                Simulate near branch
                <select value={testBranchId} onChange={(event) => setTestBranchId(event.target.value)}>
                  {branches.map((branch) => <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>)}
                </select>
              </label>
              <label>
                Coordinate scenario
                <select value={testPosition} onChange={(event) => setTestPosition(event.target.value)}>
                  <option value="inside">Inside geofence radius</option>
                  <option value="outside">Outside branch radius</option>
                </select>
              </label>
            </div>
          ) : null}
        </section>
        <p className="location-note">If you do not select a branch or allow location access, your feedback will still be submitted and reviewed as unmapped feedback.</p>
        <button className="submit-button" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Submit feedback"}
        </button>
      </form>
    </main>
  );
}

function Dashboard({ branches, responses, setView, onSelectBranch }) {
  const [filters, setFilters] = useState({ mapping: "All", region: "All", status: "All", minResponses: 0 });
  const mappingSummary = getMappingSummary(responses, branches);
  const showMappedSections = filters.mapping !== "Unmapped only" && filters.mapping !== "Permission denied" && filters.mapping !== "Outside branch radius";
  const showUnmappedSections = filters.mapping !== "Mapped only";
  const filteredBranches = branches.filter((branch) => (
    (filters.region === "All" || branch.region === filters.region) &&
    (filters.status === "All" || branch.status === filters.status) &&
    branch.monthly_response_count >= filters.minResponses
  ));

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div>
            <ShellMark />
            <p className="eyebrow">Internal operations dashboard · Geotagging version</p>
            <h1>Shell Coffee Quality Control</h1>
            <p>Capture survey feedback through a generic link, request GPS only on submit, and map responses to the nearest Shell branch inside its geofence.</p>
          </div>
          <div className="hero-actions">
            <button className="secondary-button" onClick={() => setView("survey")}>
              <Coffee size={18} />
              Preview Survey
            </button>
            <button className="secondary-button" onClick={() => setView("qr")}>
              <QrCode size={18} />
              Cup QR Demo
            </button>
            <a className="primary-button" href="#report">
              <Download size={18} />
              Monthly Report
            </a>
          </div>
        </div>
      </section>
      <div className="app-shell">
        <ExecutiveTakeaway
          branches={branches}
          mappingSummary={mappingSummary}
          activeMapping={filters.mapping}
          setMapping={(mapping) => setFilters({ ...filters, mapping })}
        />
        {showUnmappedSections && filters.mapping !== "All" ? (
          <UnmappedFeedback responses={responses} branches={branches} mappingFilter={filters.mapping} />
        ) : null}
        <Filters filters={filters} setFilters={setFilters} branches={branches} />
        <MappingQuality summary={mappingSummary} />
        {showMappedSections ? (
          <>
            <ExecutiveSummary branches={filteredBranches} />
            <Leaderboard branches={filteredBranches} onSelectBranch={onSelectBranch} />
            <CategoryPlot branches={filteredBranches} onSelectBranch={onSelectBranch} />
            <RankingTables branches={filteredBranches} />
            {filters.mapping === "All" ? <UnmappedFeedback responses={responses} branches={branches} mappingFilter={filters.mapping} /> : null}
            <div id="report">
              <MonthlyReport branches={filteredBranches} mappingSummary={mappingSummary} />
            </div>
            <BranchTable branches={filteredBranches} onSelectBranch={onSelectBranch} />
          </>
        ) : null}
      </div>
    </main>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const requestedView = params.get("view");
  const initialView = requestedView === "survey" || requestedView === "qr" ? requestedView : "dashboard";
  const [view, setView] = useState(initialView);
  const [responses, setResponses] = useState(seededResponses);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const branches = useMemo(() => makeBranches(responses), [responses]);

  function navigate(nextView) {
    const url = nextView === "survey" ? "?view=survey" : nextView === "qr" ? "?view=qr" : "?view=dashboard";
    window.history.pushState({}, "", url);
    setView(nextView);
  }

  return (
    <>
      <nav className="top-nav">
        <a className="brand" href="?view=dashboard" onClick={(event) => { event.preventDefault(); navigate("dashboard"); }}>
          <ShellMark />
          <span>Shell Coffee QC · Geotagging</span>
        </a>
        <div className="nav-tabs">
          <button className={view === "dashboard" ? "active" : ""} onClick={() => navigate("dashboard")}>Dashboard</button>
          <button className={view === "survey" ? "active" : ""} onClick={() => navigate("survey")}>Survey</button>
          <button className={view === "qr" ? "active" : ""} onClick={() => navigate("qr")}>Cup QR</button>
        </div>
      </nav>
      {view === "survey" ? (
        <SurveyPage branches={branches} onSubmit={(response) => setResponses((current) => [response, ...current])} />
      ) : view === "qr" ? (
        <QrDemoPage />
      ) : (
        <Dashboard branches={branches} responses={responses} setView={navigate} onSelectBranch={setSelectedBranch} />
      )}
      <BranchModal branch={selectedBranch} onClose={() => setSelectedBranch(null)} />
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
