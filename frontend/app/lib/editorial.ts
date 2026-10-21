type ArticleIndexing = {
  slug?: string;
  status?: string;
  seo?: { is_indexable?: boolean };
};

// This imported sample contains placeholder text, not a published news story.
const SAMPLE_ARTICLE_SLUGS = new Set(['heeh']);

export function isIndexableArticle(article: ArticleIndexing): boolean {
  return article.status === 'PUBLISHED' && !!article.slug &&
    article.seo?.is_indexable !== false && !SAMPLE_ARTICLE_SLUGS.has(article.slug);
}
