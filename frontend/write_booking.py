content = open("app/booking/page.tsx", "w", encoding="utf-8", newline="\n")
content.write("""'use client';
import { useState } from 'react';

const DEVICES = [
  { name: 'iPhone', icon: '📱' },
  { name: 'Samsung', icon: '📲' },
  { name: 'OnePlus', icon: '🔴' },
  { name: 'Realme', icon: '⚡' },
  { name: 'Oppo', icon: '🔵' },
  { name: 'Vivo', icon: '🟣' },
  { name: 'Mi / Redmi', icon: '🟠' },
  { name: 'Other', icon: '📟' },
];

const ISSUES = [
  { name: 'Screen Broken', icon: '💥', desc: 'Cracked or unresponsive display' },
  { name: 'Battery Drain', icon: '🔋', desc: 'Fast drain or not charging' },
  { name: 'Charging Port', icon: '🔌', desc: 'Loose or dead charging port' },
  { name: 'Speaker Problem', icon: '🔊', desc: 'No sound or distorted audio' },
  { name: 'Water Damage', icon: '💧', desc: 'Dropped in water or moisture' },
  { name: 'Other', icon: '🔧', desc: 'Something else entirely' },
];

const PRICES: Record<string, { min: number; max: number }> = {
  'Screen Broken':   { min: 800,  max: 2500 },
  'Battery Drain':   { min: 400,  max: 900  },
  'Charging Port':   { min: 300,  max: 700  },
  'Speaker Problem': { min: 200,  max: 600  },
  'Water Damage':    { min: 500,  max: 2000 },
  'Other':           { min: 200,  max: 1500 },
};

const SLOTS = ['10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'];
const LOCATIONS = ['Warangal', 'Hanamkonda', 'Kazipet', 'Bhimavaram'];
const STEP_LABELS = ['Device', 'Issue', 'Estimate', 'Slot', 'Contact'];

export default function Booking() {
  const [step, setStep]           = useState(1);
  const [device, setDevice]       = useState('');
  const [issue, setIssue]         = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [slot, setSlot]           = useState('');
  const [location, setLocation]   = useState('');
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [loading, setLoading]     = useState(false);


  const phoneValid = /^[0-9]{10}$/.test(phone);

  function pickDevice(name: string) {
    setDevice(name);
    setStep(2);
  }

  function pickIssue(name: string) {
    setIssue(name);
  }

  function pickSlot(s: string) {
    setSlot(s);
  }

  function pickLocation(l: string) {
    setLocation(l);
  }

  async function handleSubmit() {
    if (!name || !phoneValid) return;
    setLoading(true);
    try {
      const customerRes = await fetch('http://127.0.0.1:8000/customers/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const customer = await customerRes.json();
      const orderRes = await fetch('http://127.0.0.1:8000/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device,
          issue: issue + (issueDesc ? ' - ' + issueDesc : ''),
          slot,
          customer_id: customer.id,
          estimated_price: PRICES[issue]?.min ?? null,
        }),
      });
      const order = await orderRes.json();
      const params = new URLSearchParams({
        order: order.order_number,
        device: device,
        issue: issue,
        slot: slot,
        area: location,
        min: String(PRICES[issue]?.min ?? 0),
        max: String(PRICES[issue]?.max ?? 0),
      });
      window.location.href = '/booking/success?' + params.toString();
    } catch (e) {
      alert('Something went wrong. Please try again.');
    }
    setLoading(false);
  }


  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto px-6 py-10">

        <a href="/" className="text-sm text-gray-400 hover:text-black transition mb-8 block">
          Back to Home
        </a>

        <div className="mb-2 flex justify-between text-xs font-medium text-gray-400">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={i + 1 === step ? 'text-orange-500 font-semibold' : ''}>{label}</span>
          ))}
        </div>
        <div className="flex gap-1 mb-10">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-orange-500' : 'bg-gray-100'}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Step 1 of 5</p>
            <h2 className="text-2xl font-extrabold text-black mb-1">Select your device</h2>
            <p className="text-gray-400 text-sm mb-6">What device needs to be repaired?</p>
            <div className="grid grid-cols-2 gap-3">
              {DEVICES.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => pickDevice(d.name)}
                  className={`border-2 rounded-2xl p-4 text-left transition-all duration-200 hover:shadow-md ${device === d.name ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                >
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <div className="font-semibold text-black text-sm">{d.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Step 2 of 5</p>
            <h2 className="text-2xl font-extrabold text-black mb-1">What is the issue?</h2>
            <p className="text-gray-400 text-sm mb-6">Select the problem with your {device}.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {ISSUES.map((i) => (
                <button
                  key={i.name}
                  type="button"
                  onClick={() => pickIssue(i.name)}
                  className={`border-2 rounded-2xl p-4 text-left transition-all duration-200 hover:shadow-md ${issue === i.name ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-orange-200'}`}
                >
                  <div className="text-2xl mb-2">{i.icon}</div>
                  <div className="font-semibold text-black text-sm">{i.name}</div>
                  <div className="text-gray-400 text-xs mt-1">{i.desc}</div>
                </button>
              ))}
            </div>
            {issue && (
              <div className="mb-6">
                <textarea
                  maxLength={200}
                  value={issueDesc}
                  onChange={(e) => setIssueDesc(e.target.value)}
                  placeholder="Describe your issue in more detail (optional)"
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 text-sm text-black focus:border-orange-500 outline-none resize-none h-24"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{issueDesc.length}/200</p>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-gray-100 text-gray-400 font-semibold py-4 rounded-full hover:border-gray-300 transition">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} disabled={!issue}
                className="flex-1 bg-orange-500 text-white font-semibold py-4 rounded-full hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Step 3 of 5</p>
            <h2 className="text-2xl font-extrabold text-black mb-1">Your price estimate</h2>
            <p className="text-gray-400 text-sm mb-6">Based on your device and issue.</p>
            <div className="bg-orange-50 border border-orange-100 rounded-3xl p-8 text-center mb-4">
              <div className="text-4xl mb-3">💰</div>
              <p className="text-sm text-gray-400 mb-1">{device} · {issue}</p>
              <p className="text-4xl font-black text-orange-500 mb-1">
                Rs. {PRICES[issue]?.min} - Rs. {PRICES[issue]?.max}
              </p>
              <p className="text-xs text-gray-400 mt-2">Final price confirmed after technician inspection</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-500"><span>✅</span><span>No hidden charges</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-500"><span>✅</span><span>Pay only after repair is done</span></div>
              <div className="flex items-center gap-2 text-sm text-gray-500"><span>✅</span><span>90-day repair warranty</span></div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 border-2 border-gray-100 text-gray-400 font-semibold py-4 rounded-full hover:border-gray-300 transition">
                Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 bg-orange-500 text-white font-semibold py-4 rounded-full hover:bg-orange-600 transition">
                Looks Good
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Step 4 of 5</p>
            <h2 className="text-2xl font-extrabold text-black mb-1">Pick a slot and area</h2>
            <p className="text-gray-400 text-sm mb-6">Choose when and where we should come.</p>
            <p className="text-sm font-semibold text-black mb-3">Available time slots</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {SLOTS.map((s) => (
                <button key={s} type="button" onClick={() => pickSlot(s)}
                  className={`border-2 rounded-2xl p-4 text-sm font-medium transition-all duration-200 ${slot === s ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-black hover:border-orange-200'}`}>
                  🕐 {s}
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-black mb-3">Your area</p>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {LOCATIONS.map((l) => (
                <button key={l} type="button" onClick={() => pickLocation(l)}
                  className={`border-2 rounded-2xl p-4 text-sm font-medium transition-all duration-200 ${location === l ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-100 text-black hover:border-orange-200'}`}>
                  📍 {l}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="flex-1 border-2 border-gray-100 text-gray-400 font-semibold py-4 rounded-full hover:border-gray-300 transition">
                Back
              </button>
              <button type="button" onClick={() => setStep(5)} disabled={!slot || !location}
                className="flex-1 bg-orange-500 text-white font-semibold py-4 rounded-full hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-orange-500 uppercase mb-2">Step 5 of 5</p>
            <h2 className="text-2xl font-extrabold text-black mb-1">Your contact details</h2>
            <p className="text-gray-400 text-sm mb-6">We will call you to confirm within 10 minutes.</p>
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-2 border-gray-100 rounded-2xl px-4 py-4 text-black placeholder-gray-300 focus:border-orange-500 outline-none transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2 block">Phone Number</label>
                <div className="flex gap-2">
                  <div className="border-2 border-gray-100 rounded-2xl px-4 py-4 text-gray-400 text-sm font-medium">+91</div>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className={`flex-1 border-2 rounded-2xl px-4 py-4 text-black placeholder-gray-300 outline-none transition ${phone.length === 10 ? (phoneValid ? 'border-green-400' : 'border-red-400') : 'border-gray-100 focus:border-orange-500'}`}
                  />
                </div>
                {phone.length === 10 && !phoneValid && (
                  <p className="text-xs text-red-400 mt-1 ml-1">Please enter a valid 10-digit number</p>
                )}
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Order Summary</p>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Device</span><span className="font-medium text-black">{device}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Issue</span><span className="font-medium text-black">{issue}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Slot</span><span className="font-medium text-black">{slot}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Area</span><span className="font-medium text-black">{location}</span></div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-400">Estimate</span>
                <span className="font-bold text-orange-500">Rs. {PRICES[issue]?.min} - Rs. {PRICES[issue]?.max}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(4)} className="flex-1 border-2 border-gray-100 text-gray-400 font-semibold py-4 rounded-full hover:border-gray-300 transition">
                Back
              </button>
              <button type="button" onClick={handleSubmit} disabled={!name || !phoneValid || loading}
                className="flex-1 bg-orange-500 text-white font-semibold py-4 rounded-full hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
""")
content.close()
print("Done")