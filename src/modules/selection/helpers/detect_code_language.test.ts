import { describe, it, expect } from "vitest";

import { detect_code_language } from "./detect_code_language";

describe("detect_code_language", () => {
  // Characterization: a first-match-wins ladder of regexes returning a language
  // string, falling through to "plaintext". The ordering creates a few quirks,
  // which are pinned below.

  const cases: Array<{ input: string; expected: string; why: string }> = [
    // --- javascript: braces + a JS keyword/arrow ---
    { input: "const x = () => { return 1; }", expected: "javascript", why: "const + arrow + braces" },
    { input: "function add(a, b) { return a + b; }", expected: "javascript", why: "function + braces" },

    // --- typescript: braces + a TS-ish keyword (and no earlier JS keyword) ---
    { input: "interface Foo { bar: string; }", expected: "typescript", why: "interface + braces" },
    { input: "type Pair<T> = { a: T };", expected: "typescript", why: "type/generic + braces" },

    // --- html: an angle-bracket tag ---
    { input: '<div class="x">hi</div>', expected: "html", why: "lowercase HTML tag" },

    // --- python: def / bare class / __main__ guard (no braces) ---
    { input: "def add(a, b):\n    return a + b", expected: "python", why: "def keyword, no braces" },
    { input: "class Animal:\n    pass", expected: "python", why: "bare 'class' (no braces) lands on the python branch" },
    { input: 'import os\nif __name__ == "__main__":\n    pass', expected: "python", why: "__main__ guard" },

    // --- java: a Java type/modifier keyword, no braces, no 'class ' ---
    { input: "private int counter = 0;", expected: "java", why: "private/int, no braces" },
    { input: "String name = getName();", expected: "java", why: "String keyword" },

    // --- plaintext fallthrough ---
    { input: "The quick brown fox jumps over the lazy dog.", expected: "plaintext", why: "ordinary prose" },
    { input: "x = 5", expected: "plaintext", why: "an assignment with no detected language markers" },

    // --- precedence quirks worth locking in ---
    {
      input: "public class Main { void run() {} }",
      expected: "typescript",
      why: "Java-looking code with braces + 'class ' is caught by the typescript branch first",
    },
  ];

  it.each(cases)("classifies '$input' as $expected ($why)", ({ input, expected }) => {
    expect(detect_code_language(input)).toBe(expected);
  });
});
