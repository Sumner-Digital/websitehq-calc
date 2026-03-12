"use client";

import { useState, useMemo, useEffect, useRef } from "react";

// ─── Helpers ─────────────────────────────────────────────────
function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtHrs(n: number): string {
  if (n < 1) return "< 1 hr";
  return Math.round(n).toLocaleString("en-US") + " hrs";
}

// ─── InputField Component ────────────────────────────────────
interface InputFieldProps {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}

function InputField({
  label,
  hint,
  value,
  onChange,
  prefix,
  suffix,
  min,
  max,
  step,
}: InputFieldProps) {
  const [raw, setRaw] = useState(String(value));
  const [focused, setFocused] = useState(false);

  const displayed = focused ? raw : String(value);

  // Compute fill percentage for range slider track
  const sliderMin = min ?? 0;
  const sliderMax = max ?? 100;
  const pct =
    sliderMax > sliderMin
      ? ((Math.min(Math.max(value, sliderMin), sliderMax) - sliderMin) /
          (sliderMax - sliderMin)) *
        100
      : 0;

  return (
    <div className="mb-[18px] last:mb-0">
      <label className="block text-[0.85rem] font-semibold text-txt mb-1">
        {label}
      </label>
      <p className="text-[0.75rem] text-txt-light mb-1.5">{hint}</p>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-light font-semibold text-[0.95rem] pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={displayed}
          onFocus={() => {
            setRaw(String(value));
            setFocused(true);
          }}
          onChange={(e) => {
            const text = e.target.value;
            setRaw(text);
            const num = parseFloat(text);
            onChange(isNaN(num) ? 0 : num);
          }}
          onBlur={() => setFocused(false)}
          min={min}
          max={max}
          step={step}
          className={`w-full py-2.5 border-2 border-border rounded-lg text-base font-medium text-txt transition-colors outline-none focus:border-primary ${
            prefix ? "pl-[26px]" : "px-3"
          } ${suffix ? "pr-[50px]" : "pr-3"}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-light text-[0.8rem] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {max != null && (
        <input
          type="range"
          min={min ?? 0}
          max={max}
          step={step ?? 1}
          value={Math.min(Math.max(value, sliderMin), sliderMax)}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="mt-2.5 w-full block"
          style={{
            background: `linear-gradient(to right, #E8443A 0%, #E8443A ${pct}%, #DDE3EB ${pct}%, #DDE3EB 100%)`,
          }}
        />
      )}
    </div>
  );
}

