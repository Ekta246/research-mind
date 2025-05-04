export interface Paper {
  id: string;
  title: string;
  abstract: string;
  authors: string[] | string;
  journal?: string;
  year: number;
  citations: number;
  tags?: string[];
  source?: string;
  relevance_score?: number;
  url?: string | null;
  pdf_url?: string | null;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
} 