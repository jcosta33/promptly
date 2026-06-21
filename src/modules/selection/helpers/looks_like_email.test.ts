import { describe, it, expect } from "vitest";

import { looks_like_email } from "./looks_like_email";

describe("looks_like_email", () => {
  // Characterization: pins the email regex
  // /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/ run on text.trim().

  const cases: Array<{ input: string; expected: boolean; why: string }> = [
    // --- positive ---
    { input: "user@example.com", expected: true, why: "plain address" },
    { input: "first.last@example.co.uk", expected: true, why: "dotted local + multi-label domain" },
    { input: "user+tag@example.com", expected: true, why: "+ is allowed in the local part" },
    { input: "  user@example.com  ", expected: true, why: "surrounding whitespace is trimmed first" },

    // --- negative ---
    { input: "user@example", expected: false, why: "no dotted TLD" },
    { input: "userexample.com", expected: false, why: "no @ at all" },
    { input: "user@@example.com", expected: false, why: "double @ — local part rejects the second @" },
    { input: "user @example.com", expected: false, why: "internal space (not edge whitespace) breaks the match" },
    { input: "user@example.c", expected: false, why: "1-letter TLD fails the {2,} requirement" },
    { input: "https://example.com", expected: false, why: "a URL is not an email" },
  ];

  it.each(cases)("returns $expected for '$input' ($why)", ({ input, expected }) => {
    expect(looks_like_email(input)).toBe(expected);
  });
});
