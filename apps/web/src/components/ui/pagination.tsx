import { Button } from "./button";

export interface PaginationProps {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  label?: string;
}

/**
 * Cursor-based, not page-numbered — every list endpoint in this app is
 * cursor-paginated (CLAUDE.md rule 6), so there's no stable "page 3" to link to.
 */
export function Pagination({ hasPrevious, hasNext, onPrevious, onNext, label = "Results" }: PaginationProps) {
  return (
    <nav aria-label={`${label} pagination`} className="flex items-center justify-between gap-3">
      <Button variant="outline" size="sm" onClick={onPrevious} disabled={!hasPrevious}>
        Previous
      </Button>
      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext}>
        Next
      </Button>
    </nav>
  );
}
