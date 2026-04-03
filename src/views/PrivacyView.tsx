import { ArrowLeft } from 'lucide-react';

export function PrivacyView({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-surface px-4 py-4 flex items-center justify-between sticky top-0 shadow-sm">
        <div className="font-serif text-xl font-black tracking-widest text-foreground cursor-pointer" onClick={onBack}>
          FAST<span className="text-primary italic">AMOR</span>
        </div>
        <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-accent hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-black text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted mb-8 font-medium">Last updated: March 2026</p>

        <div className="space-y-8 text-foreground leading-relaxed font-medium">
          <section>
            <h2 className="text-xl font-black text-foreground mb-3">1. Information We Collect</h2>
            <p className="text-muted">Fastamor collects only information necessary to provide our AI travel concierge service — search queries and travel preferences shared in conversations. We do not require account creation or store personally identifiable booking details.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground mb-3">2. Affiliate Partnerships</h2>
            <p className="text-muted">We participate in Travelpayouts affiliate programs including Booking.com, Trip.com, GetYourGuide, Discover Cars, Klook, and Tiqets. We may earn a commission when you book via our links, at no extra cost to you. These partners have their own privacy policies governing your booking data.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground mb-3">3. Cookies & Tracking</h2>
            <p className="text-muted">We use tracking scripts and local storage to attribute bookings and calculate commissions anonymously. This ensures our service remains free to use while we earn referral fees.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-foreground mb-3">4. Contact</h2>
            <p className="text-muted">For questions about this policy, contact <a href="mailto:privacy@fastamor.com" className="text-primary font-bold hover:underline">privacy@fastamor.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
