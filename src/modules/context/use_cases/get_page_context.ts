import type { PageContext } from "../models/context";
import { determine_page_context } from "./determine_page_context";

/**
 * Get the context of the current page
 * 
 * @returns PageContext object with information about the current page
 */
export function get_page_context(): PageContext {
    const url = window.location.href;
    const pageTitle = document.title;

    return determine_page_context(url, pageTitle);
} 