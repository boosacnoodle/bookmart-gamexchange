import { WantedForm } from "@/components/forms";

export const metadata = { title: "Request an Item" };

export default function RequestItemPage() {
  return (
    <>
      <section className="page-hero"><div><h1>Looking for something?</h1><p>Request a book, author, ISBN, game, console, collectible or general category. Staff review matches before alerts are sent.</p></div></section>
      <section className="section compact"><WantedForm /></section>
    </>
  );
}
