"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import AppIcon from "./AppIcon";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    if (Number(pageNumber) === 1) params.delete("page");
    else params.set("page", pageNumber.toString());
    return `${pathname}${params.size ? `?${params.toString()}` : ""}`;
  };

  // Helper to generate page numbers with ellipses
  const generatePagination = (current: number, total: number) => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    
    if (current <= 4) {
      return [1, 2, 3, 4, 5, '...', total];
    }
    
    if (current >= total - 3) {
      return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
    }
    
    return [1, '...', current - 1, current, current + 1, '...', total];
  };

  const pages = generatePagination(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 ? (
        <Link
          href={createPageURL(currentPage - 1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-white text-text-main hover:bg-surface-container-low transition-colors cursor-pointer"
          aria-label="Previous page"
        >
          <AppIcon name="chevron_left" size={20} />
        </Link>
      ) : (
        <div className="w-11 h-11 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-container/50 text-text-muted opacity-50 cursor-not-allowed">
          <AppIcon name="chevron_left" size={20} />
        </div>
      )}

      <div className="flex items-center gap-1">
        {pages.map((page, i) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${i}`} className="w-11 h-11 flex items-center justify-center text-text-muted">
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={page}
              href={createPageURL(page)}
              className={`w-11 h-11 flex items-center justify-center rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                isCurrent
                  ? "bg-primary text-surface-white"
                  : "border border-border-subtle bg-surface-white text-text-main hover:bg-surface-container-low"
              }`}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {currentPage < totalPages ? (
        <Link
          href={createPageURL(currentPage + 1)}
          className="w-11 h-11 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-white text-text-main hover:bg-surface-container-low transition-colors cursor-pointer"
          aria-label="Next page"
        >
          <AppIcon name="chevron_right" size={20} />
        </Link>
      ) : (
        <div className="w-11 h-11 flex items-center justify-center rounded-lg border border-border-subtle bg-surface-container/50 text-text-muted opacity-50 cursor-not-allowed">
          <AppIcon name="chevron_right" size={20} />
        </div>
      )}
    </div>
  );
}
