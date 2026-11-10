import { useEffect } from "react";

/**
 * Sets the tab title (and optionally the meta description) for a page.
 * Cheap SEO for a client-rendered app; real crawlers still prefer
 * pre-rendered HTML, so landing pages should also be covered in index.html.
 */
export function useDocumentTitle(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (!description) return;
    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.name = "description";
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [title, description]);
}
