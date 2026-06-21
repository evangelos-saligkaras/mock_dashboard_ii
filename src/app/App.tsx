import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  ChevronDown,
  X,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

// ── Species palette ─────────────────────────────────────────────────────────
const SP = {
  asian: { color: "#E25B1B", label: "Asiatische Hornisse" },
  european: { color: "#1A6B8A", label: "Europäische Hornisse" },
  nest: { color: "#7C4DA0", label: "Nest" },
} as const;

type SpeciesKey = keyof typeof SP;

// ── Monthly chart data (illustrative) ───────────────────────────────────────
const MONTHLY_DATA = [
  { m: "Jan", asian: 12, european: 45, nest: 3 },
  { m: "Feb", asian: 18, european: 52, nest: 4 },
  { m: "Mär", asian: 45, european: 78, nest: 8 },
  { m: "Apr", asian: 82, european: 125, nest: 15 },
  { m: "Mai", asian: 128, european: 168, nest: 22 },
  { m: "Jun", asian: 185, european: 195, nest: 31 },
  { m: "Jul", asian: 210, european: 178, nest: 38 },
  { m: "Aug", asian: 195, european: 155, nest: 42 },
  { m: "Sep", asian: 145, european: 132, nest: 35 },
  { m: "Okt", asian: 88, european: 95, nest: 18 },
  { m: "Nov", asian: 32, european: 42, nest: 6 },
  { m: "Dez", asian: 8, european: 18, nest: 1 },
];

// ── State data (illustrative) ────────────────────────────────────────────────
interface StateRow {
  name: string;
  total: number;
  asian: number;
  european: number;
  nest: number;
}

const TOP_STATES: StateRow[] = [
  { name: "Nordrhein-Westfalen", total: 312, asian: 198, european: 95, nest: 19 },
  { name: "Baden-Württemberg", total: 278, asian: 145, european: 108, nest: 25 },
  { name: "Rheinland-Pfalz", total: 189, asian: 122, european: 55, nest: 12 },
  { name: "Hessen", total: 165, asian: 88, european: 68, nest: 9 },
  { name: "Bayern", total: 142, asian: 45, european: 82, nest: 15 },
];

const ALL_STATES: StateRow[] = [
  ...TOP_STATES,
  { name: "Niedersachsen", total: 98, asian: 22, european: 68, nest: 8 },
  { name: "Sachsen", total: 85, asian: 18, european: 58, nest: 9 },
  { name: "Thüringen", total: 72, asian: 12, european: 52, nest: 8 },
  { name: "Brandenburg", total: 65, asian: 8, european: 48, nest: 9 },
  { name: "Sachsen-Anhalt", total: 58, asian: 5, european: 45, nest: 8 },
  { name: "Schleswig-Holstein", total: 45, asian: 2, european: 38, nest: 5 },
  { name: "Mecklenburg-Vorpommern", total: 38, asian: 1, european: 32, nest: 5 },
  { name: "Hamburg", total: 28, asian: 5, european: 20, nest: 3 },
  { name: "Saarland", total: 22, asian: 12, european: 8, nest: 2 },
  { name: "Bremen", total: 15, asian: 2, european: 12, nest: 1 },
  { name: "Berlin", total: 12, asian: 3, european: 8, nest: 1 },
];

// ── Observation points (approximate coords for SVG viewBox 0 0 340 420) ─────
// x = (lon - 5.8) / 9.4 * 300 + 20
// y = (55.1 - lat) / 7.7 * 380 + 20
interface ObsPoint {
  id: number;
  type: SpeciesKey;
  cx: number;
  cy: number;
}