// ─── ResultRow Component ─────────────────────────────────────
function ResultRow({
  label,
  value,
  type,
  bold,
  large,
}: {
  label: string;
  value: string;
  type?: "revenue" | "cost";
  bold?: boolean;
  large?: boolean;
}) {
  const colorClass =
    type === "revenue"
      ? "text-green-text"
      : type === "cost"
        ? "text-red-text"
        : "text-txt";
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-border last:border-b-0">
      <span
        className={`text-[0.85rem] ${
          bold ? "font-bold text-txt" : "text-txt-light"
        }`}
      >
        {label}
      </span>
      <span
        className={`font-bold ${colorClass} ${
          large ? "text-[1.2rem]" : "text-base"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function ROICalculator() {
  // Card 1: Current WordPress Costs
  const [hosting, setHosting] = useState(50);
  const [speedTools, setSpeedTools] = useState(30);
  const [security, setSecurity] = useState(20);
  const [backups, setBackups] = useState(10);

  // Card 2: Your Time (Opportunity Cost)
  const [ownerHourlyValue, setOwnerHourlyValue] = useState(50);
  const [hoursUpdating, setHoursUpdating] = useState(10);
  const [hoursTroubleshooting, setHoursTroubleshooting] = useState(3);
  const [hoursContentEdits, setHoursContentEdits] = useState(2);

  // Card 4: WebsiteHQ Investment
  const [websiteHQMonthly] = useState(125);

  const calc = useMemo(() => {
    // ── WordPress Monthly Costs ──
    const wpSoftwareCost = hosting + speedTools + security + backups;
    const totalWPMonthlyCost = wpSoftwareCost;

    // ── Time costs ──
    const totalTimeHoursMonth =
      hoursUpdating + hoursTroubleshooting + hoursContentEdits;
    const monthlyTimeCost = totalTimeHoursMonth * ownerHourlyValue;
    const totalWPWithTime = totalWPMonthlyCost + monthlyTimeCost;

    // ── WebsiteHQ costs ──
    // With WebsiteHQ: no hosting, no performance tools, no security, no backups,
    // no dev for updates/fixes, no emergency fixes, minimal time for content
    const websiteHQTimeSaved = totalTimeHoursMonth * 0.85; // saves 85% of time
    const totalWebsiteHQMonthly = websiteHQMonthly; // flat $125/mo

    // ── Savings ──
    const totalMonthlySavings = totalWPWithTime - totalWebsiteHQMonthly;
    const annualTotalSavings = totalMonthlySavings * 12;
    const annualTimeSavingsHrs = websiteHQTimeSaved * 12;

    // ── ROI ──
    const annualWPCost = totalWPWithTime * 12;
    const annualWebsiteHQ = totalWebsiteHQMonthly * 12;
    const savingsPct =
      annualWPCost > 0
        ? Math.round(((annualWPCost - annualWebsiteHQ) / annualWPCost) * 100)
        : 0;

    // 3-year projection
    const threeYearWP = annualWPCost * 3;
    const threeYearWebsiteHQ = annualWebsiteHQ * 3;
    const threeYearSavings = threeYearWP - threeYearWebsiteHQ;

    // ── Risk Score (hosting-aware) ──
    const cheapHosting = hosting < 25;
    let riskScore = 0;
    const riskItems: { id: string; title: string; message: string }[] = [];

    if (cheapHosting && security <= 0) {
      riskScore += 3;
      riskItems.push({
        id: "no-security",
        title: "No Security Protection",
        message:
          "Your site has zero malware protection on basic shared hosting. WordPress is the #1 target for hackers — over 90,000 attacks hit WordPress sites every minute. Shared hosting means one compromised site on your server puts yours at risk too.",
      });
    }
    if (cheapHosting && backups <= 0) {
      riskScore += 3;
      riskItems.push({
        id: "no-backups",
        title: "No Backup System",
        message:
          "You have no offsite backup plan. If your site gets hacked, your server crashes, or your hosting provider erases your data — everything is gone. Your content, your SEO rankings, your customer trust. Starting over from scratch could cost thousands.",
      });
    }
    if (hoursUpdating <= 0) {
      riskScore += 3;
      riskItems.push({
        id: "outdated-plugins",
        title: "Outdated Plugins",
        message:
          "WordPress plugins can release updates every single day — including weekends. If nobody is checking and updating your plugins, you're running outdated code with known security holes that hackers actively target. Outdated plugins are the #1 way WordPress sites get hacked.",
      });
    }

    return {
      wpSoftwareCost,
      totalWPMonthlyCost,
      totalTimeHoursMonth,
      monthlyTimeCost,
      totalWPWithTime,
      websiteHQTimeSaved,
      totalWebsiteHQMonthly,
      totalMonthlySavings,
      annualTotalSavings,
      annualTimeSavingsHrs,
      annualWPCost,
      annualWebsiteHQ,
      savingsPct,
      threeYearWP,
      threeYearWebsiteHQ,
      threeYearSavings,
      riskScore,
      riskItems,
    };
  }, [
    hosting,
    speedTools,
    security,
    backups,
    ownerHourlyValue,
    hoursUpdating,
    hoursTroubleshooting,
    hoursContentEdits,
    websiteHQMonthly,
  ]);

  // ── Warning modal state ──
  const [warningDismissed, setWarningDismissed] = useState(false);
  const prevAboveThreshold = useRef(false);

  const riskThreshold = 4;
  const isAboveThreshold = calc.riskScore >= riskThreshold;

  useEffect(() => {
    // Re-show warning if risk score crosses back above threshold
    if (isAboveThreshold && !prevAboveThreshold.current) {
      setWarningDismissed(false);
    }
    prevAboveThreshold.current = isAboveThreshold;
  }, [isAboveThreshold]);

  const showWarning = isAboveThreshold && !warningDismissed;

  // Context-aware results: replace negative savings with appropriate messaging
  const negativeSavings = calc.annualTotalSavings <= 0;
  const isAtRisk = negativeSavings && calc.riskScore >= riskThreshold;
  const isValueSwap = negativeSavings && !isAtRisk;

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── Warning Modal ─── */}
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-[580px] w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-br from-red-text to-accent px-7 py-6 rounded-t-2xl text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h2 className="text-[1.5rem] font-bold text-white mb-1">
                Your Website Is a Ticking Time Bomb
              </h2>
              <p className="text-white/85 text-[0.9rem]">
                Based on your numbers, your WordPress site has serious gaps that
                could cost you everything.
              </p>
            </div>

            {/* Risk Items */}
            <div className="px-7 py-5">
              <div className="space-y-4">
                {calc.riskItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-bg flex items-center justify-center shrink-0 mt-0.5">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#C0392B"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-[0.85rem] font-bold text-red-text mb-0.5">
                        {item.title}
                      </div>
                      <p className="text-[0.8rem] text-txt-light leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* What's At Stake */}
              <div className="mt-5 bg-red-bg rounded-xl p-4">
                <div className="text-[0.8rem] font-bold text-red-text mb-2 uppercase tracking-wider">
                  What&apos;s Really at Stake
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-txt-light">
                      Average cost to recover a hacked site
                    </span>
                    <span className="font-bold text-red-text">
                      $3,000 - $5,000
                    </span>
                  </div>
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-txt-light">
                      Revenue lost per minute of downtime
                    </span>
                    <span className="font-bold text-red-text">$427</span>
                  </div>
                  <div className="flex justify-between text-[0.82rem]">
                    <span className="text-txt-light">
                      Small businesses that close after a cyber attack
                    </span>
                    <span className="font-bold text-red-text">60%</span>
                  </div>
                </div>
              </div>

              {/* WebsiteHQ Pitch */}
              <div className="mt-5 bg-green-bg rounded-xl p-4 border border-green-text/20">
                <p className="text-[0.85rem] text-green-text font-semibold mb-1">
                  WebsiteHQ protects your business for just $125/mo
                </p>
                <p className="text-[0.78rem] text-txt-light leading-relaxed">
                  Enterprise-grade security, daily automated backups, automatic
                  updates, and 24/7 monitoring — all included. No extra tools needed.
                  No extra fees. Sleep easy knowing your business is protected.
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-2.5">
                <button className="w-full bg-gradient-to-br from-green-text to-[#066b30] text-white py-3.5 rounded-[10px] text-[0.95rem] font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(10,123,62,0.3)] transition-all cursor-pointer">
                  Protect My Business with WebsiteHQ
                </button>
                <button
                  onClick={() => setWarningDismissed(true)}
                  className="w-full border-2 border-border text-txt-light py-3 rounded-[10px] text-[0.85rem] font-medium hover:border-txt-light transition-all cursor-pointer"
                >
                  I Understand the Risks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero Banner ─── */}
      <div className="bg-gradient-to-br from-primary to-primary-dark py-12 px-6 text-center">
        <h1 className="text-[2.2rem] max-md:text-[1.6rem] font-bold text-white tracking-tight mb-2">
          What Is WordPress Really Costing You?
        </h1>
        <p className="text-[1.1rem] text-white/90 max-w-[640px] mx-auto">
          Most business owners have no idea how much money and time they pour
          into their WordPress site every month. Enter your numbers below and see
          the real cost.
        </p>
      </div>

      {/* ─── Main Content ─── */}
      <div className="max-w-[1100px] mx-auto px-5 py-8 pb-[60px] max-md:px-3.5 max-md:py-5 max-md:pb-10">
        <div className="grid grid-cols-2 gap-7 items-start max-md:grid-cols-1">
          {/* ─── LEFT: Input Cards ─── */}
          <div>
            {/* Card 1: WordPress Software Costs */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 mb-5">
              <div className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-bg flex items-center justify-center text-sm shrink-0 text-red-text">
                  1
                </span>
                WordPress Monthly Bills
              </div>
              <InputField
                label="Web Hosting"
                hint="Monthly hosting fee (SiteGround, WP Engine, GoDaddy, etc.)"
                value={hosting}
                onChange={setHosting}
                prefix="$"
                min={0}
                max={300}
              />
              <InputField
                label="Speed & Performance Tools"
                hint="CDN, caching plugins, image optimization services"
                value={speedTools}
                onChange={setSpeedTools}
                prefix="$"
                min={0}
                max={200}
              />
              <InputField
                label="Security & Malware Protection"
                hint="Sucuri, Wordfence, or similar security service"
                value={security}
                onChange={setSecurity}
                prefix="$"
                min={0}
                max={100}
              />
              <InputField
                label="Offsite Backup Service"
                hint="Offsite backups in case your server gets hacked or erased — UpdraftPlus, VaultPress, BlogVault, etc."
                value={backups}
                onChange={setBackups}
                prefix="$"
                min={0}
                max={50}
              />
            </div>

            {/* Card 2: Your Time */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 mb-5">
              <div className="text-[1.1rem] font-bold text-primary mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-orange-bg flex items-center justify-center text-sm shrink-0 text-orange-text">
                  2
                </span>
                Your Time (The Hidden Cost)
              </div>
              <InputField
                label="Your Time Value per Hour"
                hint="What is an hour of your time worth to your business?"
                value={ownerHourlyValue}
                onChange={setOwnerHourlyValue}
                prefix="$"
                min={0}
                max={200}
              />
              <InputField
                label="Hours Checking & Updating Plugins"
                hint="Plugins can have updates every single day — including weekends. Skipping updates leaves your site vulnerable to hackers."
                value={hoursUpdating}
                onChange={setHoursUpdating}
                min={0}
                max={80}
                suffix="hrs/mo"
              />
              <InputField
                label="Hours Troubleshooting Issues"
                hint="Fixing broken layouts, slow pages, compatibility issues"
                value={hoursTroubleshooting}
                onChange={setHoursTroubleshooting}
                min={0}
                max={80}
                suffix="hrs/mo"
              />
              <InputField
                label="Hours Making Simple Content Edits"
                hint="Updating text, images, adding pages in WordPress"
                value={hoursContentEdits}
                onChange={setHoursContentEdits}
                min={0}
                max={80}
                suffix="hrs/mo"
              />
            </div>

            {/* Card 3: WebsiteHQ */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7 border-2 border-green-text/20">
              <div className="text-[1.1rem] font-bold text-green-text mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-green-bg flex items-center justify-center text-sm shrink-0">
                  3
                </span>
                WebsiteHQ (Everything Included)
              </div>
              <div className="bg-green-bg rounded-xl p-5">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[0.9rem] font-semibold text-txt">
                    WebsiteHQ Monthly Plan
                  </span>
                  <span className="text-[1.3rem] font-extrabold text-green-text">
                    {fmt(websiteHQMonthly)}/mo
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {[
                    "Hosting included",
                    "All WordPress & Plugin Updates Handled",
                    "Multiple Daily Backups Included",
                    "Image Optimization",
                    "Uptime Monitoring",
                    "White Glove Migration",
                    "99.99% Uptime",
                    "Free SSL Certificate",
                    "Priority Support with our Dedicated Team",
                  ].map((item) => (
                    <li
                      key={item}
                      className="text-[0.8rem] text-green-text font-medium flex items-center gap-2"
                    >
                      <span className="text-green-text text-sm">&#10003;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Results Panel ─── */}
          <div className="sticky top-5 max-md:static">
            {/* What WordPress Is Costing You */}
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-7">
              <div className="text-[1.1rem] font-bold text-red-text mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-red-bg flex items-center justify-center text-sm shrink-0">
                  !
                </span>
                What WordPress Costs You Monthly
              </div>

              <ResultRow
                label="Software & Hosting"
                value={fmt(calc.wpSoftwareCost)}
                type="cost"
              />

              <div className="border-t-2 border-border mt-2 pt-2">
                <ResultRow
                  label="Total Cash Cost"
                  value={fmt(calc.totalWPMonthlyCost)}
                  type="cost"
                  bold
                  large
                />
              </div>

              <div className="border-t-2 border-dashed border-border mt-3 pt-3">
                <ResultRow
                  label={`Your Time (${calc.totalTimeHoursMonth} hrs/mo)`}
                  value={fmt(calc.monthlyTimeCost)}
                  type="cost"
                />
                <ResultRow
                  label="True Monthly Cost (Money + Time)"
                  value={fmt(calc.totalWPWithTime)}
                  type="cost"
                  bold
                  large
                />
              </div>
            </div>

            {/* Wasted Money Box / Value Swap / Risk Focused */}
            {isAtRisk ? (
              <div className="bg-gradient-to-br from-[#7f1d1d] to-[#c2410c] rounded-xl p-5 text-center mt-4 text-white">
                <div className="text-[0.85rem] opacity-90 font-semibold uppercase tracking-wider">
                  Your Site Is Exposed
                </div>
                <div className="text-[2rem] font-extrabold my-1">
                  One hack could cost $3,000&ndash;$5,000
                </div>
                <div className="text-[0.85rem] opacity-85">
                  You&apos;re spending less because you have no protection in place
                </div>
              </div>
            ) : isValueSwap ? (
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-xl p-5 text-center mt-4 text-white">
                <div className="text-[0.85rem] opacity-90 font-semibold uppercase tracking-wider">
                  Everything You Need, One Simple Plan
                </div>
                <div className="text-[2.4rem] font-extrabold my-1">
                  $125/mo
                </div>
                <div className="text-[0.85rem] opacity-85">
                  Speed, security, managed updates, and hassle-free editing — all included
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-accent to-accent-dark rounded-xl p-5 text-center mt-4 text-white">
                <div className="text-[0.85rem] opacity-90 font-semibold uppercase tracking-wider">
                  You&apos;re Wasting Every Year
                </div>
                <div className="text-[2.4rem] font-extrabold my-1">
                  {fmt(calc.annualTotalSavings)}
                </div>
                <div className="text-[0.85rem] opacity-85">
                  That&apos;s {fmt(calc.totalMonthlySavings)} every month you could be saving
                </div>
              </div>
            )}

            {/* Savings metrics / Value Swap / Risk Focused */}
            {isAtRisk ? (
              <div className="flex gap-3 mt-3 max-md:flex-col">
                <div className="flex-1 bg-red-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    Avg. Hack Recovery
                  </div>
                  <div className="text-2xl font-extrabold text-red-text">
                    $3,000&ndash;$5,000
                  </div>
                </div>
                <div className="flex-1 bg-red-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    Risk Level
                  </div>
                  <div className="text-2xl font-extrabold text-red-text">
                    Critical
                  </div>
                </div>
              </div>
            ) : isValueSwap ? (
              <div className="flex gap-3 mt-3 max-md:flex-col">
                <div className="flex-1 bg-blue-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    Managed Updates
                  </div>
                  <div className="text-2xl font-extrabold text-primary">
                    We handle it
                  </div>
                </div>
                <div className="flex-1 bg-blue-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    Site Speed
                  </div>
                  <div className="text-2xl font-extrabold text-primary">
                    Optimized for you
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-3 max-md:flex-col">
                <div className="flex-1 bg-green-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    WebsiteHQ Total Cost
                  </div>
                  <div className="text-2xl font-extrabold text-green-text">
                    {fmt(calc.totalWebsiteHQMonthly)}/mo
                  </div>
                </div>
                <div className="flex-1 bg-green-bg rounded-xl py-4 px-5 text-center">
                  <div className="text-[0.8rem] text-txt-light font-semibold">
                    You Save
                  </div>
                  <div className="text-2xl font-extrabold text-green-text">
                    {calc.savingsPct}%
                  </div>
                </div>
              </div>
            )}

            {/* Time Saved Callout / Value Swap / Risk Focused */}
            {isAtRisk ? (
              <div className="bg-green-bg rounded-xl p-5 mt-3 text-center">
                <div className="text-[0.8rem] text-txt-light font-semibold mb-1">
                  WebsiteHQ Includes Everything
                </div>
                <div className="text-[1.05rem] font-semibold text-green-text leading-relaxed mt-2">
                  Enterprise-grade security, daily backups, managed updates, and 24/7 monitoring — all for $125/mo. Peace of mind for your business.
                </div>
              </div>
            ) : isValueSwap ? (
              <div className="bg-green-bg rounded-xl p-5 mt-3 text-center">
                <div className="text-[0.8rem] text-txt-light font-semibold mb-1">
                  Everything Managed For You
                </div>
                <div className="text-[1.05rem] font-semibold text-green-text leading-relaxed mt-2">
                  Speed optimization, managed updates, security, backups, and simple content editing. One plan, one price, zero headaches.
                </div>
              </div>
            ) : (
              <div className="bg-blue-bg rounded-xl p-5 mt-3 text-center">
                <div className="text-[0.8rem] text-txt-light font-semibold mb-1">
                  Time You Get Back Every Month
                </div>
                <div className="text-[2rem] font-extrabold text-primary">
                  {fmtHrs(calc.websiteHQTimeSaved)}
                </div>
                <div className="text-[0.78rem] text-txt-light">
                  No more updates, troubleshooting, or fighting with WordPress
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Stat Cards Row ─── */}
        {isAtRisk ? (
          <div className="grid grid-cols-3 gap-4 mt-7 max-md:grid-cols-1">
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-red-text">
                30,000+
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Sites Hacked Daily
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-red-text">
                $427/min
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Avg. Downtime Cost
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-red-text">
                60%
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Of Businesses Close After Attack
              </div>
            </div>
          </div>
        ) : isValueSwap ? (
          <div className="grid grid-cols-3 gap-4 mt-7 max-md:grid-cols-1">
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-primary">
                Managed Updates
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Always up to date
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-primary">
                Speed Optimized
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Fast by default
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-primary">
                Zero Maintenance
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                We handle everything
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mt-7 max-md:grid-cols-1">
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-red-text">
                {fmt(calc.annualWPCost)}
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                WordPress True Annual Cost
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-green-text">
                {fmt(calc.annualWebsiteHQ)}
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                WebsiteHQ Annual Cost
              </div>
            </div>
            <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-[22px] text-center">
              <div className="text-[1.8rem] font-extrabold text-primary">
                {Math.round(calc.annualTimeSavingsHrs)} hrs
              </div>
              <div className="text-[0.8rem] text-txt-light mt-0.5 font-medium">
                Hours Saved per Year
              </div>
            </div>
          </div>
        )}

        {/* ─── Comparison Table ─── */}
        <h2 className="text-[1.3rem] font-bold text-txt text-center mt-10 mb-5">
          WordPress vs. WebsiteHQ
        </h2>
        <div className="bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="bg-primary text-white py-3.5 px-5 text-left text-[0.85rem] font-semibold">
                  What You Deal With
                </th>
                <th className="bg-primary text-white py-3.5 px-5 text-right text-[0.85rem] font-semibold">
                  WordPress
                </th>
                <th className="bg-primary text-white py-3.5 px-5 text-right text-[0.85rem] font-semibold">
                  WebsiteHQ
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Monthly Cost (Cash)
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right font-semibold text-red-text">
                  {fmt(calc.totalWPMonthlyCost)}
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  {fmt(websiteHQMonthly)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Your Time Each Month
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right font-semibold text-red-text">
                  {calc.totalTimeHoursMonth} hours
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  0
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Updates & Maintenance
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  You or your developer
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Handled for you
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Security & Hacking Risk
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  Constant threat
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Built-in protection
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Downtime &amp; Recovery
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  Costly and unpredictable
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  24/7 monitoring included
                </td>
              </tr>
              <tr>
                <td className="py-3 px-5 border-b border-border text-[0.9rem]">
                  Site Speed
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right">
                  Depends on hosting & optimization
                </td>
                <td className="py-3 px-5 border-b border-border text-[0.9rem] text-right bg-green-bg font-bold text-green-text">
                  Optimized by default
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ─── Assumptions & Notes ─── */}
        <div className="mt-10 bg-card rounded-[14px] shadow-[0_2px_12px_rgba(0,0,0,0.08)] py-6 px-7">
          <h3 className="text-[0.9rem] text-txt-light mb-2.5 font-semibold">
            How We Calculate This
          </h3>
          <ul className="list-none grid grid-cols-2 gap-x-6 gap-y-1.5 max-md:grid-cols-1">
            {[
              "WordPress costs include hosting, performance tools, security, and offsite backup services that you pay for separately",
              "Time value is calculated at your stated hourly rate for hours spent on website tasks instead of revenue-generating activities",
              "WebsiteHQ eliminates separate hosting, security fees, and developer maintenance since everything is managed for you",
              "Time savings of 85% reflects that WebsiteHQ handles updates, security, backups, and troubleshooting automatically",
              "Default values are conservative averages based on typical small business WordPress websites",
            ].map((text) => (
              <li
                key={text}
                className="text-[0.8rem] text-txt-light pl-3.5 relative before:content-[''] before:absolute before:left-0 before:top-[8px] before:w-[5px] before:h-[5px] before:rounded-full before:bg-border"
              >
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* ─── CTA ─── */}
        <div className="text-center mt-12">
          <p className="text-base text-txt-light mb-4">
            Stop overpaying for WordPress. Switch to WebsiteHQ and keep more
            money in your pocket.
          </p>
          <div className="flex justify-center gap-3 max-md:flex-col max-md:items-center">
            <button className="inline-block bg-gradient-to-br from-primary to-primary-dark text-white py-3.5 px-9 rounded-[10px] text-base font-bold shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(27,77,122,0.3)] transition-all cursor-pointer">
              Get Started with WebsiteHQ
            </button>
            <button className="inline-block border-2 border-primary text-primary py-3.5 px-9 rounded-[10px] text-base font-bold hover:bg-primary hover:text-white transition-all cursor-pointer">
              See a Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
