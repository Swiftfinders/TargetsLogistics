import { getSiteUrl } from "@/lib/site";

export interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${base}${item.path}`,
    })),
  };
}
