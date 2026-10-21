import { CurrencyText } from "@/app/components/Price";
import Link from "next/link";
import AppIcon from "./AppIcon";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-muted font-body-sm text-body-sm overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      <ol className="flex items-center gap-2">
        <li className="inline-flex items-center">
          <Link href="/" className="hover:text-primary transition-colors flex-shrink-0 py-1.5 px-1 inline-flex items-center min-h-[44px]">
            Home
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-2 flex-shrink-0">
            <AppIcon name="chevron_right" size={16} aria-hidden="true" />
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors capitalize py-1.5 px-1 inline-flex items-center min-h-[44px]">
                <CurrencyText text={item.label} />
              </Link>
            ) : (
              <span className="text-text-main font-medium truncate max-w-[200px] md:max-w-none capitalize inline-flex items-center min-h-[44px]" aria-current="page">
                <CurrencyText text={item.label} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
