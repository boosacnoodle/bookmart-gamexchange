import Link from "next/link";
import { MapPin, Phone } from "lucide-react";

export const metadata = { title: "Visit Us" };

export default function VisitUsPage() {
  return (
    <section className="section">
      <div className="section-head">
        <h1>Visit our Talbot Street shop</h1>
        <p>73 Talbot Street, Dublin 1. Opening hours, telephone and email should be confirmed by the owner before launch.</p>
      </div>
      <div className="feature-grid">
        <div className="feature-card"><span>Address</span><h3>73 Talbot Street, Dublin 1</h3><p>Close to the city centre and public transport. Map links can be configured once the owner approves exact embeds.</p><Link href="https://www.google.com/maps/search/?api=1&query=73%20Talbot%20Street%2C%20Dublin%201" className="button button-primary"><MapPin size={18} /> Open map</Link></div>
        <div className="feature-card"><span>Click and collect</span><h3>Reserve online, collect in person.</h3><p>Checkout will show collection instructions when Stripe and order handling are configured.</p><Link href="/basket" className="button button-secondary">View basket</Link></div>
        <div className="feature-card"><span>Contact</span><h3>Questions about stock?</h3><p>Use the contact form for product questions or wanted-item requests.</p><Link href="/contact" className="button button-secondary"><Phone size={18} /> Contact the shop</Link></div>
      </div>
    </section>
  );
}
