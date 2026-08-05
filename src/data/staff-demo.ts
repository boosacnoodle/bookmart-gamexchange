/**
 * Example jobs sitting on the counter. Test data only — this is what the
 * back office will read from the till system once it is wired up.
 */
export type StaffJob = {
  id: string;
  title: string;
  detail: string;
  when: string;
  urgent?: boolean;
};

export const ORDERS_NEEDING_ATTENTION: StaffJob[] = [
  {
    id: "ord-4821",
    title: "Wrap and post — Rumours, Fleetwood Mac",
    detail: "Paid Saturday. Posting to Cork.",
    when: "Waiting 2 days",
    urgent: true,
  },
  {
    id: "ord-4823",
    title: "Hold at counter — Metal Gear Solid",
    detail: "Collecting today, name of Byrne.",
    when: "Collect today",
  },
  {
    id: "ord-4824",
    title: "Answer a question — boxed Stormtrooper",
    detail: "Asked whether the bubble is cracked.",
    when: "Asked yesterday",
  },
];

export const NEEDS_REVIEW: StaffJob[] = [
  {
    id: "rev-1",
    title: "Two books have no price",
    detail: "Scanned on Friday, never finished.",
    when: "Friday",
  },
  {
    id: "rev-2",
    title: "One game has no photos",
    detail: "Nintendo shelf. Needs a picture before it goes up.",
    when: "Saturday",
  },
];
