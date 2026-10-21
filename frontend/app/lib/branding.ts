// Rebrand existing CMS copy at display time, without changing saved content.
export function rebrandSiteContent(content: string): string {
  return content
    .replace(/https?:\/\/(?:www\.)?zozo\.pk\b/gi, "https://mobilerates.info")
    .replace(/\bhref=(['"])(.*?)\1/gi, (attribute, quote: string, href: string) => {
      try {
        if (!href.startsWith("/") && !/^https?:\/\//i.test(href)) return attribute;
        const url = new URL(href, "https://mobilerates.info");
        if (url.hostname !== "mobilerates.info" && url.hostname !== "www.mobilerates.info") return attribute;
        url.protocol = "https:";
        url.hostname = "mobilerates.info";
        const brand = url.pathname.match(/^\/([^/]+)-phone-price(?:-[^/]+)?$/);
        const oldProduct = url.pathname.match(/^\/(?:phones|earbuds|vehicles)\/([^/]+)$/);
        if (brand) url.pathname = `/brands/${brand[1]}`;
        else if (oldProduct && !["compare", "comparisons"].includes(oldProduct[1])) url.pathname = `/${oldProduct[1]}`;
        url.pathname = url.pathname.replace(/^\/([^/]+)-price(?:-in-[^/]+)?$/, "/$1");
        return `href=${quote}${href.startsWith("/") ? url.pathname + url.search + url.hash : url.href}${quote}`;
      } catch {
        return attribute;
      }
    })
    .replace(/\bzozo(?:\.pk)?\b/gi, "Mobile Rates");
}
