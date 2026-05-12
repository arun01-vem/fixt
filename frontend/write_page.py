content = open("app/page.tsx", "w", encoding="utf-8", newline="\n")
content.write("""export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-2xl font-bold text-black">FIXT</span>
        <a href="/booking" className="bg-black text-white text-sm font-medium px-4 py-2 rounded-full">
          Book a Repair
        </a>
      </nav>
      <section className="flex flex-col items-center text-center px-6 py-24 max-w-3xl mx-auto">
        <h1 className="text-5xl font-extrabold text-black leading-tight mb-6">
          Your Phone Fixed. Today. At Home.
        </h1>
        <p className="text-lg text-gray-500 mb-10 max-w-xl">
          FIXT sends a certified technician to your door within 2 hours.
        </p>
        <a href="/booking" className="bg-orange-500 text-white text-lg font-semibold px-8 py-4 rounded-full">
          Book a Repair Now
        </a>
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-gray-400 font-medium">
          <span>90-Day Repair Warranty</span>
          <span>Certified Technicians</span>
          <span>Pay After Service</span>
          <span>2-Hour Slots</span>
        </div>
      </section>
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-black mb-12">How FIXT Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-3xl font-black text-orange-500 mb-3">1</div>
              <h3 className="text-lg font-bold text-black mb-2">Book Online</h3>
              <p className="text-gray-500 text-sm">Tell us your device and issue. Takes 60 seconds.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-3xl font-black text-orange-500 mb-3">2</div>
              <h3 className="text-lg font-bold text-black mb-2">We Come to You</h3>
              <p className="text-gray-500 text-sm">A technician arrives at your location within 2 hours.</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="text-3xl font-black text-orange-500 mb-3">3</div>
              <h3 className="text-lg font-bold text-black mb-2">Pay After Fix</h3>
              <p className="text-gray-500 text-sm">Only pay once your device is working perfectly.</p>
            </div>
          </div>
        </div>
      </section>
      <footer className="text-center py-8 text-sm text-gray-400">
        2025 FIXT - Built for your town
      </footer>
    </main>
  );
}
""")
content.close()
print("Done")