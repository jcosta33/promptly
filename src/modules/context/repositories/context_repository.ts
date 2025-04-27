import { DomainPattern, PageCategory } from "../models/context";

/**
 * Domain mappings for categorizing URLs
 *
 * These mappings are used to determine the category of a webpage based on its URL.
 * Simple contains check is performed against the URL.
 */
const DOMAIN_MAPPINGS: { domain: string; category: PageCategory }[] = [
  // --- News --- (General & Financial)
  { domain: "nytimes.com", category: PageCategory.NEWS },
  { domain: "washingtonpost.com", category: PageCategory.NEWS },
  { domain: "bbc.com", category: PageCategory.NEWS },
  { domain: "bbc.co.uk", category: PageCategory.NEWS },
  { domain: "reuters.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "apnews.com", category: PageCategory.NEWS },
  { domain: "cnn.com", category: PageCategory.NEWS },
  { domain: "foxnews.com", category: PageCategory.NEWS },
  { domain: "aljazeera.com", category: PageCategory.NEWS },
  { domain: "news.google.com", category: PageCategory.NEWS },
  { domain: "theguardian.com", category: PageCategory.NEWS },
  { domain: "bloomberg.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "wsj.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "economist.com", category: PageCategory.NEWS },
  { domain: "nbcnews.com", category: PageCategory.NEWS },
  { domain: "abcnews.go.com", category: PageCategory.NEWS },
  { domain: "cbsnews.com", category: PageCategory.NEWS },
  { domain: "usatoday.com", category: PageCategory.NEWS },
  { domain: "latimes.com", category: PageCategory.NEWS },
  { domain: "chicagotribune.com", category: PageCategory.NEWS },
  { domain: "newsweek.com", category: PageCategory.NEWS },
  { domain: "time.com", category: PageCategory.NEWS },
  { domain: "politico.com", category: PageCategory.NEWS },
  { domain: "thehill.com", category: PageCategory.NEWS },
  { domain: "nypost.com", category: PageCategory.NEWS },
  { domain: "ft.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "cnbc.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "businessinsider.com", category: PageCategory.NEWS },
  { domain: "forbes.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "huffpost.com", category: PageCategory.NEWS },
  { domain: "slate.com", category: PageCategory.NEWS },
  { domain: "vox.com", category: PageCategory.NEWS },
  { domain: "axios.com", category: PageCategory.NEWS },
  { domain: "theatlantic.com", category: PageCategory.NEWS },
  { domain: "npr.org", category: PageCategory.NEWS },
  { domain: "pbs.org", category: PageCategory.NEWS },
  { domain: "france24.com", category: PageCategory.NEWS },
  { domain: "dw.com", category: PageCategory.NEWS },
  { domain: "euronews.com", category: PageCategory.NEWS },
  { domain: "independent.co.uk", category: PageCategory.NEWS },
  { domain: "dailymail.co.uk", category: PageCategory.NEWS },
  { domain: "mirror.co.uk", category: PageCategory.NEWS },
  { domain: "theaustralian.com.au", category: PageCategory.NEWS },
  { domain: "smh.com.au", category: PageCategory.NEWS },
  { domain: "globeandmail.com", category: PageCategory.NEWS },
  { domain: "cbc.ca", category: PageCategory.NEWS },
  { domain: "straitstimes.com", category: PageCategory.NEWS },
  { domain: "scmp.com", category: PageCategory.NEWS },
  { domain: "irishtimes.com", category: PageCategory.NEWS },
  { domain: "japantimes.co.jp", category: PageCategory.NEWS },
  { domain: "marketwatch.com", category: PageCategory.NEWS }, // Also Finance
  { domain: "seekingalpha.com", category: PageCategory.NEWS }, // Also Finance

  // --- Blog Platforms & Personal Sites ---
  { domain: "medium.com", category: PageCategory.BLOG },
  { domain: "substack.com", category: PageCategory.BLOG },
  { domain: "wordpress.com", category: PageCategory.BLOG }, // Platform
  { domain: "blogger.com", category: PageCategory.BLOG }, // Platform
  { domain: "tumblr.com", category: PageCategory.BLOG }, // Platform + Social
  { domain: "blogspot.com", category: PageCategory.BLOG }, // Platform sites
  { domain: "dev.to", category: PageCategory.BLOG }, // Tech Blog
  { domain: "hashnode.com", category: PageCategory.BLOG }, // Tech Blog
  { domain: "ghost.org", category: PageCategory.BLOG }, // Platform
  { domain: "wix.com", category: PageCategory.BLOG }, // Check path /blog
  { domain: "squarespace.com", category: PageCategory.BLOG }, // Check path /blog
  { domain: "typepad.com", category: PageCategory.BLOG },
  { domain: "livejournal.com", category: PageCategory.BLOG },
  { domain: "svbtle.com", category: PageCategory.BLOG },
  { domain: "beehiiv.com", category: PageCategory.BLOG },
  { domain: "mirror.xyz", category: PageCategory.BLOG }, // Crypto/Web3 Blog
  { domain: "steemit.com", category: PageCategory.BLOG }, // Crypto/Web3 Blog
  { domain: "write.as", category: PageCategory.BLOG },
  { domain: "posthaven.com", category: PageCategory.BLOG },
  { domain: "telegra.ph", category: PageCategory.BLOG }, // Raw editor
  { domain: "weebly.com", category: PageCategory.BLOG }, // Check path /blog
  { domain: "hubpages.com", category: PageCategory.BLOG },
  { domain: "minds.com", category: PageCategory.BLOG }, // Also Social
  { domain: "webflow.com", category: PageCategory.BLOG }, // Check path /blog
  { domain: "notion.site", category: PageCategory.BLOG }, // Also Productivity
  { domain: "wordpress.org", category: PageCategory.BLOG }, // Self-hosted WP info
  { domain: "mataroa.blog", category: PageCategory.BLOG },
  { domain: "bear.blog", category: PageCategory.BLOG },

  // --- Developer Documentation ---
  { domain: "developer.mozilla.org", category: PageCategory.DEV_DOCS }, // MDN
  { domain: "docs.github.com", category: PageCategory.DEV_DOCS },
  { domain: "react.dev", category: PageCategory.DEV_DOCS }, // New React docs
  { domain: "reactjs.org", category: PageCategory.DEV_DOCS }, // Old React docs
  { domain: "angular.io", category: PageCategory.DEV_DOCS },
  { domain: "vuejs.org", category: PageCategory.DEV_DOCS },
  { domain: "nodejs.org", category: PageCategory.DEV_DOCS },
  { domain: "docs.python.org", category: PageCategory.DEV_DOCS },
  { domain: "docs.docker.com", category: PageCategory.DEV_DOCS },
  { domain: "kubernetes.io", category: PageCategory.DEV_DOCS },
  { domain: "readthedocs.io", category: PageCategory.DEV_DOCS }, // Hosting for many projects
  { domain: "developer.android.com", category: PageCategory.DEV_DOCS },
  { domain: "developer.apple.com", category: PageCategory.DEV_DOCS },
  { domain: "docs.aws.amazon.com", category: PageCategory.DEV_DOCS },
  { domain: "cloud.google.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "azure.microsoft.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "learn.microsoft.com", category: PageCategory.DEV_DOCS }, // Combined MS Docs
  { domain: "docs.microsoft.com", category: PageCategory.DEV_DOCS }, // Older MS Docs link
  { domain: "docs.npmjs.com", category: PageCategory.DEV_DOCS },
  { domain: "svelte.dev", category: PageCategory.DEV_DOCS },
  { domain: "nextjs.org", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "nuxtjs.org", category: PageCategory.DEV_DOCS },
  { domain: "docs.oracle.com", category: PageCategory.DEV_DOCS }, // Java, DB, etc.
  { domain: "docs.djangoproject.com", category: PageCategory.DEV_DOCS },
  { domain: "flask.palletsprojects.com", category: PageCategory.DEV_DOCS },
  { domain: "laravel.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "docs.swift.org", category: PageCategory.DEV_DOCS },
  { domain: "kotlinlang.org", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "rust-lang.org", category: PageCategory.DEV_DOCS }, // Check path /learn
  { domain: "docs.scala-lang.org", category: PageCategory.DEV_DOCS },
  { domain: "docs.mongodb.com", category: PageCategory.DEV_DOCS },
  { domain: "www.postgresql.org", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "redis.io", category: PageCategory.DEV_DOCS }, // Check path /docs or /documentation
  { domain: "docs.unity3d.com", category: PageCategory.DEV_DOCS },
  { domain: "docs.unrealengine.com", category: PageCategory.DEV_DOCS },
  { domain: "docs.godotengine.org", category: PageCategory.DEV_DOCS },
  { domain: "www.terraform.io", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "docs.ansible.com", category: PageCategory.DEV_DOCS },
  { domain: "docs.gitlab.com", category: PageCategory.DEV_DOCS },
  { domain: "developer.atlassian.com", category: PageCategory.DEV_DOCS }, // Atlassian (Jira, Confluence)
  { domain: "fastapi.tiangolo.com", category: PageCategory.DEV_DOCS },
  { domain: "expressjs.com", category: PageCategory.DEV_DOCS },
  { domain: "spring.io", category: PageCategory.DEV_DOCS }, // Check path /guides /docs
  { domain: "firebase.google.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "tailwindcss.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "mui.com", category: PageCategory.DEV_DOCS }, // Material UI
  { domain: "getbootstrap.com", category: PageCategory.DEV_DOCS }, // Bootstrap
  { domain: "docs.expo.dev", category: PageCategory.DEV_DOCS }, // React Native Expo
  { domain: "graphql.org", category: PageCategory.DEV_DOCS }, // Check path /learn
  { domain: "apollographql.com", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "webpack.js.org", category: PageCategory.DEV_DOCS },
  { domain: "babeljs.io", category: PageCategory.DEV_DOCS }, // Check path /docs
  { domain: "eslint.org", category: PageCategory.DEV_DOCS },
  { domain: "prettier.io", category: PageCategory.DEV_DOCS },
  { domain: "jestjs.io", category: PageCategory.DEV_DOCS },
  { domain: "testing-library.com", category: PageCategory.DEV_DOCS },
  { domain: "vitejs.dev", category: PageCategory.DEV_DOCS },
  { domain: "wxt.dev", category: PageCategory.DEV_DOCS }, // Specific to this project

  // --- Scientific Journals & Research ---
  { domain: "arxiv.org", category: PageCategory.SCIENTIFIC }, // Pre-prints
  { domain: "nature.com", category: PageCategory.SCIENTIFIC },
  { domain: "science.org", category: PageCategory.SCIENTIFIC }, // AAAS
  { domain: "ncbi.nlm.nih.gov", category: PageCategory.SCIENTIFIC }, // PubMed Central, etc.
  { domain: "pubmed.ncbi.nlm.nih.gov", category: PageCategory.SCIENTIFIC }, // PubMed direct
  { domain: "researchgate.net", category: PageCategory.SCIENTIFIC }, // Social network + papers
  { domain: "sciencedirect.com", category: PageCategory.SCIENTIFIC }, // Elsevier
  { domain: "scholar.google.com", category: PageCategory.SCIENTIFIC }, // Search engine
  { domain: "pnas.org", category: PageCategory.SCIENTIFIC },
  { domain: "cell.com", category: PageCategory.SCIENTIFIC },
  { domain: "nejm.org", category: PageCategory.SCIENTIFIC }, // New England Journal of Medicine
  { domain: "plos.org", category: PageCategory.SCIENTIFIC }, // Public Library of Science
  { domain: "frontiersin.org", category: PageCategory.SCIENTIFIC },
  { domain: "ieee.org", category: PageCategory.SCIENTIFIC }, // Check path /Xplore
  { domain: "acm.org", category: PageCategory.SCIENTIFIC }, // Check path /dl
  { domain: "jamanetwork.com", category: PageCategory.SCIENTIFIC }, // JAMA
  { domain: "bmj.com", category: PageCategory.SCIENTIFIC },
  { domain: "thelancet.com", category: PageCategory.SCIENTIFIC },
  { domain: "ssrn.com", category: PageCategory.SCIENTIFIC }, // Social Science Research Network
  { domain: "biorxiv.org", category: PageCategory.SCIENTIFIC }, // Biology Pre-prints
  { domain: "medrxiv.org", category: PageCategory.SCIENTIFIC }, // Medical Pre-prints
  { domain: "acs.org", category: PageCategory.SCIENTIFIC }, // American Chemical Society
  { domain: "wiley.com", category: PageCategory.SCIENTIFIC }, // Check path /OnlineLibrary
  { domain: "springer.com", category: PageCategory.SCIENTIFIC },
  { domain: "mdpi.com", category: PageCategory.SCIENTIFIC }, // Multidisciplinary Digital Publishing Institute
  { domain: "aps.org", category: PageCategory.SCIENTIFIC }, // American Physical Society
  { domain: "rsc.org", category: PageCategory.SCIENTIFIC }, // Royal Society of Chemistry
  { domain: "jneurosci.org", category: PageCategory.SCIENTIFIC },
  { domain: "plosone.org", category: PageCategory.SCIENTIFIC },
  { domain: "hindawi.com", category: PageCategory.SCIENTIFIC },
  { domain: "tandfonline.com", category: PageCategory.SCIENTIFIC }, // Taylor & Francis
  { domain: "sagepub.com", category: PageCategory.SCIENTIFIC },
  { domain: "scielo.org", category: PageCategory.SCIENTIFIC },
  { domain: "aaas.org", category: PageCategory.SCIENTIFIC }, // Science journal publisher
  { domain: "peerj.com", category: PageCategory.SCIENTIFIC },
  { domain: "jstage.jst.go.jp", category: PageCategory.SCIENTIFIC }, // Japan Science and Technology Agency
  { domain: "emerald.com", category: PageCategory.SCIENTIFIC }, // Check path /insight
  { domain: "annualreviews.org", category: PageCategory.SCIENTIFIC },
  { domain: "biomedcentral.com", category: PageCategory.SCIENTIFIC },
  { domain: "iop.org", category: PageCategory.SCIENTIFIC }, // Institute of Physics
  { domain: "academic.oup.com", category: PageCategory.SCIENTIFIC }, // Oxford University Press

  // --- Social Media & Messaging ---
  { domain: "twitter.com", category: PageCategory.SOCIAL },
  { domain: "x.com", category: PageCategory.SOCIAL }, // Alias for Twitter
  { domain: "facebook.com", category: PageCategory.SOCIAL },
  { domain: "instagram.com", category: PageCategory.SOCIAL },
  { domain: "linkedin.com", category: PageCategory.SOCIAL }, // Also Professional/Learning
  { domain: "tiktok.com", category: PageCategory.SOCIAL },
  { domain: "threads.net", category: PageCategory.SOCIAL },
  { domain: "pinterest.com", category: PageCategory.SOCIAL },
  { domain: "snapchat.com", category: PageCategory.SOCIAL },
  { domain: "whatsapp.com", category: PageCategory.SOCIAL }, // Messaging
  { domain: "telegram.org", category: PageCategory.SOCIAL }, // Messaging
  { domain: "messenger.com", category: PageCategory.SOCIAL }, // Messaging
  { domain: "wechat.com", category: PageCategory.SOCIAL }, // Messaging
  { domain: "weibo.com", category: PageCategory.SOCIAL },
  { domain: "line.me", category: PageCategory.SOCIAL }, // Messaging
  { domain: "vk.com", category: PageCategory.SOCIAL },
  { domain: "discord.com", category: PageCategory.SOCIAL }, // Messaging/Community
  { domain: "signal.org", category: PageCategory.SOCIAL }, // Messaging
  { domain: "viber.com", category: PageCategory.SOCIAL }, // Messaging
  { domain: "kakaocorp.com", category: PageCategory.SOCIAL }, // Parent of KakaoTalk
  { domain: "clubhouse.com", category: PageCategory.SOCIAL },
  { domain: "mastodon.social", category: PageCategory.SOCIAL }, // Fediverse instance
  // Note: Tumblr is listed under BLOG but also SOCIAL
  // Note: Minds is listed under BLOG but also SOCIAL
  // Note: ResearchGate listed under SCIENTIFIC but also SOCIAL

  // Discussion forums and Q&A
  { domain: "stackoverflow.com", category: PageCategory.FORUM },
  { domain: "stackexchange.com", category: PageCategory.FORUM },
  { domain: "quora.com", category: PageCategory.FORUM },
  { domain: "reddit.com", category: PageCategory.FORUM },
  { domain: "discourse.org", category: PageCategory.FORUM },
  { domain: "ycombinator.com", category: PageCategory.FORUM },
  { domain: "4chan.org", category: PageCategory.FORUM },
  { domain: "8kun.top", category: PageCategory.FORUM },
  { domain: "gaia.com", category: PageCategory.FORUM },
  { domain: "lemmy.ml", category: PageCategory.FORUM },
  { domain: "forums.macrumors.com", category: PageCategory.FORUM },
  { domain: "theverge.com/forums", category: PageCategory.FORUM },
  { domain: "androidcentral.com/forums", category: PageCategory.FORUM },
  { domain: "community.spotify.com", category: PageCategory.FORUM },
  { domain: "community.xbox.com", category: PageCategory.FORUM },
  { domain: "community.playstation.com", category: PageCategory.FORUM },
  { domain: "resetera.com", category: PageCategory.FORUM },
  { domain: "neogaf.com", category: PageCategory.FORUM },
  { domain: "gamefaqs.gamespot.com", category: PageCategory.FORUM },
  { domain: "bodybuilding.com/forum", category: PageCategory.FORUM },
  { domain: "mumsnet.com", category: PageCategory.FORUM },
  { domain: "dev.to", category: PageCategory.FORUM },
  { domain: "community.kdenlive.org", category: PageCategory.FORUM },
  { domain: "forum.arduino.cc", category: PageCategory.FORUM },
  { domain: "raspberrypi.org/forums", category: PageCategory.FORUM },
  { domain: "bitcointalk.org", category: PageCategory.FORUM },
  { domain: "community.brave.com", category: PageCategory.FORUM },
  { domain: "forum.xda-developers.com", category: PageCategory.FORUM },
  { domain: "askubuntu.com", category: PageCategory.FORUM },
  { domain: "serverfault.com", category: PageCategory.FORUM },
  { domain: "superuser.com", category: PageCategory.FORUM },
  { domain: "forums.tomshardware.com", category: PageCategory.FORUM },
  { domain: "community.atlassian.com", category: PageCategory.FORUM },
  { domain: "community.amd.com", category: PageCategory.FORUM },
  { domain: "community.intel.com", category: PageCategory.FORUM },
  { domain: "answers.microsoft.com", category: PageCategory.FORUM },
  { domain: "answers.yahoo.com", category: PageCategory.FORUM },
  { domain: "ask.fm", category: PageCategory.FORUM },
  { domain: "forums.opera.com", category: PageCategory.FORUM },
  { domain: "forums.mozillazine.org", category: PageCategory.FORUM },

  // E-commerce
  { domain: "amazon.com", category: PageCategory.ECOMMERCE },
  { domain: "ebay.com", category: PageCategory.ECOMMERCE },
  { domain: "walmart.com", category: PageCategory.ECOMMERCE },
  { domain: "etsy.com", category: PageCategory.ECOMMERCE },
  { domain: "shopify.com", category: PageCategory.ECOMMERCE },
  { domain: "aliexpress.com", category: PageCategory.ECOMMERCE },
  { domain: "bestbuy.com", category: PageCategory.ECOMMERCE },
  { domain: "target.com", category: PageCategory.ECOMMERCE },
  { domain: "newegg.com", category: PageCategory.ECOMMERCE },
  { domain: "wish.com", category: PageCategory.ECOMMERCE },
  { domain: "wayfair.com", category: PageCategory.ECOMMERCE },
  { domain: "ikea.com", category: PageCategory.ECOMMERCE },
  { domain: "homedepot.com", category: PageCategory.ECOMMERCE },
  { domain: "lowes.com", category: PageCategory.ECOMMERCE },
  { domain: "costco.com", category: PageCategory.ECOMMERCE },
  { domain: "samsclub.com", category: PageCategory.ECOMMERCE },
  { domain: "apple.com/store", category: PageCategory.ECOMMERCE },
  { domain: "samsung.com", category: PageCategory.ECOMMERCE },
  { domain: "microsoft.com/store", category: PageCategory.ECOMMERCE },
  { domain: "kohls.com", category: PageCategory.ECOMMERCE },
  { domain: "macys.com", category: PageCategory.ECOMMERCE },
  { domain: "nordstrom.com", category: PageCategory.ECOMMERCE },
  { domain: "nike.com", category: PageCategory.ECOMMERCE },
  { domain: "adidas.com", category: PageCategory.ECOMMERCE },
  { domain: "underarmour.com", category: PageCategory.ECOMMERCE },
  { domain: "zappos.com", category: PageCategory.ECOMMERCE },
  { domain: "overstock.com", category: PageCategory.ECOMMERCE },
  { domain: "chewy.com", category: PageCategory.ECOMMERCE },
  { domain: "petco.com", category: PageCategory.ECOMMERCE },
  { domain: "petsmart.com", category: PageCategory.ECOMMERCE },
  { domain: "staples.com", category: PageCategory.ECOMMERCE },
  { domain: "officedepot.com", category: PageCategory.ECOMMERCE },
  { domain: "bhphotovideo.com", category: PageCategory.ECOMMERCE },
  { domain: "adorama.com", category: PageCategory.ECOMMERCE },
  { domain: "sweetwater.com", category: PageCategory.ECOMMERCE },
  { domain: "guitarcenter.com", category: PageCategory.ECOMMERCE },
  { domain: "sephora.com", category: PageCategory.ECOMMERCE },
  { domain: "ulta.com", category: PageCategory.ECOMMERCE },
  { domain: "walgreens.com", category: PageCategory.ECOMMERCE },
  { domain: "cvs.com", category: PageCategory.ECOMMERCE },
  { domain: "jcpenney.com", category: PageCategory.ECOMMERCE },
  { domain: "houzz.com", category: PageCategory.ECOMMERCE },
  { domain: "williams-sonoma.com", category: PageCategory.ECOMMERCE },
  { domain: "crateandbarrel.com", category: PageCategory.ECOMMERCE },
  { domain: "potterybarn.com", category: PageCategory.ECOMMERCE },
  { domain: "rei.com", category: PageCategory.ECOMMERCE },
  { domain: "dickssportinggoods.com", category: PageCategory.ECOMMERCE },
  { domain: "cabelas.com", category: PageCategory.ECOMMERCE },
  { domain: "basecamp.com", category: PageCategory.ECOMMERCE },
  { domain: "footlocker.com", category: PageCategory.ECOMMERCE },

  // Wikis and encyclopedias
  { domain: "wikipedia.org", category: PageCategory.WIKI },
  { domain: "fandom.com", category: PageCategory.WIKI },
  { domain: "wikia.com", category: PageCategory.WIKI },
  { domain: "wiktionary.org", category: PageCategory.WIKI },
  { domain: "britannica.com", category: PageCategory.WIKI },
  { domain: "wikihow.com", category: PageCategory.WIKI },
  { domain: "mediawiki.org", category: PageCategory.WIKI },
  { domain: "wikidata.org", category: PageCategory.WIKI },
  { domain: "wikiquote.org", category: PageCategory.WIKI },
  { domain: "wikisource.org", category: PageCategory.WIKI },
  { domain: "wikinews.org", category: PageCategory.WIKI },
  { domain: "wikibooks.org", category: PageCategory.WIKI },
  { domain: "wikivoyage.org", category: PageCategory.WIKI },
  { domain: "wikispecies.org", category: PageCategory.WIKI },
  { domain: "wikiversity.org", category: PageCategory.WIKI },
  { domain: "memory-alpha.fandom.com", category: PageCategory.WIKI },
  { domain: "bulbapedia.bulbagarden.net", category: PageCategory.WIKI },
  { domain: "towel.blinkenlights.nl", category: PageCategory.WIKI },
  { domain: "tvtropes.org", category: PageCategory.WIKI },
  { domain: "conservapedia.com", category: PageCategory.WIKI },
  { domain: "rationalwiki.org", category: PageCategory.WIKI },
  { domain: "uncyclopedia.com", category: PageCategory.WIKI },
  { domain: "everipedia.org", category: PageCategory.WIKI },
  { domain: "infogalactic.com", category: PageCategory.WIKI },
  { domain: "scholarpedia.org", category: PageCategory.WIKI },
  { domain: "wiki.archlinux.org", category: PageCategory.WIKI },
  { domain: "dokuwiki.org", category: PageCategory.WIKI },
  { domain: "gamepedia.com", category: PageCategory.WIKI },
  { domain: "marvelcinematicuniverse.fandom.com", category: PageCategory.WIKI },
  { domain: "harrypotter.fandom.com", category: PageCategory.WIKI },
  { domain: "starwars.fandom.com", category: PageCategory.WIKI },
  { domain: "minecraft.fandom.com", category: PageCategory.WIKI },
  { domain: "elderscrolls.fandom.com", category: PageCategory.WIKI },
  { domain: "tardis.fandom.com", category: PageCategory.WIKI },
  { domain: "jedipedia.net", category: PageCategory.WIKI },
  { domain: "wookieepedia.com", category: PageCategory.WIKI },
  // Email providers
  {
    category: PageCategory.EMAIL,
    domain: "mail.google.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "outlook.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "yahoo.com/mail",
  },
  {
    category: PageCategory.EMAIL,
    domain: "protonmail.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "zoho.com/mail",
  },
  {
    category: PageCategory.EMAIL,
    domain: "aol.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "mail.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "gmail.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "outlook.office.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "mail.yahoo.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "icloud.com/mail",
  },
  {
    category: PageCategory.EMAIL,
    domain: "mail.protonmail.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "fastmail.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "tutanota.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "mail.zoho.com",
  },
  {
    category: PageCategory.EMAIL,
    domain: "gmx.com",
  },

  // Productivity tools - document management, task management, etc.
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "docs.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "sheets.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "slides.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "office.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "office.live.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "office365.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "notion.so",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "evernote.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "trello.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "asana.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "monday.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "clickup.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "todoist.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "calendar.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "keep.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "onenote.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "airtable.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "miro.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "figma.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "drive.google.com",
  },
  {
    category: PageCategory.PRODUCTIVITY,
    domain: "onedrive.live.com",
  },

  // Video platforms
  { domain: "youtube.com", category: PageCategory.VIDEO },
  { domain: "vimeo.com", category: PageCategory.VIDEO },
  { domain: "netflix.com", category: PageCategory.VIDEO },
  { domain: "hulu.com", category: PageCategory.VIDEO },
  { domain: "twitch.tv", category: PageCategory.VIDEO },
  { domain: "disneyplus.com", category: PageCategory.VIDEO },
  { domain: "primevideo.com", category: PageCategory.VIDEO },
  { domain: "dailymotion.com", category: PageCategory.VIDEO },
  { domain: "tiktok.com", category: PageCategory.VIDEO },
  { domain: "hbomax.com", category: PageCategory.VIDEO },
  { domain: "peacocktv.com", category: PageCategory.VIDEO },
  { domain: "paramountplus.com", category: PageCategory.VIDEO },
  { domain: "appletv.apple.com", category: PageCategory.VIDEO },
  { domain: "crunchyroll.com", category: PageCategory.VIDEO },
  { domain: "funimation.com", category: PageCategory.VIDEO },
  { domain: "curiositystream.com", category: PageCategory.VIDEO },
  { domain: "nebula.app", category: PageCategory.VIDEO },
  { domain: "odysee.com", category: PageCategory.VIDEO },
  { domain: "metacafe.com", category: PageCategory.VIDEO },
  { domain: "vevo.com", category: PageCategory.VIDEO },
  { domain: "rutube.ru", category: PageCategory.VIDEO },
  { domain: "youku.com", category: PageCategory.VIDEO },
  { domain: "bilibili.com", category: PageCategory.VIDEO },
  { domain: "iqiyi.com", category: PageCategory.VIDEO },
  { domain: "tudou.com", category: PageCategory.VIDEO },
  { domain: "veoh.com", category: PageCategory.VIDEO },
  { domain: "mixer.com", category: PageCategory.VIDEO },
  { domain: "trovo.live", category: PageCategory.VIDEO },
  { domain: "facebook.com/watch", category: PageCategory.VIDEO },
  { domain: "plex.tv", category: PageCategory.VIDEO },
  { domain: "starz.com", category: PageCategory.VIDEO },
  { domain: "showtime.com", category: PageCategory.VIDEO },
  { domain: "amc.com", category: PageCategory.VIDEO },
  { domain: "espn.com", category: PageCategory.VIDEO },
  { domain: "nba.com", category: PageCategory.VIDEO },
  { domain: "mlb.com", category: PageCategory.VIDEO },
  { domain: "nfl.com", category: PageCategory.VIDEO },
  { domain: "nick.com", category: PageCategory.VIDEO },
  { domain: "cartoonnetwork.com", category: PageCategory.VIDEO },
  { domain: "adultswim.com", category: PageCategory.VIDEO },
  { domain: "ted.com", category: PageCategory.VIDEO },

  // Music platforms
  { domain: "spotify.com", category: PageCategory.MUSIC },
  { domain: "apple.com/music", category: PageCategory.MUSIC },
  { domain: "soundcloud.com", category: PageCategory.MUSIC },
  { domain: "bandcamp.com", category: PageCategory.MUSIC },
  { domain: "genius.com", category: PageCategory.MUSIC },
  { domain: "tidal.com", category: PageCategory.MUSIC },
  { domain: "deezer.com", category: PageCategory.MUSIC },

  // Government and documentation
  { domain: "irs.gov", category: PageCategory.DOCUMENTATION },
  { domain: "usa.gov", category: PageCategory.DOCUMENTATION },
  { domain: "gov.uk", category: PageCategory.DOCUMENTATION },
  { domain: "europa.eu", category: PageCategory.DOCUMENTATION },
  { domain: "canada.ca", category: PageCategory.DOCUMENTATION },
  { domain: "australia.gov.au", category: PageCategory.DOCUMENTATION },

  // Travel sites
  { domain: "booking.com", category: PageCategory.TRAVEL },
  { domain: "airbnb.com", category: PageCategory.TRAVEL },
  { domain: "expedia.com", category: PageCategory.TRAVEL },
  { domain: "tripadvisor.com", category: PageCategory.TRAVEL },
  { domain: "hotels.com", category: PageCategory.TRAVEL },
  { domain: "kayak.com", category: PageCategory.TRAVEL },

  // Health sites
  { domain: "webmd.com", category: PageCategory.HEALTH },
  { domain: "mayoclinic.org", category: PageCategory.HEALTH },
  { domain: "nih.gov", category: PageCategory.HEALTH },
  { domain: "cdc.gov", category: PageCategory.HEALTH },
  { domain: "who.int", category: PageCategory.HEALTH },
  { domain: "healthline.com", category: PageCategory.HEALTH },

  // --- Finance --- (Banking, Investment, Info)
  { domain: "chase.com", category: PageCategory.FINANCE },
  { domain: "wellsfargo.com", category: PageCategory.FINANCE },
  { domain: "bankofamerica.com", category: PageCategory.FINANCE },
  { domain: "citibank.com", category: PageCategory.FINANCE },
  { domain: "americanexpress.com", category: PageCategory.FINANCE },
  { domain: "capitalone.com", category: PageCategory.FINANCE },
  { domain: "schwab.com", category: PageCategory.FINANCE },
  { domain: "fidelity.com", category: PageCategory.FINANCE },
  { domain: "vanguard.com", category: PageCategory.FINANCE },
  { domain: "robinhood.com", category: PageCategory.FINANCE },
  { domain: "etrade.com", category: PageCategory.FINANCE },
  { domain: "tdameritrade.com", category: PageCategory.FINANCE },
  { domain: "interactivebrokers.com", category: PageCategory.FINANCE },
  { domain: "morningstar.com", category: PageCategory.FINANCE },
  { domain: "investopedia.com", category: PageCategory.FINANCE }, // Also Learning
  { domain: "nerdwallet.com", category: PageCategory.FINANCE },
  { domain: "creditkarma.com", category: PageCategory.FINANCE },
  { domain: "paypal.com", category: PageCategory.FINANCE },
  { domain: "wise.com", category: PageCategory.FINANCE }, // TransferWise
  { domain: "stripe.com", category: PageCategory.FINANCE }, // Payments processing
  { domain: "coinbase.com", category: PageCategory.FINANCE }, // Crypto
  { domain: "binance.com", category: PageCategory.FINANCE }, // Crypto
  // Note: Financial news sites (Bloomberg, WSJ, FT, CNBC, Reuters, Forbes, MarketWatch, SeekingAlpha) listed under NEWS

  // --- Learning & Education ---
  { domain: "coursera.org", category: PageCategory.LEARNING },
  { domain: "edx.org", category: PageCategory.LEARNING },
  { domain: "udemy.com", category: PageCategory.LEARNING },
  { domain: "khanacademy.org", category: PageCategory.LEARNING },
  { domain: "codecademy.com", category: PageCategory.LEARNING }, // Also Dev Docs
  { domain: "brilliant.org", category: PageCategory.LEARNING },
  { domain: "duolingo.com", category: PageCategory.LEARNING },
  { domain: "skillshare.com", category: PageCategory.LEARNING },
  { domain: "masterclass.com", category: PageCategory.LEARNING },
  { domain: "datacamp.com", category: PageCategory.LEARNING },
  { domain: "freecodecamp.org", category: PageCategory.LEARNING }, // Also Dev Docs
  { domain: "pluralsight.com", category: PageCategory.LEARNING },
  { domain: "linkedin.com", category: PageCategory.LEARNING }, // Check path /learning
  { domain: "udacity.com", category: PageCategory.LEARNING },
  { domain: "futurelearn.com", category: PageCategory.LEARNING },
  { domain: "mit.edu", category: PageCategory.LEARNING }, // University sites
  { domain: "harvard.edu", category: PageCategory.LEARNING },
  { domain: "stanford.edu", category: PageCategory.LEARNING },
  { domain: "cam.ac.uk", category: PageCategory.LEARNING },
  { domain: "ox.ac.uk", category: PageCategory.LEARNING },
  // Note: Wikipedia listed under GENERAL but also Learning
  // Note: Investopedia listed under FINANCE but also Learning

  // --- Productivity & Tools ---
  { domain: "notion.so", category: PageCategory.PRODUCTIVITY },
  { domain: "evernote.com", category: PageCategory.PRODUCTIVITY },
  { domain: "todoist.com", category: PageCategory.PRODUCTIVITY },
  { domain: "trello.com", category: PageCategory.PRODUCTIVITY },
  { domain: "asana.com", category: PageCategory.PRODUCTIVITY },
  { domain: "miro.com", category: PageCategory.PRODUCTIVITY },
  { domain: "monday.com", category: PageCategory.PRODUCTIVITY },
  { domain: "clickup.com", category: PageCategory.PRODUCTIVITY },
  { domain: "airtable.com", category: PageCategory.PRODUCTIVITY },
  { domain: "slack.com", category: PageCategory.PRODUCTIVITY }, // Communication
  { domain: "zoom.us", category: PageCategory.PRODUCTIVITY }, // Communication
  { domain: "drive.google.com", category: PageCategory.PRODUCTIVITY }, // Google Drive/Docs/Sheets/Slides
  { domain: "docs.google.com", category: PageCategory.PRODUCTIVITY },
  { domain: "sheets.google.com", category: PageCategory.PRODUCTIVITY },
  { domain: "slides.google.com", category: PageCategory.PRODUCTIVITY },
  { domain: "office.com", category: PageCategory.PRODUCTIVITY }, // Microsoft Office 365
  { domain: "onedrive.live.com", category: PageCategory.PRODUCTIVITY }, // Microsoft OneDrive
  { domain: "dropbox.com", category: PageCategory.PRODUCTIVITY },
  { domain: "box.com", category: PageCategory.PRODUCTIVITY },
  { domain: "calendly.com", category: PageCategory.PRODUCTIVITY },
  { domain: "zapier.com", category: PageCategory.PRODUCTIVITY },
  { domain: "ifttt.com", category: PageCategory.PRODUCTIVITY },
  { domain: "canva.com", category: PageCategory.PRODUCTIVITY }, // Design
  { domain: "figma.com", category: PageCategory.PRODUCTIVITY }, // Design
  // Note: Notion.site listed under BLOG but also Productivity

  // --- Code Repositories ---
  { domain: "github.com", category: PageCategory.CODE_REPO },
  { domain: "gitlab.com", category: PageCategory.CODE_REPO },
  { domain: "bitbucket.org", category: PageCategory.CODE_REPO },
  { domain: "sourceforge.net", category: PageCategory.CODE_REPO },
  { domain: "codeberg.org", category: PageCategory.CODE_REPO },
  { domain: "npmjs.com", category: PageCategory.CODE_REPO }, // Package manager repo
  { domain: "pypi.org", category: PageCategory.CODE_REPO }, // Package manager repo
  { domain: "hub.docker.com", category: PageCategory.CODE_REPO }, // Container registry

  // --- Forums & Q&A ---
  { domain: "reddit.com", category: PageCategory.FORUM },
  { domain: "stackoverflow.com", category: PageCategory.FORUM }, // Also Dev Docs
  { domain: "quora.com", category: PageCategory.FORUM },
  { domain: "stackexchange.com", category: PageCategory.FORUM }, // Network site
  { domain: "discourse.group", category: PageCategory.FORUM }, // Forum software instances
  { domain: "news.ycombinator.com", category: PageCategory.FORUM }, // Hacker News
  { domain: "lobste.rs", category: PageCategory.FORUM }, // Tech forum

  // --- Shopping & E-commerce ---
  { domain: "amazon.com", category: PageCategory.ECOMMERCE },
  { domain: "ebay.com", category: PageCategory.ECOMMERCE },
  { domain: "etsy.com", category: PageCategory.ECOMMERCE },
  { domain: "walmart.com", category: PageCategory.ECOMMERCE },
  { domain: "target.com", category: PageCategory.ECOMMERCE },
  { domain: "aliexpress.com", category: PageCategory.ECOMMERCE },
  { domain: "alibaba.com", category: PageCategory.ECOMMERCE },
  { domain: "bestbuy.com", category: PageCategory.ECOMMERCE },
  { domain: "homedepot.com", category: PageCategory.ECOMMERCE },
  { domain: "lowes.com", category: PageCategory.ECOMMERCE },
  { domain: "craigslist.org", category: PageCategory.ECOMMERCE }, // Classifieds

  // --- Video & Streaming ---
  { domain: "youtube.com", category: PageCategory.VIDEO },
  { domain: "vimeo.com", category: PageCategory.VIDEO },
  { domain: "twitch.tv", category: PageCategory.VIDEO },
  { domain: "dailymotion.com", category: PageCategory.VIDEO },
  { domain: "netflix.com", category: PageCategory.VIDEO }, // Streaming Service
  { domain: "hulu.com", category: PageCategory.VIDEO }, // Streaming Service
  { domain: "disneyplus.com", category: PageCategory.VIDEO }, // Streaming Service
  { domain: "hbomax.com", category: PageCategory.VIDEO }, // Streaming Service (Max)
  { domain: "primevideo.com", category: PageCategory.VIDEO }, // Streaming Service

  // --- General Purpose & Search ---
  { domain: "google.com", category: PageCategory.GENERAL }, // Search, etc.
  { domain: "bing.com", category: PageCategory.GENERAL }, // Search
  { domain: "duckduckgo.com", category: PageCategory.GENERAL }, // Search
  { domain: "wikipedia.org", category: PageCategory.GENERAL }, // Also Learning/Wiki
  { domain: "yahoo.com", category: PageCategory.GENERAL }, // Portal/News/Search
];

/**
 * Get the category for a URL
 */
export function get_url_category(url: string): PageCategory {
  // Use a simple contains check for each domain
  for (const { domain, category } of DOMAIN_MAPPINGS) {
    if (url.includes(domain)) {
      return category;
    }
  }

  // If no matches, return the general category
  return PageCategory.GENERAL;
}

/**
 * Get all URL categorization patterns for API access
 */
export function get_all_patterns(): DomainPattern[] {
  // Convert simple domain mappings back to the expected DomainPattern format for backward compatibility
  return DOMAIN_MAPPINGS.map(({ domain, category }) => ({
    pattern: domain,
    category,
    description: `URLs containing ${domain}`,
  }));
}
