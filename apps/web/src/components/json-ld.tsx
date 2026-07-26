/**
 * Renders a single JSON-LD block. Callers pass a plain schema.org-shaped object;
 * this never accepts raw HTML, so there's no injection surface beyond JSON.stringify.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}
