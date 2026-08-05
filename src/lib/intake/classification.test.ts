import { describe, expect, it } from "vitest";

import { categoryRoute, classifyCandidate, publicDepartmentFor } from "./classification";

const base = {
  category: "GAMES" as const,
  platform: null,
  subjects: [] as string[],
  title: "Example title",
  edition: null,
};

describe("intake classification", () => {
  it.each([
    ["Nintendo Switch", "Nintendo"],
    ["PlayStation 2", "PlayStation"],
    ["Xbox Series X", "Xbox"],
    ["Sega Mega Drive", "Retro Games"],
  ])("uses structured platform metadata for %s", (platform, department) => {
    expect(classifyCandidate({ ...base, platform }).publicDepartment).toBe(department);
  });

  it("does not make an ordinary old book rare", () => {
    const result = classifyCandidate({
      ...base,
      category: "RARE_COLLECTIBLE",
      title: "An old book",
      edition: "Published 1910",
    });
    expect(result.productCategory).toBe("BOOKS");
    expect(result.publicDepartment).toBe("Books");
  });

  it("accepts explicit rare evidence and a staff override", () => {
    expect(
      classifyCandidate({ ...base, category: "RARE_COLLECTIBLE", title: "Signed first edition" })
        .productCategory,
    ).toBe("RARE_COLLECTIBLE");
    expect(classifyCandidate({ ...base, category: "BOOKS" }, { rare: true }).productCategory).toBe(
      "RARE_COLLECTIBLE",
    );
  });

  it("maps categories to the approved Lovable routes", () => {
    expect(categoryRoute("BOOKS")).toBe("/library");
    expect(categoryRoute("GAMES", "Nintendo Switch")).toBe("/arcade?platform=Nintendo%20Switch");
    expect(categoryRoute("MUSIC_FILM")).toBe("/sound-vision");
    expect(categoryRoute("RARE_COLLECTIBLE")).toBe("/curiosity-cabinet");
  });

  it("keeps unknown consoles in More for staff review", () => {
    expect(publicDepartmentFor("CONSOLES", "Unknown platform")).toBe("More");
  });
});