const OBSERVATIONS: ObsPoint[] = [
  // Asian hornets – mainly SW Germany (NRW, RP, BW, Hessen)
  { id: 1, type: "asian", cx: 82, cy: 218 },
  { id: 2, type: "asian", cx: 68, cy: 248 },
  { id: 3, type: "asian", cx: 76, cy: 268 },
  { id: 4, type: "asian", cx: 95, cy: 285 },
  { id: 5, type: "asian", cx: 52, cy: 312 },
  { id: 6, type: "asian", cx: 58, cy: 338 },
  { id: 7, type: "asian", cx: 88, cy: 328 },
  { id: 8, type: "asian", cx: 108, cy: 315 },
  { id: 9, type: "asian", cx: 118, cy: 348 },
  { id: 10, type: "asian", cx: 98, cy: 358 },
  { id: 11, type: "asian", cx: 132, cy: 362 },
  { id: 12, type: "asian", cx: 145, cy: 342 },
  { id: 13, type: "asian", cx: 160, cy: 335 },
  { id: 14, type: "asian", cx: 112, cy: 298 },
  { id: 15, type: "asian", cx: 75, cy: 295 },
  // European hornets – throughout Germany
  { id: 16, type: "european", cx: 155, cy: 92 },
  { id: 17, type: "european", cx: 172, cy: 110 },
  { id: 18, type: "european", cx: 145, cy: 132 },
  { id: 19, type: "european", cx: 115, cy: 155 },
  { id: 20, type: "european", cx: 88, cy: 168 },
  { id: 21, type: "european", cx: 78, cy: 195 },
  { id: 22, type: "european", cx: 95, cy: 228 },
  { id: 23, type: "european", cx: 120, cy: 215 },
  { id: 24, type: "european", cx: 138, cy: 245 },
  { id: 25, type: "european", cx: 155, cy: 262 },
  { id: 26, type: "european", cx: 175, cy: 238 },
  { id: 27, type: "european", cx: 192, cy: 220 },
  { id: 28, type: "european", cx: 215, cy: 200 },
  { id: 29, type: "european", cx: 238, cy: 225 },
  { id: 30, type: "european", cx: 205, cy: 168 },
  { id: 31, type: "european", cx: 222, cy: 152 },
  { id: 32, type: "european", cx: 248, cy: 165 },
  { id: 33, type: "european", cx: 265, cy: 138 },
  { id: 34, type: "european", cx: 172, cy: 308 },
  { id: 35, type: "european", cx: 198, cy: 335 },
  { id: 36, type: "european", cx: 225, cy: 315 },
  { id: 37, type: "european", cx: 252, cy: 295 },
  // Nests
  { id: 38, type: "nest", cx: 85, cy: 278 },
  { id: 39, type: "nest", cx: 125, cy: 348 },
  { id: 40, type: "nest", cx: 100, cy: 308 },
  { id: 41, type: "nest", cx: 145, cy: 265 },
  { id: 42, type: "nest", cx: 175, cy: 252 },
];

const REGIONS = [
  "Nordrhein-Westfalen",
  "Baden-Württemberg",
  "Rheinland-Pfalz",
  "Hessen",
  "Bayern",
  "Sachsen",
  "Thüringen",
];

// ── Germany SVG path (simplified but geographically recognizable) ────────────
// Clockwise from Flensburg. Based on real lat/lon coordinates scaled to viewBox.
const GERMANY_PATH =
  "M133,36 Q103,22 80,30 L62,48 L45,75 L30,112 L22,148 L20,185 L18,232 L24,272 L38,312 L48,342 L68,368 L86,385 Q108,395 132,390 Q158,388 185,398 Q220,398 255,378 L272,348 L292,312 L312,270 L318,228 L315,198 L306,162 L293,126 L276,88 L255,68 Q228,52 200,45 Q168,40 152,32 Z";

// State boundary lines (simplified internal divisions, approximate)
const STATE_LINES = [
  // Schleswig-Holstein / Mecklenburg-Vorpommern horizontal boundary (~54.1°N)
  "M 108,80 L 155,75 L 215,76 L 258,82",
  // Hamburg city-state outline
  "M 148,78 L 170,78 L 170,102 L 148,102 Z",
  // Bremen
  "M 82,130 L 98,128 L 100,148 L 82,150 Z",
  // Niedersachsen / NRW boundary start
  "M 108,80 L 110,155 L 118,192",
  // NRW east boundary
  "M 118,155 L 115,232 L 108,278 L 102,308",
  // Hessen west boundary
  "M 102,218 L 128,212 L 145,252 L 148,295 L 145,318",
  // Brandenburg polygon (approximate)
  "M 168,85 L 215,92 L 242,110 L 265,140 L 270,170 L 258,235 L 222,220 L 195,228 L 172,212 L 168,168 L 172,128 Z",
  // Sachsen
  "M 222,220 L 252,232 L 270,272 L 248,288 L 218,275 L 195,228 Z",
  // Thüringen
  "M 148,212 L 172,205 L 195,228 L 195,268 L 172,278 L 148,265 L 145,252 Z",
  // Sachsen-Anhalt
  "M 168,128 L 195,138 L 220,148 L 222,220 L 195,228 L 172,212 L 168,168 Z",
  // Bayern / Baden-Württemberg boundary
  "M 145,318 L 170,325 L 190,328 L 215,320 L 238,308",
  // Rheinland-Pfalz east boundary
  "M 38,262 L 58,255 L 80,268 L 100,285 L 102,308",
  // Saarland
  "M 38,312 L 55,332 L 62,348 L 50,358",
];

