"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

interface PopularComparisonsProps {
  comparisons: any[];
  title?: string;
}

export default function PopularComparisons({ comparisons, title = "Popular Comparisons" }: PopularComparisonsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // 3 per row * 5 rows

  const validComparisons = comparisons?.filter((comp) => {
    return comp.phones && comp.phones.length >= 2 && comp.phones[0] && comp.phones[1];
  }) || [];

  const seenPairs = new Set<string>();
  for (let index = validComparisons.length - 1; index >= 0; index--) {
    const key = validComparisons[index].phones.map((product: { slug: string }) => product.slug).sort().join("-vs-");
    if (seenPairs.has(key)) validComparisons.splice(index, 1);
    else seenPairs.add(key);
  }

  if (validComparisons.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(validComparisons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentComparisons = validComparisons.slice(startIndex, startIndex + itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="w-full">
      <h2 className="font-headline-md text-2xl font-bold text-text-main mb-6">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentComparisons.map((comp, index) => {
          const phone1 = comp.phones[0];
          const phone2 = comp.phones[1];

          const p1Image = phone1.images?.find((img: any) => img.is_primary)?.url || phone1.images?.[0]?.url || "/placeholder-phone.svg";
          const p2Image = phone2.images?.find((img: any) => img.is_primary)?.url || phone2.images?.[0]?.url || "/placeholder-phone.svg";

          return (
            <Link
              key={index}
              href={`/compare/${phone1.slug}-vs-${phone2.slug}`}
              className="bg-surface-white border border-border-subtle rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-16 h-16 relative">
                  <Image src={p1Image} alt={phone1.name} fill className="object-contain" sizes="64px" />
                </div>
                <span className="font-label-sm text-xs text-center font-medium line-clamp-2 text-text-main group-hover:text-primary transition-colors">
                  {phone1.name}
                </span>
              </div>

              <div className="flex flex-col items-center justify-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-surface-container-low text-text-muted flex items-center justify-center font-bold text-xs italic">
                  VS
                </div>
              </div>

              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-16 h-16 relative">
                  <Image src={p2Image} alt={phone2.name} fill className="object-contain" sizes="64px" />
                </div>
                <span className="font-label-sm text-xs text-center font-medium line-clamp-2 text-text-main group-hover:text-primary transition-colors">
                  {phone2.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg disabled:opacity-50 hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-text-muted">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-surface-container-low text-text-main rounded-lg disabled:opacity-50 hover:bg-surface-container transition-colors font-medium text-sm border border-border-subtle"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
