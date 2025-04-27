/**
 * Page context categories as defined in prd.md
 * These categories are used to determine which actions are appropriate for a given page
 */
export enum PageCategory {
  NEWS = "news",
  BLOG = "blog",
  DEV_DOCS = "devdocs",
  SCIENTIFIC = "scientific",
  SOCIAL = "social",
  FORUM = "forum",
  ECOMMERCE = "ecommerce",
  WIKI = "wiki",
  EMAIL = "email",
  PRODUCTIVITY = "productivity",
  CODE_REPO = "coderepo",
  EDUCATION = "education",
  VIDEO = "video",
  MUSIC = "music",
  DOCUMENTATION = "documentation",
  TRAVEL = "travel",
  HEALTH = "health",
  FINANCE = "finance",
  GENERAL = "general",
  GAMING = "gaming",
  BETTING = "betting",
  CASINO = "casino",
  SPORTS = "sports",
  POLLING = "polling",
  VOTING = "voting",
  LEARNING = "learning",
  QUIZZES = "quizzes",
  POLITICAL = "political",
  JOBS = "jobs",
  LEGISLATION = "legislation",
  LAW = "law",
  GOVERNMENT = "government",
  HISTORY = "history",
  RADIO = "radio",
  COMICS = "comics",
  ANIME = "anime",
  Manga = "manga",
  LITERATURE = "literature",
  ART = "art",
  CINEMA = "cinema",
  TELEVISION = "television",
  BOOKS = "books",
  MAGAZINES = "magazines",
  NEWSPAPERS = "newspapers",
  JOURNALS = "journals",
  TEXTBOOKS = "textbooks",
  ENCYCLOPEDIAS = "encyclopedias",
}

/**
 * A URL pattern for matching a domain to a page category
 */
export type DomainPattern = {
  /**
   * Regular expression pattern to match against the URL
   */
  pattern: string;

  /**
   * Page category to assign if the pattern matches
   */
  category: PageCategory;

  /**
   * Optional description of the pattern for debugging/documentation
   */
  description?: string;
};

/**
 * Information about the categorized page
 */
export type PageContext = {
  /**
   * The determined page category
   */
  category: PageCategory;

  /**
   * The URL that was categorized
   */
  url: string;

  /**
   * The domain of the URL
   */
  domain: string;

  /**
   * Optional page title if available
   */
  pageTitle?: string;
};
