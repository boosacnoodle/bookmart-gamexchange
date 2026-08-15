import { createFileRoute, Link } from "@tanstack/react-router";

import { ShopPage } from "@/components/shop/ShopPage";
import { SHOP } from "@/data/shop";
import { useList } from "@/lib/shop-lists";

const TITLE = "Your card — Bookmart & GameXchange";
const DESCRIPTION =
  "Your counter, your watch list and how to reach Bookmart & GameXchange, the second-hand shop on Talbot Street, Dublin 1.";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Account,
});

function Account() {
  const basket = useList("basket");
  const wishlist = useList("wishlist");

  return (
    <ShopPage
      eyebrow="Behind the counter"
      title="Your card"
      intro="No sign-up, no newsletter. Your counter and your watch list are kept on this device, the way a paper card would stay in your pocket."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card
          to="/basket"
          label="On the counter"
          value={`${basket.length} ${basket.length === 1 ? "item" : "items"}`}
          note="Things you have put down to buy."
        />
        <Card
          to="/wishlist"
          label="Keeping an eye out"
          value={`${wishlist.length} ${wishlist.length === 1 ? "item" : "items"}`}
          note="Things we are watching for you."
        />
      </div>

      <div
        className="mt-4 grid gap-6 rounded-sm bg-timber-deep/65 p-6 sm:grid-cols-2 sm:p-8"
        style={{ boxShadow: "var(--shadow-plate)" }}
      >
        <div className="min-w-0">
          <p className="pixel-label text-brass/65">Talk to a person</p>
          <ul className="mt-4 grid gap-3 text-[0.9rem] leading-[1.6] text-foreground/75">
            <li>
              <a
                href={SHOP.emailHref}
                className="text-lamplight/90 transition-colors hover:text-lamplight"
              >
                {SHOP.email}
              </a>
            </li>
            <li>
              <Link to="/trade" className="text-brass/80 transition-colors hover:text-lamplight">
                Selling something? Ring the bell &rarr;
              </Link>
            </li>
          </ul>
        </div>
        <div className="min-w-0">
          <p className="pixel-label text-brass/65">Staff door</p>
          <p className="measure mt-4 text-[0.86rem] leading-[1.7] text-foreground/55">
            Staff and admin sign-in runs on the shop&rsquo;s own till system, through the door at
            the back. It is not open to the street.
          </p>
        </div>
      </div>
    </ShopPage>
  );
}

function Card({
  to,
  label,
  value,
  note,
}: {
  to: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-sm bg-timber-deep/65 p-6 transition-shadow duration-200 ease-[var(--ease-brass)] hover:shadow-[var(--shadow-plate),0_0_0_1px_color-mix(in_oklab,var(--brass)_28%,transparent)_inset] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass sm:p-8"
      style={{ boxShadow: "var(--shadow-plate)" }}
    >
      <p className="pixel-label text-brass/65">{label}</p>
      <p className="sign-plate mt-3 text-[1.35rem] text-lamplight">{value}</p>
      <p className="mt-2 text-[0.85rem] leading-[1.7] text-foreground/55">{note}</p>
      <span className="shop-meta mt-5 inline-flex text-brass/70 transition-colors group-hover:text-lamplight">
        Open &rarr;
      </span>
    </Link>
  );
}
