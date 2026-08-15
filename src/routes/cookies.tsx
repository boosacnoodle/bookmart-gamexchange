import { createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/shop/LegalPage";
import { LEGAL_DOCS } from "@/data/legal";

const doc = LEGAL_DOCS.find((item) => item.slug === "cookies")!;

export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title: doc.metaTitle },
      { name: "description", content: doc.metaDescription },
      { property: "og:title", content: doc.metaTitle },
      { property: "og:description", content: doc.metaDescription },
      { property: "og:type", content: "website" },
    ],
  }),
  component: () => <LegalPage doc={doc} />,
});
