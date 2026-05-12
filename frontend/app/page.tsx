import Link from "next/link";
import { SiteLogo } from "@/components/SiteLogo";

const services = [
  {
    title: "Screen Repair",
    eyebrow: "Most booked",
    copy: "Glass cracks, touch issues, green lines, and display failures diagnosed at your door.",
    price: "From Rs. 800",
    tone: "from-zinc-950 to-zinc-800",
  },
  {
    title: "Battery Replacement",
    eyebrow: "Same-day slots",
    copy: "Fresh backup, safe swaps, and charging checks before a part is changed.",
    price: "From Rs. 400",
    tone: "from-[#f5f5f7] to-white",
  },
  {
    title: "Water Damage",
    eyebrow: "Careful diagnosis",
    copy: "Liquid exposure inspection, board cleaning, and honest repair advice.",
    price: "From Rs. 500",
    tone: "from-[#eef6ff] to-white",
  },
  {
    title: "Charging Port",
    eyebrow: "Quick fixes",
    copy: "Port cleaning, connector repair, cable checks, and power diagnosis.",
    price: "From Rs. 300",
    tone: "from-[#fff3e8] to-white",
  },
  {
    title: "Other Issue",
    eyebrow: "Tell us more",
    copy: "Not sure what is wrong? Describe the problem and we will confirm it by call.",
    price: "Diagnosis first",
    tone: "from-[#f7f2ff] to-white",
  },
];

const faqs = [
  ["How long does a screen repair take?", "Most common screen repairs take 45 to 90 minutes after the technician reaches your location."],
  ["Do you provide warranty?", "Yes. Eligible repairs include a 90-day service warranty. The technician will explain warranty terms before work starts."],
  ["Do I pay before repair?", "No. FIXT follows pay-after-service for the MVP launch. You pay only after the device is repaired and tested."],
  ["Is pickup available?", "For launch, the primary model is doorstep repair. Pickup can be arranged manually for complex repairs after a phone call."],
  ["Which locations do you serve?", "FIXT is currently available in Jagtial district, Telangana, with selected local areas added during launch."],
  ["Do you use original parts?", "The technician will explain available part options and pricing before fitting anything."],
  ["Can I cancel a booking?", "Yes. Since verification is manual, you can cancel when the team calls to confirm the slot."],
  ["How do I track my order?", "Use the Track menu with your FIXT order ID, or keep the confirmation page link after booking."],
];

const quickLinks = ["Book Repair", "Order Status", "Service Areas"];
const jagtialAreas = [
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
];

