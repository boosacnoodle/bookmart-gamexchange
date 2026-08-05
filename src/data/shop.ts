/**
 * The shop itself: one place for the details a customer actually needs.
 * Used by the counter, the visit panel and the bar so they can never drift.
 */
export const SHOP = {
  name: "Bookmart & GameXchange",
  street: "73 Talbot Street",
  city: "Dublin 1",
  country: "Ireland",
  phone: "+353 1 878 8925",
  phoneHref: "tel:+35318788925",
  email: "hello@bookmart.ie",
  emailHref: "mailto:hello@bookmart.ie",
  maps: "https://www.google.com/maps/search/?api=1&query=73+Talbot+Street%2C+Dublin+1",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=73+Talbot+Street%2C+Dublin+1",
  hours: [
    { days: "Monday – Saturday", time: "10am – 7pm" },
    { days: "Sunday", time: "12pm – 6pm" },
  ],
  closingLine: "Open until 7pm",
} as const;
