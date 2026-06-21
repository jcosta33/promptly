import { describe, it, expect } from "vitest";

import { PageCategory } from "../../context/models/context";
import {
  SelectionContextType,
  SelectionDataType,
} from "../../selection/models/selection";
import { get_all_actions } from "../repositories/actions_repository";

import { get_applicable_actions } from "./get_applicable_actions";

import type { ActionFilterCriteria } from "./get_applicable_actions";

// Characterization: an action surfaces only when the selection's contextTypes,
// dataTypes AND pageCategory all intersect the action's declared support.
// We probe with `product_analyze` ("Review"), the narrowest action in the
// catalogue: contextTypes [general, list, table]; dataTypes [text, paragraph,
// long_text, markdown, plain_text]; pageCategories [ecommerce] only.

const ids = (criteria: ActionFilterCriteria): string[] =>
  get_applicable_actions(criteria).map((action) => action.id);

// A criteria that intersects `product_analyze` on every axis.
const matchingCriteria: ActionFilterCriteria = {
  contextTypes: [SelectionContextType.GENERAL],
  dataTypes: [SelectionDataType.PARAGRAPH],
  pageCategory: PageCategory.ECOMMERCE,
};

describe("get_applicable_actions", () => {
  it("includes an action when context, data and page all intersect", () => {
    expect(ids(matchingCriteria)).toContain("product_analyze");
  });

  it("excludes the action when the context type does not intersect", () => {
    // INPUT is not among product_analyze's contextTypes.
    expect(
      ids({ ...matchingCriteria, contextTypes: [SelectionContextType.INPUT] }),
    ).not.toContain("product_analyze");
  });

  it("excludes the action when the data type does not intersect", () => {
    // WORD is not among product_analyze's dataTypes.
    expect(
      ids({ ...matchingCriteria, dataTypes: [SelectionDataType.WORD] }),
    ).not.toContain("product_analyze");
  });

  it("excludes the action when the page category does not intersect", () => {
    // product_analyze only supports ECOMMERCE pages.
    expect(
      ids({ ...matchingCriteria, pageCategory: PageCategory.NEWS }),
    ).not.toContain("product_analyze");
  });

  it("requires ALL THREE axes — two-of-three is not enough", () => {
    // Correct context + data, wrong page => still excluded.
    expect(
      ids({
        contextTypes: [SelectionContextType.TABLE],
        dataTypes: [SelectionDataType.LONG_TEXT],
        pageCategory: PageCategory.BLOG,
      }),
    ).not.toContain("product_analyze");
  });

  it("returns an empty list when a criteria axis is empty (nothing to intersect)", () => {
    // With no context types in the criteria, every action's
    // `contextTypes.some(...)` check is false, so nothing can pass.
    const result = ids({
      contextTypes: [],
      dataTypes: [SelectionDataType.PARAGRAPH],
      pageCategory: PageCategory.ECOMMERCE,
    });
    expect(result).toEqual([]);
  });

  it("every returned action genuinely intersects on all three axes", () => {
    // Cross-check the filter against the raw catalogue: anything it returns
    // must declare support overlapping the criteria on context, data and page.
    const criteria = matchingCriteria;
    const returned = get_applicable_actions(criteria);

    expect(returned.length).toBeGreaterThan(0);
    for (const action of returned) {
      expect(
        action.contextTypes.some((t) => criteria.contextTypes.includes(t)),
      ).toBe(true);
      expect(
        action.dataTypes.some((t) => criteria.dataTypes.includes(t)),
      ).toBe(true);
      expect(
        action.pageCategories.some((c) => criteria.pageCategory.includes(c)),
      ).toBe(true);
    }
  });

  it("a broad selection surfaces broadly-scoped actions (sanity on the catalogue)", () => {
    // `define` supports ANY context, [word, text] data, and ALL pages.
    const surfaced = ids({
      contextTypes: [SelectionContextType.GENERAL],
      dataTypes: [SelectionDataType.WORD],
      pageCategory: PageCategory.ECOMMERCE,
    });
    expect(surfaced).toContain("define");
    // ...but `define` is gone for a PARAGRAPH selection (word/text only).
    expect(ids(matchingCriteria)).not.toContain("define");
  });

  it("does not invent actions outside the real catalogue", () => {
    const catalogueIds = new Set(get_all_actions().map((a) => a.id));
    for (const id of ids(matchingCriteria)) {
      expect(catalogueIds.has(id)).toBe(true);
    }
  });
});