function PhoneVisual() {
  return (
    <div className="relative mx-auto h-[380px] w-[280px] sm:h-[470px] sm:w-[340px]" aria-hidden="true">
      <div className="hero-glow absolute inset-x-4 bottom-0 h-56 rounded-full bg-orange-500/30 blur-3xl" />
      <div className="absolute left-8 top-8 h-[320px] w-[190px] rotate-[-8deg] rounded-[2.2rem] border-[10px] border-zinc-950 bg-zinc-900 shadow-2xl shadow-black/25 sm:h-[410px] sm:w-[240px]">
        <div className="absolute inset-0 rounded-[1.55rem] bg-[radial-gradient(circle_at_50%_15%,#ffffff_0,#f5f5f7_18%,#111_19%,#000_70%)]" />
        <div className="absolute left-1/2 top-3 h-5 w-20 -translate-x-1/2 rounded-full bg-zinc-950" />
        <div className="absolute bottom-8 left-6 right-6 rounded-3xl bg-white/90 p-4 text-zinc-950">
          <p className="text-xs font-semibold text-zinc-500">Live estimate</p>
          <p className="mt-1 text-xl font-bold">Rs. 800 - 2500</p>
        </div>
      </div>
      <div className="absolute right-4 top-20 h-52 w-32 rotate-6 rounded-[1.8rem] border-[8px] border-white bg-[#f5f5f7] shadow-2xl shadow-zinc-400/30 sm:h-64 sm:w-40">
        <div className="absolute left-4 top-5 flex gap-2">
          <span className="h-8 w-8 rounded-full bg-zinc-900" />
          <span className="h-8 w-8 rounded-full bg-zinc-800" />
        </div>
        <div className="absolute bottom-5 left-4 right-4 h-24 rounded-2xl bg-orange-500/90" />
      </div>
      <div className="absolute bottom-10 right-0 rounded-3xl bg-white p-5 shadow-2xl shadow-zinc-300">
        <p className="text-xs font-semibold uppercase text-zinc-400">Technician</p>
        <p className="mt-1 text-lg font-bold">Arrives in 2 hrs</p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/5 bg-white/75 backdrop-blur-2xl">
        <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between px-5 text-xs font-medium text-zinc-700">
          <Link href="/" className="flex items-center gap-2 text-zinc-950" aria-label="FIXT home">
            <SiteLogo size={28} priority className="h-7 w-7 shrink-0" />
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">FIXT</span>
          </Link>
          <details className="group relative">
            <summary className="list-none rounded-full px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 hover:text-black">
              Menu
            </summary>
            <div className="absolute right-0 top-10 w-[min(92vw,420px)] rounded-[28px] bg-white p-5 shadow-2xl shadow-zinc-300/60 ring-1 ring-black/5">
              <div className="grid gap-1 text-2xl font-bold text-zinc-950">
                <a href="#home" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">Home</a>
                <a href="/booking" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">Book repair</a>
                <a href="/booking?step=map" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">Set service location</a>
                <a href="#services" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">Services</a>
                <a href="#technicians" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">Technicians</a>
                <a href="#about" className="rounded-2xl px-4 py-3 transition hover:bg-zinc-100">About</a>
              </div>
              <div className="mt-5 rounded-3xl bg-[#f5f5f7] p-5">
                <p className="text-sm font-semibold text-zinc-950">Track your repair</p>
                <p className="mt-1 text-xs leading-5 text-zinc-500">Enter your FIXT order ID from the confirmation page.</p>
                <form action="/track" className="mt-4 flex gap-2">
                  <input
                    name="order"
                    placeholder="FIXT-20260507-0001"
                    className="min-w-0 flex-1 rounded-full border border-zinc-200 px-4 py-2 text-xs outline-none focus:border-zinc-950"
                  />
                  <button className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white" type="submit">
                    Go
                  </button>
                </form>
              </div>
            </div>
          </details>
        </nav>
      </header>

      <section id="home" className="relative grid min-h-screen place-items-center overflow-hidden bg-black px-5 pt-12 text-center text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(180deg,#111_0%,#000_58%,#080808_100%)]" />
        <div className="fade-up relative z-10 mx-auto max-w-5xl py-24">
          <div className="mb-6 flex justify-center">
            <SiteLogo size={72} priority className="h-[72px] w-[72px] opacity-95" />
          </div>
          <p className="text-lg font-semibold text-zinc-300 md:text-2xl">FIXT Mobile Repair</p>
          <h1 className="mt-4 text-5xl font-bold leading-[0.96] tracking-normal md:text-8xl lg:text-9xl">
            Expert Mobile Repairs.
            <span className="block text-zinc-400">Fast. Reliable.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-zinc-300 md:text-2xl">
            Doorstep mobile repair for all devices, common issues, and same-day service slots.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/booking" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:scale-[1.03]">
              Book Your Mobile Repair
            </Link>
            <a href="#services" className="rounded-full border border-white/30 px-8 py-4 text-base font-semibold text-white transition hover:bg-white hover:text-black">
              Explore services
            </a>
          </div>
          <PhoneVisual />
        </div>
      </section>

      <section className="bg-white px-5 py-5 text-center text-sm leading-6 text-zinc-700 md:text-base">
        Same-day repair slots in selected local areas. Manual phone verification for launch. No payment before repair.
      </section>

      <section id="services" className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="max-w-4xl text-5xl font-bold leading-tight tracking-normal md:text-7xl">
            The latest fixes. <span className="text-zinc-500">Built for what breaks most.</span>
          </h2>
          <div className="scroll-row mt-10 flex gap-5 overflow-x-auto pb-6">
            {services.map((service, index) => (
              <article
                key={service.title}
                className={`min-h-[520px] w-[310px] shrink-0 overflow-hidden rounded-[28px] bg-gradient-to-br ${service.tone} p-7 shadow-xl shadow-zinc-300/60 md:w-[420px]`}
              >
                <div className={index === 0 ? "text-white" : "text-zinc-950"}>
                  <p className={index === 0 ? "text-sm font-semibold text-zinc-400" : "text-sm font-semibold text-orange-600"}>{service.eyebrow}</p>
                  <h3 className="mt-3 text-3xl font-bold tracking-normal md:text-4xl">{service.title}</h3>
                  <p className={index === 0 ? "mt-3 leading-7 text-zinc-300" : "mt-3 leading-7 text-zinc-600"}>{service.copy}</p>
                  <p className="mt-5 text-lg font-semibold">{service.price}</p>
                </div>
                <div className="mt-10 grid h-52 place-items-center rounded-[24px] bg-white/20">
                  <div className="relative h-40 w-32 rounded-[2rem] border-[9px] border-current bg-white/70 shadow-2xl">
                    <span className="absolute left-1/2 top-2 h-4 w-14 -translate-x-1/2 rounded-full bg-current opacity-80" />
                    <span className="absolute bottom-6 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-orange-500/80 blur-sm" />
                  </div>
                </div>
                <Link href="/booking" className={`mt-8 inline-flex rounded-full px-5 py-3 text-sm font-semibold transition ${index === 0 ? "bg-white text-black hover:bg-zinc-200" : "bg-zinc-950 text-white hover:bg-orange-600"}`}>
                  Book now
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="technicians" className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-center">
            <div>
              <h2 className="max-w-4xl text-5xl font-bold leading-tight tracking-normal md:text-7xl">
                Skilled technicians. <span className="text-zinc-500">Simple, private, professional.</span>
              </h2>
              <p className="mt-6 max-w-2xl text-xl leading-8 text-zinc-600">
                FIXT works with trained mobile repair technicians who can handle common phone issues at the doorstep. We keep personal technician details private and share visit information only after your booking is confirmed by call.
              </p>
            </div>
            <div className="rounded-[32px] bg-zinc-950 p-8 text-white shadow-xl shadow-zinc-300/60">
              <p className="text-sm font-semibold uppercase text-zinc-400">Repair team</p>
              <h3 className="mt-3 text-4xl font-bold leading-tight">Verified before every visit.</h3>
              <div className="mt-8 space-y-4 text-lg font-semibold text-zinc-300">
                <p>Doorstep repair support</p>
                <p>Common mobile issue diagnosis</p>
                <p>Manual call confirmation before arrival</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="px-5 py-20 md:py-28">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div>
            <h2 className="text-5xl font-bold leading-tight tracking-normal md:text-7xl">
              Built for mobiles that need service fast.
            </h2>
            <p className="mt-6 text-xl leading-8 text-zinc-600">
              FIXT is built for fast, local, no-drama mobile repair. The launch model is simple:
              book online, confirm by call, repair at the doorstep, and pay after service.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-zinc-300/50">
              <p className="text-5xl font-bold">1000+</p>
              <p className="mt-3 text-lg font-semibold text-zinc-600">repair capability across common phone issues</p>
            </div>
            <div className="rounded-[28px] bg-zinc-950 p-8 text-white shadow-xl shadow-zinc-300/50">
              <p className="text-5xl font-bold">2 hr</p>
              <p className="mt-3 text-lg font-semibold text-zinc-300">protected arrival windows for local logistics</p>
            </div>
            <div className="rounded-[28px] bg-white p-8 shadow-xl shadow-zinc-300/50 sm:col-span-2">
              <p className="text-5xl font-bold">No delivery charges</p>
              <p className="mt-3 text-lg font-semibold text-zinc-600">Doorstep service without extra pickup or visit fees during launch.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="areas" className="bg-white px-5 py-20 md:py-28">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-5xl font-bold tracking-normal md:text-7xl">
            Service available in Jagtial district. <span className="text-zinc-500">Hyper-local first.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-xl leading-8 text-zinc-600">
            We are launching area by area. If your village is not listed, place a booking and we will confirm availability by phone.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {jagtialAreas.map((area) => (
              <div key={area} className="rounded-[22px] bg-[#f5f5f7] p-6 text-center text-lg font-semibold">
                {area}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-5 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-5xl font-bold tracking-normal md:text-7xl">Questions? Answers.</h2>
          <div className="mt-10 divide-y divide-zinc-300 border-y border-zinc-300">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 text-xl font-semibold">
                  {question}
                  <span className="text-3xl font-light transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-5 py-20 text-center text-white md:py-28">
        <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-normal md:text-7xl">
          Ready to fix your phone today?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-xl leading-8 text-zinc-300">
          Start with a quick booking. We will call to verify the slot before sending a technician.
        </p>
        <Link href="/booking" className="mt-8 inline-flex rounded-full bg-white px-8 py-4 text-base font-semibold text-black transition hover:scale-[1.03]">
          Book a repair
        </Link>
      </section>

      <footer id="footer" className="bg-[#f5f5f7] px-5 py-10 text-sm text-zinc-600">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-zinc-950">Quick Links</h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {quickLinks.map((item) => (
                <a key={item} href={item === "Book Repair" ? "/booking" : "#home"} className="rounded-full border border-zinc-400 px-6 py-3 text-lg text-zinc-950 transition hover:bg-zinc-950 hover:text-white">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <p className="mt-8 leading-6">
            FIXT uses your selected service area to confirm technician availability faster. Manual phone verification is used during MVP launch.
          </p>
          <div className="mt-8 flex flex-col gap-3 border-t border-zinc-300 pt-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <SiteLogo size={36} className="h-9 w-9 shrink-0" />
              <p>Copyright 2026 FIXT. All rights reserved.</p>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href="#footer">Privacy Policy</a>
              <a href="#footer">Terms of Service</a>
              <a href="#footer">Contact</a>
              <a href="#footer">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
