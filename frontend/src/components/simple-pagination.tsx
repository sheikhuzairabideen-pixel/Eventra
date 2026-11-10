import { SpringBootPagination } from "@/domain/domain";
import { Button } from "./ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface SimplePaginationProps<T> {
  pagination: SpringBootPagination<T>;
  onPageChange: (page: number) => void;
}

export function SimplePagination<T>({
  pagination,
  onPageChange,
}: SimplePaginationProps<T>) {
  const currentPage = pagination.number;
  const totalPages = pagination.totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-5">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={pagination.first}
      >
        <ArrowLeft aria-hidden="true" />
        Previous
      </Button>
      <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
        Page {currentPage + 1} of {totalPages}
      </p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={pagination.last}
      >
        Next
        <ArrowRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
