import { ArrowLeft } from 'lucide-react';

interface PrivacyViewProps {
  onBack: () => void;
}

export function PrivacyView({ onBack }: PrivacyViewProps) {
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#fbf9f3] selection:bg-teal-100 selection:text-teal-900">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#fbf9f3]/90 backdrop-blur-md border-b border-[#bcc9c6]/15">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-serif text-2xl font-black tracking-tighter text-[#00685f] cursor-pointer hover:opacity-80 transition-opacity" onClick={onBack}>
            FASTAMOR
          </div>
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-[#3d4947] hover:text-[#00685f] transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform"/>
            BACK TO HOME
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-40 pb-24">

        {/* Header */}
        <header className="mb-16 border-b border-[#bcc9c6]/30 pb-12">
          <div className="inline-block px-3 py-1 bg-teal-50 text-[#00685f] text-[10px] font-black uppercase tracking-[0.2em] mb-6 rounded-full">
            Legal Document
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-[#1b1c19] leading-[1.1] mb-6 font-serif">
            Privacy<br/>Policy.
          </h1>
          <p className="text-[#3d4947] text-lg font-medium opacity-70">
            Last updated: {today}. This policy outlines how Fastamor collects, uses, and protects your information.
          </p>
        </header>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* Sidebar TOC */}
          <aside className="md:col-span-3 hidden md:block sticky top-32 h-fit">
            <ul className="space-y-4 text-xs font-black uppercase tracking-widest text-[#bcc9c6]">
              <li><a href="#intro" className="hover:text-[#00685f] transition-colors">01. Introduction</a></li>
              <li><a href="#collection" className="hover:text-[#00685f] transition-colors">02. Data We Collect</a></li>
              <li><a href="#partners" className="hover:text-[#00685f] transition-colors">03. Affiliate Partners</a></li>
              <li><a href="#ai" className="hover:text-[#00685f] transition-colors">04. AI & Claude</a></li>
              <li><a href="#tracking" className="hover:text-[#00685f] transition-colors">05. Cookies</a></li>
              <li><a href="#rights" className="hover:text-[#00685f] transition-colors">06. Your Rights</a></li>
              <li><a href="#contact" className="hover:text-[#00685f] transition-colors">07. Contact</a></li>
            </ul>
          </aside>

          {/* Main content */}
          <div className="md:col-span-9 space-y-16">

            <section id="intro">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">01. Introduction</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium">
                Fastamor ("we", "us", or "our") is an AI-powered travel concierge platform available at fastamor.com. We are committed to protecting your privacy and being transparent about how we handle your data. This policy applies to all users of our website, chat interface, and travel magazine.
              </p>
            </section>

            <section id="collection">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">02. Data We Collect</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-6">
                We collect minimal data necessary to provide our service:
              </p>
              <ul className="space-y-4">
                {[
                  { title: 'Chat Messages', desc: 'Your travel queries and preferences shared in conversations with our AI. These are processed in real-time and not stored permanently.' },
                  { title: 'Search Data', desc: 'Origins, destinations, and travel dates you search for. Used to fetch flight and travel prices from our partners.' },
                  { title: 'Usage Analytics', desc: 'Anonymous page views and click tracking to improve our service. No personally identifiable information is collected.' },
                  { title: 'Language Preference', desc: 'Your selected language (Arabic, French, Spanish, English) stored locally in your browser.' },
                ].map((item, i) => (
                  <li key={i} className="flex gap-4 p-5 bg-white border border-[#bcc9c6]/20 rounded-2xl">
                    <div className="w-2 h-2 rounded-full bg-[#0d9488] mt-2.5 shrink-0"/>
                    <div>
                      <p className="font-bold text-[#1b1c19] mb-1">{item.title}</p>
                      <p className="text-[#3d4947] text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section id="partners">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">03. Affiliate Partnerships</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-6">
                Fastamor participates in the Travelpayouts affiliate program. When you click booking links on our platform, we may earn a commission at no extra cost to you. Our affiliate partners include:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {['Aviasales', 'Intui Travel', 'Klook', 'Tiqets', 'GetTransfer', 'FlixBus', 'Sea Radar', 'Yesim eSIM', 'Compensair', 'AirHelp', 'LocalRent', 'EconomyBookings'].map(p => (
                  <div key={p} className="px-3 py-2 bg-white border border-[#bcc9c6]/20 rounded-xl text-sm font-medium text-[#3d4947] text-center">
                    {p}
                  </div>
                ))}
              </div>
              <div className="p-5 bg-teal-50 border border-teal-100 rounded-2xl">
                <p className="text-sm text-[#3d4947] leading-relaxed">
                  ℹ️ Each partner has their own privacy policy governing how they handle your data when you visit their site to complete a booking. We recommend reviewing their policies before proceeding with any purchase.
                </p>
              </div>
            </section>

            <section id="ai">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">04. AI & Claude API</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-4">
                Our AI travel assistant is powered by Claude (Anthropic). When you chat with Fastamor:
              </p>
              <ul className="space-y-3 text-[#3d4947]">
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> Your messages are sent to Anthropic's API for processing</li>
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> Anthropic may use conversations to improve their models, subject to their privacy policy</li>
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> We do not store chat history on our servers</li>
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> Do not share sensitive personal information (passport numbers, payment details) in the chat</li>
              </ul>
            </section>

            <section id="tracking">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">05. Cookies & Tracking</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-4">
                We use tracking technologies to attribute bookings and calculate affiliate commissions:
              </p>
              <ul className="space-y-3 text-[#3d4947]">
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> <strong>Travelpayouts tracking script</strong> — monitors affiliate link clicks for commission attribution</li>
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> <strong>Local Storage</strong> — saves your language preference and UI settings in your browser</li>
                <li className="flex gap-3"><span className="text-[#0d9488] font-bold shrink-0">→</span> <strong>Session data</strong> — temporary data cleared when you close your browser</li>
              </ul>
              <p className="mt-4 text-sm text-[#6d7a77]">
                You can disable cookies in your browser settings, though this may affect some features of our service.
              </p>
            </section>

            <section id="rights">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">06. Your Rights</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-4">
                Under GDPR and applicable privacy laws, you have the right to:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { icon: '🔍', title: 'Access', desc: 'Request a copy of any personal data we hold about you' },
                  { icon: '✏️', title: 'Rectification', desc: 'Request correction of inaccurate personal data' },
                  { icon: '🗑️', title: 'Erasure', desc: 'Request deletion of your personal data' },
                  { icon: '⛔', title: 'Object', desc: 'Object to processing of your personal data' },
                ].map((right, i) => (
                  <div key={i} className="p-4 bg-white border border-[#bcc9c6]/20 rounded-2xl">
                    <div className="text-2xl mb-2">{right.icon}</div>
                    <p className="font-bold text-[#1b1c19] mb-1">{right.title}</p>
                    <p className="text-sm text-[#3d4947]">{right.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section id="contact" className="pt-4 border-t border-[#bcc9c6]/20">
              <h2 className="text-2xl font-black text-[#1b1c19] mb-4 font-serif">07. Contact Us</h2>
              <div className="w-12 h-1 bg-[#0d9488] mb-6"/>
              <p className="text-[#3d4947] leading-relaxed text-lg font-medium mb-8">
                For any privacy-related questions, requests, or concerns, please contact our privacy team.
              </p>
              <a href="mailto:privacy@fastamor.com"
                className="inline-block bg-[#00685f] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:-translate-y-1">
                privacy@fastamor.com
              </a>
              <p className="mt-6 text-sm text-[#6d7a77]">
                We will respond to all legitimate requests within 30 days. For urgent matters, please indicate so in your subject line.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#bcc9c6]/15 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#bcc9c6] text-sm font-medium">© 2026 Fastamor. All rights reserved.</p>
          <p className="text-[#bcc9c6] text-xs font-medium uppercase tracking-widest">AI Travel Intelligence</p>
        </div>
      </footer>
    </div>
  );
}
