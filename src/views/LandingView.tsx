import { MOCK_RESULTS, I18N, PARTNERS } from '@/lib/data';
import { trackClick } from '@/lib/tracking';
import { ArrowRight, Plane, Building2, Car, Ticket, Bus, Train, Ship, Palmtree } from 'lucide-react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onOpenApp: (svc?: string) => void;
  lang: string;
  setLang: (l: string) => void;
  onOpenPrivacy: () => void;
  adminTrigger: () => void;
}

export function LandingView({ onOpenApp, lang, setLang, onOpenPrivacy, adminTrigger }: LandingViewProps) {
  const t = I18N[lang as keyof typeof I18N] || I18N.en;

  // High-quality image fallbacks from Unsplash
  const IMAGES = {
    hero: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=2000",
    flight: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=800",
    hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800",
    tour: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800",
    transfer: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800",
    luxury: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=1200",
    cruise: "https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&q=80&w=1200"
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Announcement Bar */}
      <a href="https://aviasales.tpx.gr/EDLTCi50" target="_blank" onClick={() => trackClick()} 
         className="block bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-black text-center py-2.5 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm">
        {t.flash_sale}
      </a>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="font-serif text-2xl font-black tracking-widest text-foreground cursor-pointer select-none">
            FAST<span className="text-primary italic">AMOR</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#services" className="text-sm font-medium text-muted hover:text-primary transition-colors">{t.services}</a>
            <a href="#destinations" className="text-sm font-medium text-muted hover:text-primary transition-colors">{t.discover}</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-surface rounded-full p-1 border border-border shadow-sm">
              {['en', 'ar', 'fr', 'es'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  className={`px-3 py-1 text-xs font-bold uppercase rounded-full transition-colors ${lang === l ? 'bg-primary text-white' : 'text-muted hover:text-primary'}`}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={() => onOpenApp()} className="bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-black px-6 py-2.5 rounded-full font-bold text-sm hover:shadow-[0_4px_20px_rgba(255,107,53,0.4)] transition-all transform hover:-translate-y-0.5">
              {t.join}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden border-b border-border">
        {/* Full-bleed hero photo */}
        <img
          src={IMAGES.hero}
          alt="Elegant traveller"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Warm cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-32 text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold text-xs uppercase tracking-widest mb-6">
            {t.hero_badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-tight mb-6 drop-shadow-2xl">
            {t.hero_title} <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD23F] to-[#FF6B35] italic">FASTAMOR</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/85 max-w-xl mb-10 font-medium leading-relaxed">
            {t.hero_desc}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start gap-4">
            <button onClick={() => onOpenApp()} className="px-8 py-4 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFD23F] text-white font-black text-lg hover:shadow-[0_10px_30px_rgba(255,107,53,0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-1">
              🚀 {t.hero_btn_start}
            </button>
            <a href="#how" className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold text-lg hover:bg-white/20 transition-all text-center">
              {t.hero_btn_how}
            </a>
          </motion.div>
        </div>
      </section>

      {/* Services Strip */}
      <div className="border-b border-border bg-gradient-to-r from-[#00C9B1]/10 via-[#FFD23F]/10 to-[#FF6B35]/10 py-4 overflow-hidden">
        <div className="flex gap-8 whitespace-nowrap px-4 animate-marquee">
          {[1,2].map(k => (
            <div key={k} className="flex gap-12 items-center">
              <a href="https://aviasales.tpx.gr/EDLTCi50" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider text-sm"><Plane size={16} className="text-primary"/> {t.cheap_flights}</a>
              <a href="https://booking.tpx.gr/EWmbrXYx" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors font-bold uppercase tracking-wider text-sm"><Building2 size={16} className="text-secondary"/> {t.top_hotels}</a>
              <a href="https://getyourguide.tpx.gr/XMdfzvoV" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-accent transition-colors font-bold uppercase tracking-wider text-sm"><Ticket size={16} className="text-accent"/> {t.experiences}</a>
              <a href="https://searadar.tpx.gr/PdA1Y1ul" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-info transition-colors font-bold uppercase tracking-wider text-sm"><Ship size={16} className="text-info"/> {t.cruises}</a>
              <a href="https://discovercars.tpx.gr/9pGzpviq" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-bold uppercase tracking-wider text-sm"><Car size={16} className="text-primary"/> {t.car_rental}</a>
              <a href="https://omio.tpx.gr/HhKpT0j2" target="_blank" onClick={() => trackClick()} className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors font-bold uppercase tracking-wider text-sm"><Train size={16} className="text-secondary"/> {t.trains_buses}</a>
            </div>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-4">{t.book_everything}</h2>
          <p className="text-muted text-lg font-medium">{t.itinerary_desc}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={() => onOpenApp('flight')} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left">
            <img src={IMAGES.flight} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Flights" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B35]/90 via-[#FF6B35]/40 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Plane size={20}/></div>
              <h3 className="text-xl font-black text-white drop-shadow-md">{t.cheap_flights}</h3>
            </div>
          </button>
          
          <button onClick={() => onOpenApp('hotel')} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left">
            <img src={IMAGES.hotel} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Hotels" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#00C9B1]/90 via-[#00C9B1]/40 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Building2 size={20}/></div>
              <h3 className="text-xl font-black text-white drop-shadow-md">{t.top_hotels}</h3>
            </div>
          </button>

          <button onClick={() => onOpenApp('experience')} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left">
            <img src={IMAGES.tour} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Tours" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#FFD23F]/90 via-[#FFD23F]/40 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Ticket size={20}/></div>
              <h3 className="text-xl font-black text-white drop-shadow-md">{t.experiences}</h3>
            </div>
          </button>

          <button onClick={() => onOpenApp('taxi')} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left">
            <img src={IMAGES.transfer} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Transfers" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#4ECDC4]/90 via-[#4ECDC4]/40 to-transparent mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Car size={20}/></div>
              <h3 className="text-xl font-black text-white drop-shadow-md">{t.car_rental}</h3>
            </div>
          </button>

          <a href="https://searadar.tpx.gr/PdA1Y1ul" target="_blank" onClick={() => trackClick()} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left md:col-span-2">
            <img src={IMAGES.cruise} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Ship size={20}/></div>
              <h3 className="text-xl font-black text-white mb-1 drop-shadow-sm">{t.cruises}</h3>
              <p className="text-sm text-white/90 font-medium">Explore ocean adventures</p>
            </div>
          </a>

          <a href="https://hotels.tpx.gr/HZcgZ2jB" target="_blank" onClick={() => trackClick()} className="group relative h-48 md:h-64 rounded-3xl overflow-hidden shadow-lg border border-border text-left md:col-span-2">
            <img src={IMAGES.luxury} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
            <div className="absolute bottom-6 left-6 z-10">
              <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur text-white flex items-center justify-center mb-3 shadow-lg"><Palmtree size={20}/></div>
              <h3 className="text-xl font-black text-white mb-1 drop-shadow-sm">{t.luxury_resorts}</h3>
              <p className="text-sm text-white/90 font-medium">All-inclusive getaways</p>
            </div>
          </a>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-24 bg-surface border-y border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-black text-foreground mb-4">{t.how_it_works}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-20 z-0 rounded-full"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface border-[6px] border-primary flex items-center justify-center text-3xl font-black text-primary mb-6 shadow-[0_10px_30px_rgba(255,107,53,0.2)]">01</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.step1_title}</h3>
              <p className="text-muted font-medium">{t.step1_desc}</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface border-[6px] border-accent flex items-center justify-center text-3xl font-black text-accent mb-6 shadow-[0_10px_30px_rgba(255,210,63,0.2)]">02</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.step2_title}</h3>
              <p className="text-muted font-medium">{t.step2_desc}</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface border-[6px] border-secondary flex items-center justify-center text-3xl font-black text-secondary mb-6 shadow-[0_10px_30px_rgba(0,201,177,0.2)]">03</div>
              <h3 className="text-xl font-bold text-foreground mb-3">{t.step3_title}</h3>
              <p className="text-muted font-medium">{t.step3_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations & Promos */}
      <section id="destinations" className="py-24 px-4 max-w-7xl mx-auto">
        <a href="https://getyourguide.tpx.gr/XMdfzvoV" target="_blank" onClick={() => trackClick()} className="block bg-gradient-to-r from-[#FFD23F] to-[#FF6B35] rounded-3xl p-8 md:p-12 mb-16 text-center transform hover:scale-[1.02] transition-transform shadow-xl">
          <p className="text-white font-black uppercase tracking-widest mb-2 text-sm drop-shadow-md">Exclusive Partner Offer</p>
          <h3 className="text-3xl md:text-4xl font-serif font-black text-white mb-4 drop-shadow-md">Unforgettable Local Experiences</h3>
          <p className="text-white/90 font-bold max-w-xl mx-auto text-lg">Book the world's best tours and attractions. Skip the line and save big.</p>
        </a>

        <div className="grid md:grid-cols-3 gap-6">
          <a href="https://aviasales.tpx.gr/EDLTCi50" target="_blank" onClick={() => trackClick()} className="md:col-span-2 group rounded-3xl overflow-hidden relative h-[400px] shadow-lg">
            <img src={IMAGES.hero} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Flights" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <span className="bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded-full mb-4 inline-block shadow-md">Featured</span>
              <h3 className="text-3xl font-serif font-black text-white mb-2 drop-shadow-md">Fly First Class for Less</h3>
              <p className="text-white/80 font-medium">Discover secret premium cabin deals on Aviasales.</p>
            </div>
          </a>
          
          <div className="space-y-6">
            <a href="https://booking.tpx.gr/EWmbrXYx" target="_blank" onClick={() => trackClick()} className="block group rounded-3xl overflow-hidden relative h-[188px] shadow-lg">
              <img src={IMAGES.hotel} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Hotels" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Luxury Rooftops</h3>
                <p className="text-sm text-accent font-black drop-shadow-md">Save 20% on Booking.com</p>
              </div>
            </a>
            <a href="https://discovercars.tpx.gr/9pGzpviq" target="_blank" onClick={() => trackClick()} className="block group rounded-3xl overflow-hidden relative h-[188px] shadow-lg">
              <img src={IMAGES.transfer} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Cars" />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
              <div className="absolute bottom-6 left-6">
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">Premium Rentals</h3>
                <p className="text-sm text-secondary font-black drop-shadow-md">Discover Cars</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Partners Strip */}
      <div className="border-y border-border py-10 bg-gradient-to-b from-surface to-[#FFF8F0]">
        <p className="text-center text-xs font-black text-muted uppercase tracking-widest mb-8">Trusted Global Partners</p>
        <div className="flex gap-12 whitespace-nowrap px-4 animate-marquee opacity-70">
          {[1,2,3].map(k => (
            <div key={k} className="flex gap-12 items-center">
              {PARTNERS.map(p => (
                <span key={p.name} className="font-serif font-bold text-xl text-foreground mix-blend-multiply">{p.name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35] via-[#FFD23F] to-[#00C9B1]"></div>
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px]"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-4xl md:text-6xl font-serif font-black text-white mb-6 drop-shadow-lg">Ready to travel <br className="md:hidden"/><em className="text-white underline decoration-wavy decoration-[#00C9B1]">smarter?</em></h2>
          <p className="text-xl text-white/90 mb-10 font-bold max-w-2xl mx-auto drop-shadow-md">Your AI concierge is ready. Start a conversation now and find the best deals under the sun.</p>
          <button onClick={() => onOpenApp()} className="bg-white text-primary px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-[0_20px_40px_rgba(0,0,0,0.2)]">
            Start Planning Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D3B38] text-white/80 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="font-serif text-2xl font-black tracking-widest text-white mb-4">FAST<span className="text-[#FF6B35] italic">AMOR</span></div>
              <p className="text-white/60 text-sm leading-relaxed font-medium">Boutique travel concierge — instant joy, best deals. Driven by AI, trusted by travelers worldwide.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{t.services}</h4>
              <ul className="space-y-3">
                <li><button onClick={() => onOpenApp('flight')} className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.cheap_flights}</button></li>
                <li><button onClick={() => onOpenApp('hotel')} className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.top_hotels}</button></li>
                <li><button onClick={() => onOpenApp('taxi')} className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.car_rental}</button></li>
                <li><button onClick={() => onOpenApp('experience')} className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.experiences}</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Top Partners</h4>
              <ul className="space-y-3">
                <li><a href="https://booking.tpx.gr/pO1xgUOk" target="_blank" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Booking.com</a></li>
                <li><a href="https://trip.tpx.gr/xuZyhawM" target="_blank" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Trip.com</a></li>
                <li><a href="https://getyourguide.tpx.gr/N4hqBYBh" target="_blank" className="text-white/60 hover:text-white transition-colors text-sm font-medium">GetYourGuide</a></li>
                <li><a href="https://aviasales.tpx.gr/EDLTCi50" target="_blank" className="text-white/60 hover:text-white transition-colors text-sm font-medium">Aviasales</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-3">
                <li><button onClick={onOpenPrivacy} className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.privacy}</button></li>
                <li><a href="mailto:contact@fastamor.com" className="text-white/60 hover:text-white transition-colors text-sm font-medium">{t.contact_us}</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm cursor-pointer select-none font-medium" onClick={adminTrigger}>© 2026 Fastamor. {t.rights}</p>
            <p className="text-white/40 text-xs font-medium">{t.powered_by}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
