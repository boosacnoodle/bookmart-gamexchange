import { BasketView } from "@/components/basket-view";

export const metadata = { title: "Basket" };

export default function BasketPage() {
  return (
    <>
      <section className="page-hero"><div><h1>Basket</h1><p>Review one-off items before secure checkout.</p></div></section>
      <BasketView />
    </>
  );
}