// ── Small reusable components ─────────────────────────────────────────────────

function InfoTooltip({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-muted-foreground hover:text-foreground ml-1 inline-flex"
        type="button"
        aria-label="Hinweis"
      >
        <Info size={13} />
      </button>
      {show && (
        <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-foreground text-white text-[11px] rounded-md px-3 py-2 shadow-xl leading-snug pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </span>
      )}
    </span>
  );
}

function DraftBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
      ENTWURF
    </span>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("uebersicht");
  const [zeitraum, setZeitraum] = useState("kampagne");
  const [art, setArt] = useState<"alle" | SpeciesKey>("alle");
  const [region, setRegion] = useState("deutschland");
  const [darstellung, setDarstellung] = useState("punkte");
  const [showAllStates, setShowAllStates] = useState(false);
  const [chartVisible, setChartVisible] = useState<Record<SpeciesKey, boolean>>({
    asian: true,
    european: true,
    nest: true,
  });
  const [selectedPoint, setSelectedPoint] = useState<ObsPoint | null>(null);

  const filteredObs = OBSERVATIONS.filter(
    (o) => art === "alle" || o.type === art
  );

  const displayedStates = showAllStates ? ALL_STATES : TOP_STATES;
  const maxStateTotal = ALL_STATES[0].total;

  const OUTFIT = { fontFamily: "'Outfit', sans-serif" };

  return (
    <div className="min-h-screen bg-background">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-3.5 flex items-center gap-6">
          {/* Logo placeholders */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-16 h-9 border-2 border-dashed border-muted-foreground/35 rounded-md flex items-center justify-center text-[9px] font-semibold text-muted-foreground tracking-wide">
              NABU Logo
            </div>
            <div className="w-px h-7 bg-border" />
            <div className="w-20 h-9 border-2 border-dashed border-muted-foreground/35 rounded-md flex items-center justify-center text-[9px] font-semibold text-muted-foreground tracking-wide">
              CorrelAid Logo
            </div>
          </div>

          {/* Title block */}
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg font-semibold leading-tight text-foreground"
              style={OUTFIT}
            >
              Hornissen-Beobachtungen in Deutschland
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gemeldete Beobachtungen der Asiatischen und Europäischen Hornisse
            </p>
          </div>

          {/* Navigation links */}
          <nav className="flex items-center gap-5 shrink-0">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Über das Projekt
              <ExternalLink size={10} />
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              Hinweise zu den Daten
              <ExternalLink size={10} />
            </a>
          </nav>
        </div>
      </header>

      {/* ── Draft Banner ─────────────────────────────────────────────────────── */}
      <div className="bg-amber-400 border-b-2 border-amber-500">
        <div className="max-w-[1440px] mx-auto px-8 py-2 flex items-center gap-3">
          <AlertTriangle size={15} className="text-amber-900 shrink-0" />
          <p className="text-sm font-bold text-amber-900 tracking-wide">
            ENTWURF – Diskussionsgrundlage – keine finale oder produktive Version
          </p>
          <span className="ml-auto text-[11px] text-amber-800 shrink-0 font-medium">
            Nur für interne Abstimmung · Stand: Juni 2026
          </span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-8 py-7">

        {/* ── Introduction ───────────────────────────────────────────────────── */}
        <div className="mb-7 max-w-3xl">
          <p className="text-[15px] text-foreground leading-relaxed mb-3">
            Bürgerinnen und Bürger melden Hornissen-Beobachtungen über NABU |
            naturgucker. Diese Übersicht zeigt geprüfte Meldungen und macht
            sichtbar, wie die gemeinsamen Beiträge zum Projekt wachsen.
          </p>
          <div className="flex items-start gap-2.5 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3">
            <Info size={14} className="text-sky-600 mt-0.5 shrink-0" />
            <p className="text-sm text-sky-900 leading-snug">
              <strong>Wichtig:</strong> Die Zahlen zeigen gemeldete
              Beobachtungen, nicht die tatsächliche Anzahl der Tiere. Regionale
              Unterschiede können auch durch unterschiedliche Meldeaktivität
              entstehen.
            </p>
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────────────────── */}
        <div className="flex items-end gap-0.5 border-b border-border mb-5">
          {[
            { id: "uebersicht", label: "Aktuelle Übersicht", badge: null },
            {
              id: "vergleich",
              label: "Historischer Vergleich",
              badge: "optional",
            },
            {
              id: "forschung",
              label: "Forschungsergebnisse",
              badge: "spätere Phase",
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground font-medium"
              }`}
              style={OUTFIT}
            >
              {tab.label}
              {tab.badge && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full border border-border font-normal">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Filter Bar ─────────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg px-5 py-3.5 mb-5 flex flex-wrap items-center gap-x-7 gap-y-3">

          {/* Zeitraum */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              Zeitraum
            </span>
            <div className="relative">
              <select
                value={zeitraum}
                onChange={(e) => setZeitraum(e.target.value)}
                className="pl-3 pr-7 py-1.5 text-sm border border-border rounded-md bg-input-background appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="kampagne">Aktuelle Kampagne *</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            <span className="text-[10px] text-muted-foreground italic">
              * Zeitraum noch zu bestätigen
            </span>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Art / Typ */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              Art / Typ
            </span>
            <div className="flex rounded-md border border-border overflow-hidden">
              {(
                [
                  { val: "alle" as const, label: "Alle anzeigen", dot: null },
                  {
                    val: "asian" as const,
                    label: "Asiatische Hornisse",
                    dot: SP.asian.color,
                  },
                  {
                    val: "european" as const,
                    label: "Europäische Hornisse",
                    dot: SP.european.color,
                  },
                  { val: "nest" as const, label: "Nest", dot: SP.nest.color },
                ] as { val: "alle" | SpeciesKey; label: string; dot: string | null }[]
              ).map(({ val, label, dot }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setArt(val)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r last:border-r-0 border-border whitespace-nowrap ${
                    art === val
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {dot && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: dot }}
                    />
                  )}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Region */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              Region
            </span>
            <div className="relative">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="pl-3 pr-7 py-1.5 text-sm border border-border rounded-md bg-input-background appearance-none cursor-pointer hover:border-primary/50 focus:outline-none focus:border-primary text-foreground"
              >
                <option value="deutschland">Deutschland gesamt</option>
                <option value="nrw">Nordrhein-Westfalen</option>
                <option value="bw">Baden-Württemberg</option>
                <option value="by">Bayern</option>
                <option value="he">Hessen</option>
                <option value="rp">Rheinland-Pfalz</option>
                <option value="sn">Sachsen</option>
                <option value="ni">Niedersachsen</option>
              </select>
              <ChevronDown
                size={13}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
          </div>

          {/* Separator */}
          <div className="w-px h-6 bg-border" />

          {/* Darstellungsart */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              Darstellung
            </span>
            <div className="flex rounded-md border border-border overflow-hidden">
              <button
                type="button"
                onClick={() => setDarstellung("punkte")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors border-r border-border ${
                  darstellung === "punkte"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                Beobachtungspunkte
              </button>
              <button
                type="button"
                onClick={() => setDarstellung("region")}
                className={`px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  darstellung === "region"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                Nach Region zusammengefasst
                <span
                  className={`text-[9px] px-1 py-0.5 rounded ${
                    darstellung === "region"
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  optional
                </span>
              </button>
            </div>
          </div>

          {/* Quality badge */}
          <div className="ml-auto flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-3 py-1 shrink-0">
            <CheckCircle2 size={12} className="text-green-600" />
            <span className="text-[11px] text-green-800 font-medium">
              Nur geprüfte Meldungen mit Foto
            </span>
            <InfoTooltip text="Die endgültige Prüfung und technische Filterung der Meldungen muss noch mit NABU abgestimmt werden." />
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
        <div className="mb-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            Beispieldaten zur Veranschaulichung
          </span>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {/* Geprüfte Meldungen */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Geprüfte Meldungen
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25 mt-0.5" />
            </div>
            <div
              className="text-[2rem] font-bold text-foreground leading-none"
              style={OUTFIT}
            >
              1.248
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              im ausgewählten Zeitraum
            </div>
          </div>

          {/* Asiatische Hornisse */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Asiatische Hornisse
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                style={{ background: SP.asian.color }}
              />
            </div>
            <div
              className="text-[2rem] font-bold text-foreground leading-none"
              style={OUTFIT}
            >
              —
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Platzhalter
            </div>
          </div>

          {/* Europäische Hornisse */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Europäische Hornisse
              </span>
              <div
                className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                style={{ background: SP.european.color }}
              />
            </div>
            <div
              className="text-[2rem] font-bold text-foreground leading-none"
              style={OUTFIT}
            >
              —
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Platzhalter
            </div>
          </div>

          {/* Letzte Aktualisierung */}
          <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs text-muted-foreground font-medium">
                Letzte Aktualisierung
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/25 mt-0.5" />
            </div>
            <div
              className="text-xl font-bold text-foreground leading-none mt-1"
              style={OUTFIT}
            >
              TT.MM.JJJJ
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              geplanter Aktualisierungsrhythmus noch offen
            </div>
          </div>
        </div>

        {/* ── Map + State Sidebar ─────────────────────────────────────────────── */}
        <div className="flex gap-5 mb-6">

          {/* ── Germany Map ─────────────────────────────────────────────────── */}
          <div
            className="bg-card border border-border rounded-lg shadow-sm overflow-hidden"
            style={{ flex: "2 1 0%" }}
          >
            {/* Map header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground" style={OUTFIT}>
                Karte der Beobachtungen
              </h2>
              <div className="flex items-center gap-0.5">
                {[
                  { icon: <ZoomIn size={14} />, title: "Vergrößern" },
                  { icon: <ZoomOut size={14} />, title: "Verkleinern" },
                  { icon: <RotateCcw size={14} />, title: "Kartenausschnitt zurücksetzen" },
                  { icon: <Maximize2 size={14} />, title: "Vollbild" },
                ].map(({ icon, title }) => (
                  <button
                    key={title}
                    type="button"
                    title={title}
                    className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Map */}
            <div
              className="relative"
              style={{ background: "#DAE8D4", height: 520 }}
            >
              <svg
                viewBox="0 0 340 420"
                className="w-full h-full"
                style={{ display: "block" }}
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Germany filled land */}
                <path
                  d={GERMANY_PATH}
                  fill="#C8DFC0"
                  stroke="#7EA873"
                  strokeWidth="1.5"
                />

                {/* State boundary lines */}
                {STATE_LINES.map((d, i) => (
                  <path
                    key={i}
                    d={d}
                    fill="none"
                    stroke="#7EA873"
                    strokeWidth="0.7"
                    strokeOpacity={0.7}
                  />
                ))}

                {/* Non-nest observations (circles) */}
                {filteredObs
                  .filter((o) => o.type !== "nest")
                  .map((obs) => (
                    <circle
                      key={obs.id}
                      cx={obs.cx}
                      cy={obs.cy}
                      r={5}
                      fill={SP[obs.type].color}
                      fillOpacity={0.85}
                      stroke="white"
                      strokeWidth={1.2}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedPoint(
                          selectedPoint?.id === obs.id ? null : obs
                        )
                      }
                    />
                  ))}

                {/* Nest observations (diamonds) */}
                {filteredObs
                  .filter((o) => o.type === "nest")
                  .map((obs) => (
                    <polygon
                      key={obs.id}
                      points={`${obs.cx},${obs.cy - 7} ${obs.cx + 6},${obs.cy} ${obs.cx},${obs.cy + 7} ${obs.cx - 6},${obs.cy}`}
                      fill={SP.nest.color}
                      fillOpacity={0.88}
                      stroke="white"
                      strokeWidth={1.2}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedPoint(
                          selectedPoint?.id === obs.id ? null : obs
                        )
                      }
                    />
                  ))}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white/94 backdrop-blur-sm rounded-md p-2.5 shadow-sm border border-border">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Legende
                </div>
                {[
                  { color: SP.asian.color, label: SP.asian.label, shape: "circle" },
                  { color: SP.european.color, label: SP.european.label, shape: "circle" },
                  { color: SP.nest.color, label: SP.nest.label, shape: "diamond" },
                ].map(({ color, label, shape }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 mb-1 last:mb-0"
                  >
                    {shape === "circle" ? (
                      <div
                        className="w-3 h-3 rounded-full shrink-0 border border-white/60 shadow-sm"
                        style={{ background: color }}
                      />
                    ) : (
                      <div
                        className="w-3 h-3 shrink-0 border border-white/60 shadow-sm rotate-45"
                        style={{ background: color }}
                      />
                    )}
                    <span className="text-[11px] text-foreground">{label}</span>
                  </div>
                ))}
              </div>

              {/* Scale bar + attribution */}
              <div className="absolute bottom-4 right-4 text-right">
                <div className="flex items-center gap-1.5 justify-end mb-1.5">
                  <div className="relative">
                    <div className="w-12 h-px bg-gray-500" />
                    <div className="absolute left-0 top-0 h-1.5 w-px bg-gray-500 -translate-y-1/2" />
                    <div className="absolute right-0 top-0 h-1.5 w-px bg-gray-500 -translate-y-1/2" />
                  </div>
                  <span className="text-[9px] text-gray-500">~100 km</span>
                </div>
                <div className="text-[9px] text-gray-500">
                  © Geodaten [Platzhalter]
                </div>
              </div>

              {/* Observation popup */}
              {selectedPoint && (
                <div className="absolute top-3 right-3 bg-white rounded-lg shadow-xl border border-border p-3.5 w-52 z-10">
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <div className="text-[11px] font-semibold text-foreground">
                        Geprüfte Beobachtung
                      </div>
                      <div
                        className="text-[10px] font-semibold mt-0.5"
                        style={{ color: SP[selectedPoint.type].color }}
                      >
                        {SP[selectedPoint.type].label}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedPoint(null)}
                      className="text-muted-foreground hover:text-foreground ml-2 mt-0.5 shrink-0"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Datum</span>
                      <span className="text-foreground font-medium">
                        TT.MM.JJJJ
                      </span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground shrink-0">Region</span>
                      <span className="text-foreground font-medium text-right">
                        {REGIONS[selectedPoint.id % REGIONS.length]}
                      </span>
                    </div>
                    <div className="pt-1.5 mt-1 border-t border-border flex items-center gap-1.5">
                      <CheckCircle2 size={11} className="text-green-600 shrink-0" />
                      <span className="text-green-700 text-[10px]">
                        Foto vorhanden
                      </span>
                    </div>
                    <div className="text-[9px] text-muted-foreground italic leading-snug">
                      Position möglicherweise gerundet
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map note */}
            <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
              <Info size={11} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[10px] text-amber-700 leading-snug">
                Die genaue räumliche Darstellung – exakte, gerundete oder regional
                zusammengefasste Positionen – muss noch mit NABU abgestimmt werden.
              </p>
            </div>
          </div>

          {/* ── State Sidebar ─────────────────────────────────────────────── */}
          <div
            className="bg-card border border-border rounded-lg shadow-sm flex flex-col"
            style={{ flex: "1 1 0%", minWidth: 0 }}
          >
            <div className="px-4 py-3 border-b border-border">
              <h2
                className="text-sm font-semibold text-foreground"
                style={OUTFIT}
              >
                Beobachtungen nach Bundesland
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Illustrative Beispielwerte
              </p>
            </div>

            {/* State list */}
            <div className="flex-1 px-4 py-3 overflow-y-auto" style={{ maxHeight: 420 }}>
              {displayedStates.map((state, i) => {
                const totalPct = (state.total / maxStateTotal) * 100;
                const asianPct = (state.asian / maxStateTotal) * 100;
                const euPct = (state.european / maxStateTotal) * 100;
                const nestPct = (state.nest / maxStateTotal) * 100;
                return (
                  <div key={state.name} className="mb-3.5 last:mb-0">
                    <div className="flex items-baseline justify-between mb-1 gap-2">
                      <span
                        className="text-[12px] text-foreground font-medium truncate"
                        style={{ maxWidth: "80%" }}
                      >
                        {i + 1}. {state.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {state.total}
                      </span>
                    </div>
                    {/* Background track */}
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      {/* Stacked bar */}
                      <div className="flex h-full" style={{ width: `${totalPct}%` }}>
                        <div
                          className="h-full"
                          style={{
                            width: `${(asianPct / totalPct) * 100}%`,
                            background: SP.asian.color,
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            width: `${(euPct / totalPct) * 100}%`,
                            background: SP.european.color,
                          }}
                        />
                        <div
                          className="h-full"
                          style={{
                            width: `${(nestPct / totalPct) * 100}%`,
                            background: SP.nest.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sidebar footer */}
            <div className="px-4 py-3 border-t border-border mt-auto">
              <p className="text-[10px] text-muted-foreground leading-snug mb-2.5">
                Unterschiede können auch durch Bevölkerungsdichte und
                Meldeaktivität entstehen.
              </p>
              {/* Bar key */}
              <div className="flex items-center gap-2.5 mb-2.5">
                {(["asian", "european", "nest"] as SpeciesKey[]).map((k) => (
                  <div key={k} className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-sm shrink-0"
                      style={{ background: SP[k].color }}
                    />
                    <span className="text-[9px] text-muted-foreground">
                      {k === "asian" ? "Asiat." : k === "european" ? "Europ." : "Nest"}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowAllStates((v) => !v)}
                className="text-[12px] text-primary hover:underline font-medium"
              >
                {showAllStates
                  ? "Weniger anzeigen"
                  : "Alle Bundesländer anzeigen"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Time Trend Chart ────────────────────────────────────────────────── */}
        <div className="bg-card border border-border rounded-lg shadow-sm mb-6">
          <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-4">
            <div>
              <h2
                className="text-sm font-semibold text-foreground"
                style={OUTFIT}
              >
                Gemeldete Beobachtungen im Zeitverlauf
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Monatliche Meldungen nach Art – illustrative Beispieldaten
              </p>
            </div>
            {/* Series toggles */}
            <div className="flex items-center gap-2 shrink-0">
              {(["asian", "european", "nest"] as SpeciesKey[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setChartVisible((v) => ({ ...v, [key]: !v[key] }))
                  }
                  className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors ${
                    chartVisible[key]
                      ? "text-white border-transparent"
                      : "border-border text-muted-foreground bg-background hover:bg-muted"
                  }`}
                  style={chartVisible[key] ? { background: SP[key].color } : undefined}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      background: chartVisible[key]
                        ? "rgba(255,255,255,0.65)"
                        : SP[key].color,
                    }}
                  />
                  {SP[key].label}
                </button>
              ))}
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                Beispieldaten
              </span>
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="mb-1">
              <span className="text-[10px] text-muted-foreground">
                Anzahl der Meldungen
              </span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <LineChart
                data={MONTHLY_DATA}
                margin={{ top: 4, right: 16, bottom: 4, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#D8E0D0" />
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 11, fill: "#627060" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#627060" }}
                  axisLine={false}
                  tickLine={false}
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    background: "#fff",
                  }}
                  labelFormatter={(l) => `Monat: ${l}`}
                  formatter={(val: number, name: string) => [
                    val,
                    name === "asian"
                      ? SP.asian.label
                      : name === "european"
                      ? SP.european.label
                      : SP.nest.label,
                  ]}
                />
                {chartVisible.asian && (
                  <Line
                    type="monotone"
                    dataKey="asian"
                    stroke={SP.asian.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {chartVisible.european && (
                  <Line
                    type="monotone"
                    dataKey="european"
                    stroke={SP.european.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
                {chartVisible.nest && (
                  <Line
                    type="monotone"
                    dataKey="nest"
                    stroke={SP.nest.color}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-2.5 italic leading-snug max-w-2xl">
              Ein Anstieg der Meldungen kann sowohl tatsächliche Veränderungen als
              auch erhöhte Aufmerksamkeit oder Meldeaktivität widerspiegeln.
            </p>
          </div>
        </div>

        {/* ── Participation Card ──────────────────────────────────────────────── */}
        <div
          className="rounded-lg p-6 mb-6 text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #3B6E47 0%, #4D8C5F 100%)" }}
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h2
                className="text-base font-semibold mb-2"
                style={OUTFIT}
              >
                Jede geprüfte Meldung unterstützt das Projekt
              </h2>
              <p className="text-sm text-white/82 leading-relaxed max-w-2xl">
                Mit Ihrer Beobachtung helfen Sie dabei, die Verbreitung von
                Hornissen besser zu dokumentieren. Die Karte und die
                Zusammenfassungen werden aus den gemeinsam gemeldeten Daten
                erstellt.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                className="bg-white/15 hover:bg-white/25 border border-white/30 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
              >
                Beobachtung melden
              </button>
              <span className="text-[9px] text-white/50">[Platzhalter-Link]</span>
            </div>
          </div>
        </div>

        {/* ── Future Features ─────────────────────────────────────────────────── */}
        <div className="border border-dashed border-muted-foreground/30 rounded-lg p-5 mb-6 bg-background/50">
          <div className="flex items-center gap-2 mb-1">
            <h2
              className="text-sm font-semibold text-muted-foreground"
              style={OUTFIT}
            >
              Mögliche spätere Erweiterungen
            </h2>
          </div>
          <p className="text-[11px] text-muted-foreground mb-4 italic">
            Nicht Teil der bestätigten Hauptansicht – abhängig von Daten,
            Methodik und NABU-Freigabe
          </p>
          <div className="grid grid-cols-4 gap-2.5">
            {[
              "Historischer Vergleich ab 2022",
              "Vergleich ausgewählter Jahre",
              "Zusätzliche Diagramme",
              "Lebensraum und Landnutzung",
              "Schutzgebiete",
              "Stadt-Land-Vergleich",
              "Wetter und Ausbreitung",
              "Ergebnisse der Forschungsfragen",
            ].map((f) => (
              <div
                key={f}
                className="border border-dashed border-muted-foreground/35 rounded-md px-3 py-2.5 text-[11px] text-muted-foreground text-center bg-card hover:bg-muted/40 transition-colors cursor-default leading-snug"
              >
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stakeholder Panel ───────────────────────────────────────────────── */}
        <div className="border-2 border-dashed border-amber-300 rounded-lg p-5 mb-8 bg-amber-50">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <h2
              className="text-sm font-bold text-amber-900"
              style={OUTFIT}
            >
              Offene Entscheidungen
            </h2>
            <DraftBadge />
            <span className="ml-auto text-[10px] text-amber-700 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full shrink-0 font-medium">
              Nur für interne Abstimmung
            </span>
          </div>
          <p className="text-[11px] text-amber-800 mb-4 leading-snug">
            Die folgenden Punkte müssen vor einer finalen oder produktiven Version
            mit allen Beteiligten abgestimmt werden:
          </p>
          <div className="grid grid-cols-2 gap-x-10 gap-y-2.5">
            {[
              "Endgültiger Umfang des Dashboards",
              "Dashboard oder statische Diagramme",
              "Datenbereitstellung und Filterung",
              "Umgang mit Fotoprüfung",
              "Räumliche Genauigkeit der Kartenpunkte",
              "Hosting, Kosten und langfristige Wartung",
              "Aktualisierungsrhythmus",
              "Fachliche und redaktionelle Freigabe durch NABU",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-2 text-[12px] text-amber-800"
              >
                <span className="text-amber-400 shrink-0 mt-0.5 text-base leading-none">
                  ◯
                </span>
                <span className="leading-snug">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="border-t border-border pt-5">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="text-[11px] text-muted-foreground space-y-1 leading-relaxed">
              <div>
                Datenquelle: NABU | naturgucker / GBIF – genaue Auswahl noch zu
                bestätigen
              </div>
              <div>Darstellung: CorrelAid Berlin</div>
              <div>
                Beobachtungsdaten können nachträglich geprüft, geändert oder
                entfernt werden.
              </div>
              <div className="font-semibold text-amber-700">Stand: Entwurf</div>
            </div>
            <div className="flex items-center gap-5">
              {["Datenschutz", "Methodik", "Kontakt"].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
