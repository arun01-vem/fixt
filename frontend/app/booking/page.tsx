"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, createOrder, getSlotAvailability } from "@/lib/api";
import { SiteLogo } from "@/components/SiteLogo";

type Coordinates = {
  lat: number;
  lng: number;
};

type BookingData = {
  brand: string;
  customBrand: string;
  model: string;
  customModel: string;
  issue: string[];
  customIssue: string;
  issueDetails: string;
  district: string;
  village: string;
  customVillage: string;
  coordinates: Coordinates | null;
  addressLine: string;
  pincode: string;
  nearbyLocation: string;
  landmark: string;
  bookingDate: string;
  slot: string;
  customerName: string;
  phone: string;
  alternatePhone: string;
};

const MapPicker = dynamic(() => import("@/components/booking/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[360px] place-items-center rounded-[28px] bg-zinc-100 text-sm font-semibold text-zinc-500">
      Loading map...
    </div>
  ),
});

const BRAND_MODELS: Record<string, string[]> = {
  iPhone: ["iPhone 15 Pro Max", "iPhone 15 Pro", "iPhone 15", "iPhone 14 Pro Max", "iPhone 14", "iPhone 13", "iPhone 12", "iPhone 11", "iPhone XR", "Other model"],
  Samsung: ["Galaxy S24", "Galaxy S23", "Galaxy S22", "Galaxy A55", "Galaxy A35", "Galaxy A15", "Galaxy M34", "Galaxy M14", "Galaxy Note 20", "Other model"],
  OnePlus: ["OnePlus 12", "OnePlus 11", "OnePlus 10 Pro", "OnePlus 9", "OnePlus Nord 4", "OnePlus Nord CE 4", "OnePlus Nord CE 3", "Other model"],
  Redmi: ["Redmi Note 13 Pro", "Redmi Note 13", "Redmi Note 12 Pro", "Redmi Note 12", "Redmi 13C", "Redmi 12", "Poco X6", "Poco M6 Pro", "Other model"],
  Realme: ["Realme 12 Pro", "Realme 12", "Realme 11 Pro", "Realme Narzo 70", "Realme Narzo 60", "Realme C67", "Realme C55", "Other model"],
  Oppo: ["Oppo Reno 12", "Oppo Reno 11", "Oppo F27", "Oppo F25 Pro", "Oppo A78", "Oppo A59", "Oppo A38", "Other model"],
  Vivo: ["Vivo V30", "Vivo V29", "Vivo T3", "Vivo T2", "Vivo Y200", "Vivo Y100", "Vivo Y28", "Other model"],
  Moto: ["Moto Edge 50 Pro", "Moto Edge 40", "Moto G85", "Moto G64", "Moto G54", "Moto G34", "Moto E13", "Other model"],
  iQOO: ["iQOO 12", "iQOO 11", "iQOO Neo 9 Pro", "iQOO Neo 7 Pro", "iQOO Z9", "iQOO Z7 Pro", "iQOO Z6", "Other model"],
};

const ISSUE_OPTIONS = [
  { name: "Screen Broken", detail: "Cracked glass, display lines, touch issues", max: 4500 },
  { name: "Battery Drain", detail: "Low backup, swelling, sudden shutdown", max: 1800 },
  { name: "Charging Port", detail: "Slow charging, loose cable, no power", max: 1500 },
  { name: "Speaker Problem", detail: "Low volume, mic issue, call audio problem", max: 1200 },
  { name: "Water Damage", detail: "Liquid exposure, dead device, moisture checks", max: 3500 },
];

const DISTRICT_VILLAGES: Record<string, string[]> = {
  Jagtial: [
    "Jagtial",
    "Korutla",
    "Metpally",
    "Dharmapuri",
    "Raikal",
    "Mallial",
    "Sarangapur",
    "Pegadapalli",
    "Gollapalli",
    "Ibrahimpatnam",
    "Other village",
  ],
};

const SLOTS = ["10AM - 12PM", "12PM - 2PM", "2PM - 4PM", "4PM - 6PM"];

