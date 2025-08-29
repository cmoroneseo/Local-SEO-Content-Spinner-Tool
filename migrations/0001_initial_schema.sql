-- Businesses table - stores core business information
CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  primary_location TEXT NOT NULL,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  unique_selling_points TEXT, -- JSON array of USPs
  target_audience TEXT,
  brand_voice TEXT DEFAULT 'professional', -- professional, friendly, authoritative, casual
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services table - stores business services
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price_range TEXT,
  duration TEXT,
  benefits TEXT, -- JSON array of benefits
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Cities/Service Areas table - stores target locations
CREATE TABLE IF NOT EXISTS service_areas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_codes TEXT, -- JSON array of zip codes
  population INTEGER,
  demographics TEXT, -- JSON object with demographic data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Content Templates table - stores different content section templates
CREATE TABLE IF NOT EXISTS content_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  section_type TEXT NOT NULL, -- hero, about, services, testimonials, etc.
  template_content TEXT NOT NULL, -- Template with placeholders
  variables TEXT, -- JSON array of required variables
  tone TEXT DEFAULT 'professional',
  word_count_target INTEGER DEFAULT 150,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Generated Content table - stores all generated content
CREATE TABLE IF NOT EXISTS generated_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  service_area_id INTEGER NOT NULL,
  template_id INTEGER NOT NULL,
  section_type TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER,
  seo_score INTEGER DEFAULT 0, -- 0-100 SEO optimization score
  readability_score INTEGER DEFAULT 0, -- 0-100 readability score
  keywords TEXT, -- JSON array of target keywords
  meta_title TEXT,
  meta_description TEXT,
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
  FOREIGN KEY (service_area_id) REFERENCES service_areas(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES content_templates(id)
);

-- Content Projects table - groups content generations into projects
CREATE TABLE IF NOT EXISTS content_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft', -- draft, generating, completed, exported
  total_combinations INTEGER DEFAULT 0,
  completed_combinations INTEGER DEFAULT 0,
  export_format TEXT, -- html, markdown, csv, json
  export_url TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Project Content Mapping table - links content to projects
CREATE TABLE IF NOT EXISTS project_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  generated_content_id INTEGER NOT NULL,
  page_slug TEXT, -- SEO-friendly URL slug
  page_title TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES content_projects(id) ON DELETE CASCADE,
  FOREIGN KEY (generated_content_id) REFERENCES generated_content(id) ON DELETE CASCADE,
  UNIQUE(project_id, generated_content_id)
);

-- Keywords table - stores keyword research and tracking
CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  keyword TEXT NOT NULL,
  search_volume INTEGER DEFAULT 0,
  competition_level TEXT DEFAULT 'unknown', -- low, medium, high
  cpc DECIMAL(10,2) DEFAULT 0.00,
  relevance_score INTEGER DEFAULT 0, -- 0-100 relevance to business
  is_target_keyword BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

-- Content Analytics table - tracks performance metrics
CREATE TABLE IF NOT EXISTS content_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  generated_content_id INTEGER NOT NULL,
  metric_type TEXT NOT NULL, -- views, clicks, conversions, rankings
  metric_value DECIMAL(10,2) NOT NULL,
  date_recorded DATE NOT NULL,
  source TEXT, -- google_analytics, search_console, manual
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generated_content_id) REFERENCES generated_content(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry);
CREATE INDEX IF NOT EXISTS idx_services_business_id ON services(business_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_business_id ON service_areas(business_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_business_service_area ON generated_content(business_id, service_id, service_area_id);
CREATE INDEX IF NOT EXISTS idx_generated_content_template ON generated_content(template_id);
CREATE INDEX IF NOT EXISTS idx_content_projects_business ON content_projects(business_id);
CREATE INDEX IF NOT EXISTS idx_project_content_project ON project_content(project_id);
CREATE INDEX IF NOT EXISTS idx_keywords_business ON keywords(business_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(generated_content_id);
CREATE INDEX IF NOT EXISTS idx_content_analytics_date ON content_analytics(date_recorded);