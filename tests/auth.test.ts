import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../src/lib/password";

describe("password hashing", () => {
  it("accepts the original password and rejects a different one", () => {
    const hash = hashPassword("Staff123!");
    expect(verifyPassword("Staff123!", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });
});
