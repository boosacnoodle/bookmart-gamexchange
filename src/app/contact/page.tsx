import { ContactForm } from "@/components/forms";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <section className="page-hero"><div><h1>Contact</h1><p>Ask about a product, collection, wanted item or shop visit.</p></div></section>
      <section className="section compact"><ContactForm /></section>
    </>
  );
}
