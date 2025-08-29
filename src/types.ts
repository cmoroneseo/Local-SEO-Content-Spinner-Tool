export interface CloudflareBindings {
  DB: D1Database;
  AI: Ai;
}

export interface Business {
  id?: number;
  name: string;
  industry: string;
  primary_location: string;
  website_url?: string;
  phone?: string;
  email?: string;
  description?: string;
  unique_selling_points?: string; // JSON array
  target_audience?: string;
  brand_voice?: 'professional' | 'friendly' | 'authoritative' | 'casual';
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id?: number;
  business_id: number;
  name: string;
  description?: string;
  price_range?: string;
  duration?: string;
  benefits?: string; // JSON array
  created_at?: string;
}

export interface ServiceArea {
  id?: number;
  business_id: number;
  city: string;
  state: string;
  zip_codes?: string; // JSON array
  population?: number;
  demographics?: string; // JSON object
  created_at?: string;
}

export interface ContentTemplate {
  id?: number;
  name: string;
  section_type: 'hero' | 'about' | 'services' | 'testimonials' | 'financing' | 'service_areas' | 'why_choose' | 'reviews';
  template_content: string;
  variables?: string; // JSON array
  tone?: 'professional' | 'friendly' | 'authoritative' | 'casual';
  word_count_target?: number;
  is_active?: boolean;
  created_at?: string;
}

export interface GeneratedContent {
  id?: number;
  business_id: number;
  service_id: number;
  service_area_id: number;
  template_id: number;
  section_type: string;
  content: string;
  word_count?: number;
  seo_score?: number;
  readability_score?: number;
  keywords?: string; // JSON array
  meta_title?: string;
  meta_description?: string;
  generated_at?: string;
}

export interface ContentProject {
  id?: number;
  business_id: number;
  name: string;
  description?: string;
  status?: 'draft' | 'generating' | 'completed' | 'exported';
  total_combinations?: number;
  completed_combinations?: number;
  export_format?: 'html' | 'markdown' | 'csv' | 'json';
  export_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ContentGenerationRequest {
  businessId: number;
  serviceIds: number[];
  serviceAreaIds: number[];
  templateIds: number[];
  customPrompt?: string;
  tone?: string;
  wordCountTarget?: number;
  includeKeywords?: string[];
}

export interface SEOAnalysis {
  keywordDensity: Record<string, number>;
  readabilityScore: number;
  seoScore: number;
  suggestions: string[];
  metaTitle: string;
  metaDescription: string;
}

export interface BulkGenerationStatus {
  projectId: number;
  totalCombinations: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  estimatedTimeRemaining?: number;
}