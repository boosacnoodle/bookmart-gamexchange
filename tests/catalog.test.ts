import { describe, expect, it } from "vitest";
import { demoProducts } from "../src/lib/demo-data";
import { conditionLabel, formatMoney } from "../src/lib/format";

function searchProducts(query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return demoProducts.filter((product) => {
    const text = [
      product.title,
      product.creator,
      product.publisher,
      product.platform,
      product.format,
      product.isbn,
      product.ean,
      product.sku,
      product.shortDescription,
      product.description,
      product.subcategory
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

describe("demo catalogue", () => {
  it("labels every product as fictional demo inventory", () => {
    expect(demoProducts.length).toBeGreaterThan(0);
    expect(demoProducts.every((product) => product.title.startsWith("Fictional Demo:"))).toBe(true);
    expect(demoProducts.every((product) => product.description.includes("Fictional demo inventory."))).toBe(true);
  });

  it("supports title, SKU and platform search terms", () => {
    expect(searchProducts("docklands")).toHaveLength(1);
    expect(searchProducts("BMGX-DEMO-0004")).toHaveLength(1);
    expect(searchProducts("PlayStation 2")).toHaveLength(1);
  });

  it("formats money and condition labels for product cards", () => {
    expect(formatMoney(950)).toBe("€9.50");
    expect(conditionLabel("STAFF_REVIEWED_COLLECTIBLE")).toBe("Staff-reviewed collectible");
  });
});
