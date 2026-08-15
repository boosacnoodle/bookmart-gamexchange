export type LegalDoc = {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  lastUpdated: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    metaTitle: "Privacy Policy | Bookmart & GameXchange",
    metaDescription:
      "How Bookmart & GameXchange collects, uses and protects your personal data, and your rights under the GDPR.",
    lastUpdated: "15 August 2026",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          "Bookmart & GameXchange is a second-hand shop selling books, games, music, film and collectables. Our shop is at 73 Talbot Street, Dublin 1 (D01 TW28), Ireland.",
          "We are the data controller for any personal information collected through this website. This policy explains what we collect, why, and the choices you have.",
        ],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you place an order or contact us, we may collect: your name, email address, phone number, delivery address, and order details.",
          "We do not see or store your full card details. Payments are handled by Stripe, a separate payment processor, which processes your card information under its own security and privacy commitments.",
        ],
      },
      {
        heading: "Why we collect it (our legal bases)",
        paragraphs: [
          "We process your personal data to fulfil your orders and provide our service (performance of a contract).",
          "We keep basic records as required by law, including tax and accounting obligations (legal obligation).",
          "We may use your email to send order updates and receipts. We will not send marketing without your consent.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We share only what is necessary: with Stripe to process payments, and with a delivery or courier service if you ask us to post an item to you.",
          "We do not sell, rent or trade your personal data to anyone.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "We keep order and payment records for as long as required by Irish tax and accounting law, and no longer than necessary for the purposes described here.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "Under the General Data Protection Regulation (GDPR) you have the right to access, correct, delete, restrict or object to the processing of your personal data, and the right to data portability.",
          "To exercise any of these rights, contact us using the details below. You also have the right to complain to the Data Protection Commission (dataprotection.ie) if you believe your data has been handled unlawfully.",
        ],
      },
      {
        heading: "Cookies",
        paragraphs: [
          "Our website uses a small number of essential cookies to function, and loads fonts from Google Fonts. See our Cookie Policy for details.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "For any privacy question, email us at hello@gamexchange.ie or write to Bookmart & GameXchange, 73 Talbot Street, Dublin 1, D01 TW28, Ireland.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms & Conditions",
    metaTitle: "Terms & Conditions | Bookmart & GameXchange",
    metaDescription:
      "The terms that apply when you buy from Bookmart & GameXchange, including ordering, payment, delivery and returns.",
    lastUpdated: "15 August 2026",
    sections: [
      {
        heading: "These terms",
        paragraphs: [
          "These terms apply to all purchases made through this website from Bookmart & GameXchange, 73 Talbot Street, Dublin 1, Ireland. By placing an order you agree to them.",
        ],
      },
      {
        heading: "Orders",
        paragraphs: [
          "An order becomes a binding contract when we accept it and confirm it to you. We may decline an order, for example if an item is no longer available or there is a pricing error.",
        ],
      },
      {
        heading: "Prices and payment",
        paragraphs: [
          "Prices are shown in euro and include VAT where applicable. Payment is taken securely through Stripe. We do not store your card details.",
        ],
      },
      {
        heading: "Delivery and collection",
        paragraphs: [
          "You can collect your order in person from our Talbot Street shop, or choose delivery to an address in Ireland. Delivery times and any delivery charge are shown at checkout.",
        ],
      },
      {
        heading: "Returns and your right to cancel",
        paragraphs: [
          "You have a legal right to cancel most online orders within 14 days for a full refund. See our Returns Policy for how this works, including any exceptions that apply to second-hand goods.",
        ],
      },
      {
        heading: "Second-hand condition",
        paragraphs: [
          "Everything we sell is second-hand. We describe and grade each item honestly, and the condition is stated on the listing. Minor wear consistent with age and use is part of buying second-hand and is not a fault.",
        ],
      },
      {
        heading: "Our liability",
        paragraphs: [
          "Nothing in these terms limits your statutory rights as a consumer, including your rights where goods are faulty or not as described. To the extent permitted by law, our liability is limited to the price you paid for the item.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          "These terms are governed by the law of Ireland, and any dispute is subject to the jurisdiction of the Irish courts.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          "Questions about these terms? Email hello@gamexchange.ie or write to Bookmart & GameXchange, 73 Talbot Street, Dublin 1, D01 TW28, Ireland.",
        ],
      },
    ],
  },
  {
    slug: "returns",
    title: "Returns Policy",
    metaTitle: "Returns & Refunds | Bookmart & GameXchange",
    metaDescription:
      "How to return or cancel an online order from Bookmart & GameXchange, including your 14-day right of withdrawal.",
    lastUpdated: "15 August 2026",
    sections: [
      {
        heading: "Your right to cancel",
        paragraphs: [
          "Under EU and Irish consumer law, when you buy online you have a 14-day right of withdrawal. This means you can cancel your order within 14 days of receiving it and get a full refund, for most items, without giving a reason.",
        ],
      },
      {
        heading: "How to cancel or return",
        paragraphs: [
          "To cancel, contact us within 14 days of receiving the item, stating you wish to withdraw from the purchase. You can email hello@gamexchange.ie or return the item in person to 73 Talbot Street, Dublin 1.",
          "Once you have told us, return the item within 14 days. You pay the cost of returning the item unless we agree otherwise.",
        ],
      },
      {
        heading: "Refunds",
        paragraphs: [
          "We will refund you within 14 days of receiving the returned item (or of you providing proof you sent it back), using the same payment method you used to pay.",
        ],
      },
      {
        heading: "Faulty or misdescribed items",
        paragraphs: [
          "If an item is faulty or not as described, you have additional legal rights, including repair, replacement or a refund. Tell us as soon as possible and we will put it right. Second-hand items are covered by these rights just like new ones.",
        ],
      },
      {
        heading: "Exceptions",
        paragraphs: [
          "A small number of items are exempt from the 14-day cancellation right, for example sealed audio, video or software that has been opened. Where an exception applies we will say so clearly at the point of sale.",
        ],
      },
      {
        heading: "Beyond your legal rights",
        paragraphs: [
          "We do not offer returns or exchanges for a change of mind outside the 14-day legal window. Second-hand items are sold as described and are not returnable simply because you changed your mind.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    metaTitle: "Cookie Policy | Bookmart & GameXchange",
    metaDescription:
      "What cookies Bookmart & GameXchange uses on this website, what they do, and how to manage them.",
    lastUpdated: "15 August 2026",
    sections: [
      {
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small text files stored on your device when you visit a website. They help a site work and remember things like the contents of your basket.",
        ],
      },
      {
        heading: "Cookies we use",
        paragraphs: [
          "We use only essential cookies: a session cookie to keep you signed in and remember your basket while you browse. These are necessary for the site to function and cannot be switched off.",
          "Our site loads fonts from Google Fonts. Google may set a cookie to deliver this service; for details see Google's own privacy policy.",
        ],
      },
      {
        heading: "Analytics and advertising",
        paragraphs: [
          "We do not currently use advertising or marketing cookies, and we do not track you across other websites.",
        ],
      },
      {
        heading: "Managing cookies",
        paragraphs: [
          "Most browsers let you view, block or delete cookies in their settings. Blocking essential cookies may stop parts of the shop (like the basket or checkout) from working correctly.",
        ],
      },
      {
        heading: "Changes",
        paragraphs: [
          "If we change how we use cookies we will update this page and, where required, ask for your consent again.",
        ],
      },
    ],
  },
];
