import { SellTradeForm } from "@/components/forms";

export const metadata = { title: "Sell or Trade" };

export default function SellOrTradePage() {
  return (
    <>
      <section className="page-hero"><div><h1>Sell or trade with us</h1><p>Submit books, games, consoles or collections for an initial review. Online estimates remain subject to physical inspection in the shop.</p></div></section>
      <section className="section compact">
        <div className="feature-grid">
          <div className="feature-card"><span>1</span><h3>Describe the items</h3><p>Tell staff what you have, including condition and whether you prefer cash or store credit.</p></div>
          <div className="feature-card"><span>2</span><h3>Add photos in person or later</h3><p>Milestone 7 adds saved submissions and uploads; this public page already validates enquiries.</p></div>
          <div className="feature-card"><span>3</span><h3>Bring them to Talbot Street</h3><p>Final offers depend on seeing the physical items.</p></div>
        </div>
        <SellTradeForm />
      </section>
    </>
  );
}
