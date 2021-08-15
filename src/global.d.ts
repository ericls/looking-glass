declare global {
  interface Window {
    siteSettings: {
      siteTitle: string;
      sitePageHeader: string;
      serverLocation: string;
      ipAddress: { label: string; value: string }[];
      links: { title: string; href: string }[];
      jsVer: string;
    };
  }
  type Comment = unknown;
  type CSSRuleList = unknown;
  type CSSRule = unknown;
  type CSSStyleRule = unknown;
}

export {}
