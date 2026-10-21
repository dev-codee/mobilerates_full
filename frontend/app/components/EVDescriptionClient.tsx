"use client";

import React, { useState } from "react";
import AppIcon from "./AppIcon";

interface EVDescriptionClientProps {
  description?: string;
  vehicleName: string;
  pros?: string[];
  cons?: string[];
  buyingAdvice?: string;
  faqs?: { question: string; answer: string }[];
}

/**
 * Parses inline markdown (**bold**, *italic*, `code`) into React elements.
 * Handles nested bold/italic and mixed formatting.
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  // Split on markdown patterns: **bold**, *italic*, `code`
  const parts: React.ReactNode[] = [];
  // Regex matches: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      parts.push(
        <strong key={match.index} className="font-bold text-text-main">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={match.index} className="italic">
          {match[3]}
        </em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code key={match.index} className="bg-surface-container-high px-1.5 py-0.5 rounded text-xs font-mono">
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
export default function EVDescriptionClient({
  description,
  vehicleName,
  pros = [],
  cons = [],
  buyingAdvice,
  faqs = [],
}: EVDescriptionClientProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // If there's no description, pros/cons, buying advice, or FAQs, return null
  const hasContent = description || pros.length > 0 || cons.length > 0 || buyingAdvice || faqs.length > 0;
  if (!hasContent) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Overview / Description Card */}
      {description && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-subtle">
            <AppIcon name="info" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              About the {vehicleName}
            </h2>
          </div>
          <div className="prose prose-sm md:prose-base max-w-none text-text-main/90 leading-relaxed space-y-4 font-normal text-justify">
            {description.replace(/\r\n/g, "\n").split(/\n{2,}/).map((paragraph, idx) => {
              const trimmed = paragraph.trim();

              // Headings
              if (trimmed.startsWith("##")) {
                return (
                  <h3 key={idx} className="text-base md:text-lg font-bold text-text-main pt-2 text-left">
                    {parseInlineMarkdown(trimmed.replace(/^#+\s*/, ""))}
                  </h3>
                );
              }

              // Bullet list block (lines starting with - or *)
              const lines = trimmed.split("\n");
              const isList = lines.every((l) => /^\s*[-*]\s+/.test(l) || l.trim() === "");
              if (isList && lines.filter((l) => l.trim()).length > 0) {
                return (
                  <ul key={idx} className="list-disc list-inside space-y-1.5 text-sm md:text-base text-text-main/80 text-left">
                    {lines
                      .filter((l) => l.trim())
                      .map((l, li) => (
                        <li key={li}>{parseInlineMarkdown(l.replace(/^\s*[-*]\s+/, ""))}</li>
                      ))}
                  </ul>
                );
              }

              // Numbered list block
              const isNumberedList = lines.every((l) => /^\s*\d+[.)]\s+/.test(l) || l.trim() === "");
              if (isNumberedList && lines.filter((l) => l.trim()).length > 0) {
                return (
                  <ol key={idx} className="list-decimal list-inside space-y-1.5 text-sm md:text-base text-text-main/80 text-left">
                    {lines
                      .filter((l) => l.trim())
                      .map((l, li) => (
                        <li key={li}>{parseInlineMarkdown(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
                      ))}
                  </ol>
                );
              }

              // Regular paragraph
              // Handle single newlines inside a paragraph by replacing them with a space or rendering <br/>.
              // For cleaner text, we'll join lines with a space so it flows nicely with text-justify.
              const paragraphText = trimmed.replace(/\n/g, " ");
              
              return (
                <p key={idx} className="text-sm md:text-base leading-relaxed text-text-main/80 text-justify">
                  {parseInlineMarkdown(paragraphText)}
                </p>
              );
            })}
          </div>
        </section>
      )}

      {/* Pros & Cons Section */}
      {(pros.length > 0 || cons.length > 0) && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
            <AppIcon name="thumbs_up_down" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              {vehicleName}: Pros & Cons
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pros */}
            {pros.length > 0 && (
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
                <h3 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2 mb-3">
                  <AppIcon name="check_circle" size={18} className="text-emerald-600" />
                  What We Like (Pros)
                </h3>
                <ul className="space-y-2.5">
                  {pros.map((pro, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-text-main">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cons */}
            {cons.length > 0 && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5">
                <h3 className="font-bold text-sm text-rose-700 dark:text-rose-400 flex items-center gap-2 mb-3">
                  <AppIcon name="cancel" size={18} className="text-rose-600" />
                  Things to Consider (Cons)
                </h3>
                <ul className="space-y-2.5">
                  {cons.map((con, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs md:text-sm text-text-main">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Buying Advice */}
      {buyingAdvice && (
        <section className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border border-blue-500/20 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <AppIcon name="lightbulb" size={22} className="text-blue-600" />
            <h3 className="font-headline-md text-base md:text-lg font-bold text-text-main">
              Mobile Rates Buying Advice
            </h3>
          </div>
          <p className="text-xs md:text-sm text-text-main/90 leading-relaxed text-justify">
            {parseInlineMarkdown(buyingAdvice)}
          </p>
        </section>
      )}

      {/* FAQs Section */}
      {faqs.length > 0 && (
        <section className="bg-surface-white border border-border-subtle rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-border-subtle">
            <AppIcon name="quiz" size={22} className="text-primary" />
            <h2 className="font-headline-md text-lg md:text-xl font-bold text-text-main">
              Frequently Asked Questions about {vehicleName}
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-border-subtle rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-semibold text-xs md:text-sm text-text-main flex items-center justify-between gap-4 bg-surface-container-low/20 hover:bg-surface-container-low/40"
                  >
                    <span>{faq.question}</span>
                    <AppIcon
                      name="keyboard_arrow_down"
                      size={20}
                      className={`text-text-muted transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-2 bg-surface-white text-xs md:text-sm text-text-muted leading-relaxed border-t border-border-subtle/40">
                      {parseInlineMarkdown(faq.answer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
