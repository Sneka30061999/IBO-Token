import { useEffect } from "react";

export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    const set = (sel: string, attr: string, value: string) => {
      document.querySelector(sel)?.setAttribute(attr, value);
    };
    set('meta[name="description"]', "content", description);
    set('meta[property="og:title"]', "content", title);
    set('meta[property="og:description"]', "content", description);
    const base = (import.meta.env.VITE_SITE_URL as string | undefined) ?? "https://ibotoken.example";
    set('link[rel="canonical"]', "href", base.replace(/\/$/, "") + window.location.pathname);
  }, [title, description]);
}
