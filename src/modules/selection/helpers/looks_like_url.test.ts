import { describe, it, expect } from "vitest";

import { looks_like_url } from "./looks_like_url";

describe("looks_like_url", () => {
  // Characterization: pins the true/false boundaries of the current implementation.
  // Branches: (1) reject when no dot / has a space / length < 4,
  //           (2) accept on an http(s):// or www. prefix,
  //           (3) accept a bare domain-like structure.

  const cases: Array<{ input: string; expected: boolean; why: string }> = [
    // --- positive: prefix branch ---
    { input: "https://example.com", expected: true, why: "https:// prefix" },
    { input: "http://example.com/path?q=1", expected: true, why: "http:// prefix with path" },
    { input: "www.x.com", expected: true, why: "www. prefix" },
    { input: "WWW.X.COM", expected: true, why: "prefix match is case-insensitive" },

    // --- positive: bare-domain branch ---
    { input: "example.com", expected: true, why: "bare domain, 3-letter+ TLD" },
    { input: "sub.example.co", expected: true, why: "subdomain + 2-letter TLD" },
    { input: "example.com/page", expected: true, why: "bare domain with a path" },

    // --- negative ---
    { input: "user@example.com", expected: false, why: "an email is not a URL (@ breaks the domain regex)" },
    { input: "this is spaced prose", expected: false, why: "contains spaces" },
    { input: "just plain text with no dot", expected: false, why: "contains spaces (and the dot check is moot)" },
    { input: "nodothere", expected: false, why: "no dot at all" },
    { input: "a.b", expected: false, why: "1-letter TLD fails the {2,} requirement" },
    { input: "...", expected: false, why: "dots only, no domain structure" },
    { input: "ab", expected: false, why: "shorter than the length-4 floor" },
    { input: "example.123", expected: false, why: "all-numeric TLD fails [a-zA-Z]{2,}" },
  ];

  it.each(cases)("returns $expected for '$input' ($why)", ({ input, expected }) => {
    expect(looks_like_url(input)).toBe(expected);
  });
});