const INITIAL_BOOKING_DATA: BookingData = {
  brand: "",
  customBrand: "",
  model: "",
  customModel: "",
  issue: [],
  customIssue: "",
  issueDetails: "",
  district: "Jagtial",
  village: "",
  customVillage: "",
  coordinates: null,
  addressLine: "",
  pincode: "",
  nearbyLocation: "",
  landmark: "",
  bookingDate: new Date().toISOString().split("T")[0],
  slot: "",
  customerName: "",
  phone: "",
  alternatePhone: "",
};

function getPrice(issues: string[]) {
  if (issues.length === 0) return { min: 0, max: 0 };
  
  const hasScreenBroken = issues.includes("Screen Broken");
  const min = hasScreenBroken ? 1000 : 500;
  
  let totalMax = 0;
  issues.forEach(issueName => {
    if (issueName === "Other Issue") {
      totalMax += 3000;
    } else {
      const selected = ISSUE_OPTIONS.find((item) => item.name === issueName);
      totalMax += selected?.max ?? 3000;
    }
  });

  return { min, max: totalMax };
}

function cleanPhone(value: string) {
  return value.replace(/\D/g, "").slice(0, 10);
}

function isValidIndianMobile(value: string) {
  return /^[6-9]\d{9}$/.test(value);
}

function getNextNDays(n: number) {
  const days = [];
  for (let i = 0; i < n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      value: d.toISOString().split("T")[0],
      label: i === 0 ? "Today" : d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return days;
}

function isSlotInPast(slot: string, selectedDate: string) {
  const today = new Date().toISOString().split("T")[0];
  if (selectedDate > today) return false;
  if (selectedDate < today) return true;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const slotStarts: Record<string, number> = {
    "10AM - 12PM": 10 * 60,
    "12PM - 2PM": 12 * 60,
    "2PM - 4PM": 14 * 60,
    "4PM - 6PM": 16 * 60,
  };

  return currentTimeInMinutes >= slotStarts[slot];
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(() => {
    if (typeof window === "undefined") return 1;
    return new URLSearchParams(window.location.search).get("step") === "map" ? 4 : 1;
  });
  const [bookingData, setBookingData] = useState<BookingData>(INITIAL_BOOKING_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const availability = await getSlotAvailability(bookingData.bookingDate);
        setSlotAvailability(availability);
      } catch (err) {
        console.error("Failed to fetch slot availability:", err);
      }
    }
    fetchAvailability();
  }, [bookingData.bookingDate]);

  const availableModels = bookingData.brand === "Other" ? ["Other model"] : (bookingData.brand ? BRAND_MODELS[bookingData.brand] ?? [] : []);
  const availableVillages = DISTRICT_VILLAGES[bookingData.district] ?? [];
  const estimate = useMemo(() => getPrice(bookingData.issue), [bookingData.issue]);
  const progress = Math.round((step / 6) * 100);
  const finalBrand = bookingData.brand === "Other" ? bookingData.customBrand.trim() : bookingData.brand;
  const finalModel = bookingData.model === "Other model" ? bookingData.customModel.trim() : bookingData.model;
  const finalVillage = bookingData.village === "Other village" ? bookingData.customVillage.trim() : bookingData.village;
  const displayIssues = bookingData.issue.map(i => i === "Other Issue" ? bookingData.customIssue.trim() : i).filter(Boolean);

  function updateBooking<K extends keyof BookingData>(key: K, value: BookingData[K]) {
    setBookingData((current) => ({ ...current, [key]: value }));
  }

  function pickBrand(brand: string) {
    setBookingData((current) => ({
      ...current,
      brand,
      customBrand: "",
      model: "",
      customModel: "",
    }));
  }

  function pickDistrict(district: string) {
    setBookingData((current) => ({
      ...current,
      district,
      village: "",
      customVillage: "",
    }));
  }

  function toggleIssue(issueName: string) {
    setBookingData((current) => {
      let newIssues = [...current.issue];
      
      // If we select a regular issue, remove "Other Issue" and clear customIssue
      if (newIssues.includes("Other Issue")) {
        newIssues = [issueName];
      } else {
        if (newIssues.includes(issueName)) {
          newIssues = newIssues.filter((i) => i !== issueName);
        } else {
          newIssues.push(issueName);
        }
      }
      
      return { ...current, issue: newIssues, customIssue: "" };
    });
  }

  function selectAllIssues() {
    setBookingData((current) => {
      const allRegularIssues = ISSUE_OPTIONS.map((i) => i.name);
      return { ...current, issue: allRegularIssues, customIssue: "" };
    });
  }

  function canContinue() {
    if (step === 1) return Boolean(finalBrand && finalModel);
    if (step === 2) {
      if (bookingData.issue.length === 0) return false;
      if (bookingData.issue.includes("Other Issue") && !bookingData.customIssue.trim()) return false;
      return true;
    }
    if (step === 3) return bookingData.issue.length > 0;
    if (step === 4) return Boolean(bookingData.coordinates && bookingData.addressLine.trim() && bookingData.pincode.length === 6 && bookingData.nearbyLocation.trim());
    if (step === 5) return Boolean(bookingData.district && finalVillage && bookingData.slot);
    if (step === 6) {
      const hasValidMainPhone = isValidIndianMobile(bookingData.phone);
      const hasValidAlternatePhone = !bookingData.alternatePhone || isValidIndianMobile(bookingData.alternatePhone);
      return Boolean(bookingData.customerName.trim() && hasValidMainPhone && hasValidAlternatePhone);
    }
    return true;
  }

  function nextStep() {
    if (canContinue()) {
      setStep((current) => Math.min(current + 1, 7));
    }
  }

  function previousStep() {
    setSubmitError("");
    setStep((current) => Math.max(current - 1, 1));
  }

  async function submitBooking() {
    if (!canContinue()) return;

    setIsSubmitting(true);
    setSubmitError("");

    // Full frontend payload remains in one object until this final submission point.
    const finalPayload = {
      ...bookingData,
      estimate,
      submittedAt: new Date().toISOString(),
    };

    try {
      const customer = await createCustomer({
        name: finalPayload.customerName.trim(),
        phone: finalPayload.phone,
      });

      const order = await createOrder({
        customer_id: customer.id,
        device: `${finalBrand} ${finalModel}`,
        brand: finalBrand,
        model: finalModel,
        issue: displayIssues.join(", "),
        issue_details: finalPayload.issueDetails,
        estimated_price: estimate.max,
        price_min: estimate.min,
        price_max: estimate.max,
        district: finalPayload.district,
        village: finalVillage,
        address_line: finalPayload.addressLine,
        pincode: finalPayload.pincode,
        nearby_location: finalPayload.nearbyLocation,
        landmark: finalPayload.landmark,
        latitude: finalPayload.coordinates?.lat ?? 0,
        longitude: finalPayload.coordinates?.lng ?? 0,
        alternate_phone: finalPayload.alternatePhone,
        booking_date: finalPayload.bookingDate,
        slot: finalPayload.slot,
      });

      const params = new URLSearchParams({
        order: order.order_number ?? "FIXT-PENDING",
        device: `${finalBrand} ${finalModel}`,
        issue: displayIssues.join(", "),
        area: `${finalVillage}, ${finalPayload.district}`,
        date: finalPayload.bookingDate,
        slot: finalPayload.slot,
        min: String(estimate.min),
        max: String(estimate.max),
      });

      router.push(`/booking/success?${params.toString()}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Booking failed. Please make sure the backend server is running, then try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-5 py-8 text-[#1d1d1f] md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-zinc-600 transition hover:text-black">
            <SiteLogo size={32} className="h-8 w-8 shrink-0" />
            Exit Booking
          </Link>
          <div className="hidden text-sm font-semibold text-zinc-500 sm:block">Step {step} of 6</div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="rounded-[32px] bg-black p-8 text-white shadow-2xl shadow-zinc-300/60">
            <div className="flex items-center gap-3">
              <SiteLogo size={40} className="h-10 w-10 shrink-0 brightness-110" />
              <p className="text-sm font-semibold text-zinc-400">FIXT Booking</p>
            </div>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-normal md:text-5xl">
              Book a repair in a few focused steps.
            </h1>
            <p className="mt-5 leading-7 text-zinc-300">
              No image uploads. No extra storage. Just the details needed to confirm your doorstep repair.
            </p>
            <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-8 rounded-[24px] bg-white/10 p-5">
              <p className="text-xs font-semibold uppercase text-zinc-400">Current selection</p>
              <p className="mt-3 text-lg font-semibold">{finalBrand || "Brand pending"}</p>
              <p className="text-sm text-zinc-400">{finalModel || "Model pending"}</p>
              <p className="mt-3 text-sm text-zinc-300">{displayIssues.join(", ") || "Issue pending"}</p>
            </div>
          </aside>

          <section className="rounded-[32px] bg-white p-6 shadow-2xl shadow-zinc-200 md:p-10">
            {step === 1 ? (
              <div>
                <p className="text-sm font-semibold uppercase text-orange-600">Device selection</p>
                <h2 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Choose your phone.</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">Select a brand first. The model dropdown updates based on that brand.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {Object.keys(BRAND_MODELS).map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => pickBrand(brand)}
                      className={`rounded-[22px] border p-5 text-left text-lg font-semibold transition ${
                        bookingData.brand === brand && !bookingData.customBrand ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-[#f5f5f7] hover:border-zinc-950"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
                <input
                  value={bookingData.customBrand}
                  onChange={(event) => {
                    setBookingData(prev => ({
                      ...prev,
                      brand: "Other",
                      customBrand: event.target.value,
                      model: "Other model"
                    }));
                  }}
                  placeholder="Other brand..."
                  className={`mt-4 w-full rounded-2xl border px-5 py-4 text-lg font-semibold outline-none transition ${
                    bookingData.brand === "Other" ? "border-zinc-950 bg-zinc-950 text-white placeholder:text-zinc-500" : "border-zinc-200 bg-[#f5f5f7] placeholder:text-zinc-400 focus:border-zinc-950"
                  }`}
                />
                {bookingData.brand === "Other" && !bookingData.customBrand.trim() ? (
                  <p className="mt-2 text-xs font-semibold text-orange-600">Please enter the brand name.</p>
                ) : null}
                <label className="mt-8 block text-sm font-semibold uppercase text-zinc-500" htmlFor="model">Model</label>
                <select
                  id="model"
                  value={bookingData.model}
                  disabled={!bookingData.brand}
                  onChange={(event) => updateBooking("model", event.target.value)}
                  className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none transition focus:border-zinc-950 disabled:bg-zinc-100 disabled:text-zinc-400"
                >
                  <option value="">{bookingData.brand ? "Select model" : "Select brand first"}</option>
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                {bookingData.model === "Other model" ? (
                  <input
                    value={bookingData.customModel}
                    onChange={(event) => updateBooking("customModel", event.target.value)}
                    placeholder="Enter model name"
                    className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none transition focus:border-zinc-950"
                  />
                ) : null}
              </div>
            ) : null}

            {step === 2 ? (
              <div>
                <p className="text-sm font-semibold uppercase text-orange-600">Issue section</p>
                <div className="mt-2 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <h2 className="text-4xl font-bold tracking-normal md:text-6xl">What happened?</h2>
                  <button
                    type="button"
                    onClick={selectAllIssues}
                    className="w-fit rounded-full bg-zinc-100 px-6 py-2 text-sm font-bold text-zinc-900 transition hover:bg-zinc-200"
                  >
                    Select all
                  </button>
                </div>
                <p className="mt-4 text-lg leading-8 text-zinc-600">Choose the closest issue. If it is not listed, select Other Issue and describe it.</p>
                <div className="mt-8 grid gap-3 md:grid-cols-2">
                  {ISSUE_OPTIONS.map((issue) => (
                    <button
                      key={issue.name}
                      type="button"
                      onClick={() => toggleIssue(issue.name)}
                      className={`rounded-[22px] border p-5 text-left transition ${
                        bookingData.issue.includes(issue.name) && !bookingData.issue.includes("Other Issue") ? "border-zinc-950 bg-zinc-950 text-white" : "border-zinc-200 bg-[#f5f5f7] hover:border-zinc-950"
                      }`}
                    >
                      <span className="block text-xl font-bold">{issue.name}</span>
                      <span className={bookingData.issue.includes(issue.name) && !bookingData.issue.includes("Other Issue") ? "mt-2 block text-sm text-zinc-300" : "mt-2 block text-sm text-zinc-500"}>{issue.detail}</span>
                    </button>
                  ))}
                </div>
                <input
                  value={bookingData.customIssue}
                  onChange={(event) => {
                    setBookingData((prev) => ({ ...prev, issue: ["Other Issue"], customIssue: event.target.value }));
                  }}
                  placeholder="Other issue..."
                  className={`mt-4 w-full rounded-2xl border px-5 py-4 text-lg font-semibold outline-none transition ${
                    bookingData.issue.includes("Other Issue") ? "border-zinc-950 bg-zinc-950 text-white placeholder:text-zinc-500" : "border-zinc-200 bg-[#f5f5f7] placeholder:text-zinc-400 focus:border-zinc-950"
                  }`}
                />
                
                {bookingData.issue.length > 0 ? (
                  <div className="mt-8">
                    <label className="block text-sm font-semibold uppercase text-zinc-500">Incident explanation</label>
                    <textarea
                      value={bookingData.issueDetails}
                      onChange={(event) => updateBooking("issueDetails", event.target.value.slice(0, 250))}
                      placeholder="Explain the incident or anything you want to share..."
                      className="mt-3 min-h-32 w-full rounded-2xl border border-zinc-300 bg-white p-5 text-base outline-none transition focus:border-zinc-950"
                    />
                    <div className="mt-2 flex justify-between text-xs font-semibold">
                      <p className={bookingData.issue.includes("Other Issue") && !bookingData.customIssue.trim() ? "text-orange-600" : "text-zinc-400"}>
                        {bookingData.issue.includes("Other Issue") && !bookingData.customIssue.trim() ? "Please describe the other issue above." : ""}
                      </p>
                      <p className="text-zinc-400">{bookingData.issueDetails.length}/250</p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="text-center">
                <p className="text-sm font-semibold uppercase text-orange-600">Price estimation</p>
                <h2 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Approx repair range.</h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                  Final pricing depends on exact model, part availability, and diagnosis. You pay only after service.
                </p>
                <div className="mx-auto mt-8 max-w-xl rounded-[32px] bg-black p-8 text-white">
                  <p className="text-sm font-semibold uppercase text-zinc-400">{displayIssues.join(", ")}</p>
                  <p className="mt-4 text-5xl font-bold tracking-normal">Rs. {estimate.min} - {estimate.max}</p>
                  <p className="mt-4 leading-7 text-zinc-300">
                    Screen related repairs start from Rs. 1000. All other listed issues start from Rs. 500.
                  </p>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div>
                <p className="text-sm font-semibold uppercase text-orange-600">Map pinpointing</p>
                <h2 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Drop your location pin.</h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600">
                  Click on the OpenStreetMap map to place a pin. This captures latitude and longitude without Google Maps API cost.
                </p>
                <div className="mt-8">
                  <MapPicker
                    value={bookingData.coordinates}
                    onChange={(coords) => updateBooking("coordinates", coords)}
                    onLocationFetch={(info) => {
                      setBookingData((current) => ({
                        ...current,
                        addressLine: info.addressLine,
                        pincode: info.pincode,
                        nearbyLocation: info.nearbyLocation,
                        // We also try to match the village if it exists in our list
                        village: DISTRICT_VILLAGES[current.district].includes(info.village) ? info.village : "Other village",
                        customVillage: DISTRICT_VILLAGES[current.district].includes(info.village) ? "" : info.village,
                      }));
                    }}
                  />
                </div>
                <div className="mt-5 rounded-2xl bg-[#f5f5f7] p-5 text-sm font-semibold text-zinc-600">
                  {bookingData.coordinates ? "Location pin selected." : "No pin selected yet."}
                </div>
                <div className="mt-6 grid gap-4">
                  <input
                    value={bookingData.addressLine}
                    onChange={(event) => updateBooking("addressLine", event.target.value)}
                    placeholder="House number, street, apartment, or full address"
                    className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={bookingData.pincode}
                      onChange={(event) => updateBooking("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Pincode"
                      inputMode="numeric"
                      className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                    />
                    <input
                      value={bookingData.nearbyLocation}
                      onChange={(event) => updateBooking("nearbyLocation", event.target.value)}
                      placeholder="Nearby location"
                      className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                    />
                  </div>
                  <input
                    value={bookingData.landmark}
                    onChange={(event) => updateBooking("landmark", event.target.value)}
                    placeholder="Landmark (optional)"
                    className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                  />
                </div>
              </div>
            ) : null}

            {step === 5 ? (
              <div>
                <p className="text-sm font-semibold uppercase text-orange-600">Location and slot</p>
                <h2 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Where and when?</h2>
                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold uppercase text-zinc-500" htmlFor="district">District</label>
                    <select
                      id="district"
                      value={bookingData.district}
                      onChange={(event) => pickDistrict(event.target.value)}
                      className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                    >
                      <option value="Jagtial">Jagtial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase text-zinc-500" htmlFor="village">Village/Town</label>
                    <select
                      id="village"
                      value={bookingData.village}
                      onChange={(event) => {
                        updateBooking("village", event.target.value);
                        if (event.target.value !== "Other village") {
                          updateBooking("customVillage", "");
                        }
                      }}
                      className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                    >
                      <option value="">Select village/town</option>
                      {availableVillages.map((village) => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </select>
                    {bookingData.village === "Other village" ? (
                      <input
                        value={bookingData.customVillage}
                        onChange={(event) => updateBooking("customVillage", event.target.value)}
                        placeholder="Enter village/town name"
                        className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                      />
                    ) : null}
                  </div>
                </div>
                <div className="mt-8">
                  <label className="block text-sm font-semibold uppercase text-zinc-500" htmlFor="date">Booking Date</label>
                  <select
                    id="date"
                    value={bookingData.bookingDate}
                    onChange={(event) => {
                      updateBooking("bookingDate", event.target.value);
                      updateBooking("slot", "");
                    }}
                    className="mt-3 w-full rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                  >
                    {getNextNDays(5).map((day) => (
                      <option key={day.value} value={day.value}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-8">
                  <p className="text-sm font-semibold uppercase text-zinc-500">Arrival slot</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {SLOTS.map((slot) => {
                      const isPast = isSlotInPast(slot, bookingData.bookingDate);
                      const currentCount = slotAvailability[slot] ?? 0;
                      const isFull = currentCount >= 5;
                      const isDisabled = isPast || isFull;

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => !isDisabled && updateBooking("slot", slot)}
                          disabled={isDisabled}
                          className={`flex flex-col rounded-2xl border p-5 text-left transition ${
                            bookingData.slot === slot
                              ? "border-zinc-950 bg-zinc-950 text-white"
                              : isDisabled
                              ? "border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed"
                              : "border-zinc-200 bg-[#f5f5f7] hover:border-zinc-950"
                          }`}
                        >
                          <span className="text-lg font-semibold">{slot}</span>
                          {isFull && <span className="mt-1 text-xs text-red-500">Maximum number of slots are booked try another slot.</span>}
                          {isPast && !isFull && <span className="mt-1 text-xs text-zinc-500">Slot time has passed.</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 rounded-[24px] bg-orange-50 p-5 text-base font-semibold text-orange-800">
                  Technician arrives within 2 hours. Maximum delivery turnaround: 24 hours.
                </div>
              </div>
            ) : null}

            {step === 6 ? (
              <div>
                <p className="text-sm font-semibold uppercase text-orange-600">Contact information</p>
                <h2 className="mt-2 text-4xl font-bold tracking-normal md:text-6xl">Review and confirm.</h2>
                <div className="mt-8 grid gap-4">
                  <input
                    value={bookingData.customerName}
                    onChange={(event) => updateBooking("customerName", event.target.value)}
                    placeholder="Full name"
                    className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                  />
                  <div className="flex gap-3">
                    <div className="rounded-2xl bg-[#f5f5f7] px-5 py-4 text-lg font-semibold text-zinc-500">+91</div>
                    <input
                      value={bookingData.phone}
                      onChange={(event) => updateBooking("phone", cleanPhone(event.target.value))}
                      placeholder="Mobile number"
                      inputMode="numeric"
                      className="min-w-0 flex-1 rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                    />
                  </div>
                  {bookingData.phone && !isValidIndianMobile(bookingData.phone) ? (
                    <p className="text-sm font-semibold text-red-600">Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.</p>
                  ) : null}
                  <input
                    value={bookingData.alternatePhone}
                    onChange={(event) => updateBooking("alternatePhone", cleanPhone(event.target.value))}
                    placeholder="Alternate number (optional)"
                    inputMode="numeric"
                    className="rounded-2xl border border-zinc-300 bg-white px-5 py-4 text-lg font-semibold outline-none focus:border-zinc-950"
                  />
                  {bookingData.alternatePhone && !isValidIndianMobile(bookingData.alternatePhone) ? (
                    <p className="text-sm font-semibold text-red-600">Alternate number must also be a valid Indian mobile number.</p>
                  ) : null}
                </div>
                <div className="mt-8 rounded-[28px] bg-[#f5f5f7] p-6">
                  <p className="text-sm font-semibold uppercase text-zinc-500">Summary</p>
                  <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                    <p><span className="text-zinc-500">Brand:</span> <b>{finalBrand}</b></p>
                    <p><span className="text-zinc-500">Model:</span> <b>{finalModel}</b></p>
                    <p><span className="text-zinc-500">Issue:</span> <b>{displayIssues.join(", ")}</b></p>
                    <p><span className="text-zinc-500">Location:</span> <b>{finalVillage}, {bookingData.district}</b></p>
                    <p><span className="text-zinc-500">Date:</span> <b>{bookingData.bookingDate}</b></p>
                    <p><span className="text-zinc-500">Slot:</span> <b>{bookingData.slot}</b></p>
                    <p><span className="text-zinc-500">Address:</span> <b>{bookingData.addressLine}</b></p>
                    <p><span className="text-zinc-500">Pincode:</span> <b>{bookingData.pincode}</b></p>
                    <p><span className="text-zinc-500">Estimate:</span> <b>Rs. {estimate.min} - {estimate.max}</b></p>
                  </div>
                </div>
                {submitError ? (
                  <div className="mt-5 rounded-2xl bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-700">{submitError}</p>
                    <button
                      type="button"
                      onClick={submitBooking}
                      disabled={isSubmitting}
                      className="mt-3 rounded-full bg-red-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-800 disabled:opacity-40"
                    >
                      Retry submit
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={previousStep}
                disabled={step === 1 || isSubmitting}
                className="rounded-full border border-zinc-300 px-7 py-4 font-semibold text-zinc-700 transition hover:border-zinc-950 disabled:opacity-30"
              >
                Back
              </button>
              {step < 6 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canContinue()}
                  className="rounded-full bg-zinc-950 px-7 py-4 font-semibold text-white transition hover:bg-orange-600 disabled:opacity-30"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submitBooking}
                  disabled={!canContinue() || isSubmitting}
                  className="rounded-full bg-orange-600 px-7 py-4 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-30"
                >
                  {isSubmitting ? "Confirming..." : "Confirm Booking"}
                </button>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
