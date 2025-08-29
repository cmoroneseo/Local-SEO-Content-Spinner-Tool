-- Insert default content templates
INSERT OR IGNORE INTO content_templates (name, section_type, template_content, variables, tone, word_count_target) VALUES 

-- Hero Section Templates
('Hero - Service Focus', 'hero', 
'Transform Your {TARGET_LOCATION} {SERVICE_TYPE} Experience with {COMPANY_NAME}

{COMPANY_NAME} delivers exceptional {SERVICE_TYPE} services throughout {TARGET_LOCATION}. Our expert team combines {YEARS_EXPERIENCE} years of experience with cutting-edge techniques to provide {SERVICE_BENEFIT_1}, {SERVICE_BENEFIT_2}, and {SERVICE_BENEFIT_3}. 

Whether you need {SERVICE_VARIATION_1}, {SERVICE_VARIATION_2}, or {SERVICE_VARIATION_3}, we''ve got you covered. Our {TARGET_LOCATION} customers trust us for {UNIQUE_SELLING_POINT} and {GUARANTEE_PROMISE}.

Ready to experience the difference? Contact {COMPANY_NAME} today for your free {SERVICE_TYPE} consultation in {TARGET_LOCATION}.',
'["COMPANY_NAME", "TARGET_LOCATION", "SERVICE_TYPE", "SERVICE_BENEFIT_1", "SERVICE_BENEFIT_2", "SERVICE_BENEFIT_3", "SERVICE_VARIATION_1", "SERVICE_VARIATION_2", "SERVICE_VARIATION_3", "UNIQUE_SELLING_POINT", "GUARANTEE_PROMISE", "YEARS_EXPERIENCE"]',
'professional', 120),

('Hero - Local Authority', 'hero',
'{TARGET_LOCATION}''s Premier {SERVICE_TYPE} Specialists - {COMPANY_NAME}

For over {YEARS_EXPERIENCE} years, {COMPANY_NAME} has been {TARGET_LOCATION}''s go-to source for professional {SERVICE_TYPE} services. We understand the unique needs of {TARGET_LOCATION} {TARGET_DEMOGRAPHIC} and deliver customized solutions that exceed expectations.

Our locally-owned business takes pride in {LOCAL_CONNECTION} and {COMMUNITY_INVOLVEMENT}. From {NEIGHBORHOOD_1} to {NEIGHBORHOOD_2}, {TARGET_LOCATION} residents choose {COMPANY_NAME} for {SERVICE_TYPE} because of our {REPUTATION_FACTOR}.

Join hundreds of satisfied {TARGET_LOCATION} customers who trust {COMPANY_NAME} for {SERVICE_TYPE}. Call now: {PHONE_NUMBER}',
'["COMPANY_NAME", "TARGET_LOCATION", "SERVICE_TYPE", "YEARS_EXPERIENCE", "TARGET_DEMOGRAPHIC", "LOCAL_CONNECTION", "COMMUNITY_INVOLVEMENT", "NEIGHBORHOOD_1", "NEIGHBORHOOD_2", "REPUTATION_FACTOR", "PHONE_NUMBER"]',
'friendly', 110),

-- About Us Section Templates  
('About - Expertise Focus', 'about',
'About {COMPANY_NAME} - Your Trusted {SERVICE_TYPE} Experts in {TARGET_LOCATION}

{COMPANY_NAME} was founded with a simple mission: to provide {TARGET_LOCATION} with the highest quality {SERVICE_TYPE} services available. Our team of certified professionals brings {COMBINED_EXPERIENCE} years of combined experience to every project.

What sets us apart:
• {DIFFERENTIATOR_1}
• {DIFFERENTIATOR_2} 
• {DIFFERENTIATOR_3}
• {DIFFERENTIATOR_4}

We''ve successfully completed over {PROJECT_COUNT} {SERVICE_TYPE} projects throughout {TARGET_LOCATION}, earning a reputation for {REPUTATION_QUALITY}. Our commitment to {COMPANY_VALUES} has made us the preferred choice for {TARGET_DEMOGRAPHIC} across {COVERAGE_AREAS}.

When you choose {COMPANY_NAME}, you''re choosing {YEARS_EXPERIENCE} years of expertise, {CERTIFICATIONS}, and a team that treats every project with the care and attention it deserves.',
'["COMPANY_NAME", "SERVICE_TYPE", "TARGET_LOCATION", "COMBINED_EXPERIENCE", "DIFFERENTIATOR_1", "DIFFERENTIATOR_2", "DIFFERENTIATOR_3", "DIFFERENTIATOR_4", "PROJECT_COUNT", "REPUTATION_QUALITY", "COMPANY_VALUES", "TARGET_DEMOGRAPHIC", "COVERAGE_AREAS", "YEARS_EXPERIENCE", "CERTIFICATIONS"]',
'professional', 140),

('About - Local Connection', 'about',
'Proudly Serving {TARGET_LOCATION} - The {COMPANY_NAME} Story

Born and raised in {TARGET_LOCATION}, {FOUNDER_NAME} started {COMPANY_NAME} because {FOUNDING_STORY}. Since {FOUNDING_YEAR}, we''ve been dedicated to providing exceptional {SERVICE_TYPE} services to our neighbors and friends throughout {TARGET_LOCATION}.

As a locally-owned business, we understand {LOCAL_INSIGHT_1} and {LOCAL_INSIGHT_2}. This intimate knowledge of {TARGET_LOCATION} allows us to deliver {SERVICE_TYPE} solutions that are perfectly tailored to our community''s needs.

Our {TARGET_LOCATION} roots run deep:
• {LOCAL_INVOLVEMENT_1}
• {LOCAL_INVOLVEMENT_2}
• {LOCAL_INVOLVEMENT_3}

From {LOCAL_LANDMARK_1} to {LOCAL_LANDMARK_2}, {COMPANY_NAME} has helped thousands of {TARGET_LOCATION} families with their {SERVICE_TYPE} needs. We''re not just your {SERVICE_TYPE} provider - we''re your neighbors.',
'["COMPANY_NAME", "TARGET_LOCATION", "FOUNDER_NAME", "FOUNDING_STORY", "FOUNDING_YEAR", "SERVICE_TYPE", "LOCAL_INSIGHT_1", "LOCAL_INSIGHT_2", "LOCAL_INVOLVEMENT_1", "LOCAL_INVOLVEMENT_2", "LOCAL_INVOLVEMENT_3", "LOCAL_LANDMARK_1", "LOCAL_LANDMARK_2"]',
'friendly', 130),

-- Services Section Templates
('Services - Comprehensive List', 'services',
'Complete {SERVICE_TYPE} Services in {TARGET_LOCATION}

{COMPANY_NAME} offers a full range of {SERVICE_TYPE} services designed to meet every need in {TARGET_LOCATION}. Our experienced team uses {TECHNOLOGY_METHODS} and {INDUSTRY_STANDARDS} to deliver exceptional results every time.

Our {TARGET_LOCATION} {SERVICE_TYPE} Services Include:

{PRIMARY_SERVICE}
{SERVICE_DESCRIPTION_1}. Perfect for {USE_CASE_1} and {USE_CASE_2}. Starting at {PRICE_RANGE_1}.

{SECONDARY_SERVICE}  
{SERVICE_DESCRIPTION_2}. Ideal for {USE_CASE_3} and {USE_CASE_4}. Pricing from {PRICE_RANGE_2}.

{TERTIARY_SERVICE}
{SERVICE_DESCRIPTION_3}. Great for {USE_CASE_5} and {USE_CASE_6}. Costs range from {PRICE_RANGE_3}.

Emergency {SERVICE_TYPE}? We provide 24/7 emergency services throughout {TARGET_LOCATION}. Call {EMERGENCY_PHONE} for immediate assistance.

All our {SERVICE_TYPE} services come with {WARRANTY_GUARANTEE} and {SATISFACTION_PROMISE}. Contact us today for your free estimate!',
'["COMPANY_NAME", "SERVICE_TYPE", "TARGET_LOCATION", "TECHNOLOGY_METHODS", "INDUSTRY_STANDARDS", "PRIMARY_SERVICE", "SERVICE_DESCRIPTION_1", "USE_CASE_1", "USE_CASE_2", "PRICE_RANGE_1", "SECONDARY_SERVICE", "SERVICE_DESCRIPTION_2", "USE_CASE_3", "USE_CASE_4", "PRICE_RANGE_2", "TERTIARY_SERVICE", "SERVICE_DESCRIPTION_3", "USE_CASE_5", "USE_CASE_6", "PRICE_RANGE_3", "EMERGENCY_PHONE", "WARRANTY_GUARANTEE", "SATISFACTION_PROMISE"]',
'professional', 180),

-- Testimonials Section Templates
('Testimonials - Customer Stories', 'testimonials',
'What {TARGET_LOCATION} Customers Say About {COMPANY_NAME}

Don''t just take our word for it. Here''s what your {TARGET_LOCATION} neighbors are saying about our {SERVICE_TYPE} services:

"{TESTIMONIAL_1}" 
- {CUSTOMER_NAME_1}, {NEIGHBORHOOD_1}

"{TESTIMONIAL_2}"
- {CUSTOMER_NAME_2}, {NEIGHBORHOOD_2}

"{TESTIMONIAL_3}"
- {CUSTOMER_NAME_3}, {NEIGHBORHOOD_3}

With over {REVIEW_COUNT} five-star reviews from satisfied {TARGET_LOCATION} customers, {COMPANY_NAME} is the clear choice for {SERVICE_TYPE}. Our commitment to {SERVICE_PHILOSOPHY} has earned us recognition as {AWARDS_RECOGNITION}.

Ready to join our growing family of satisfied customers? Contact {COMPANY_NAME} today and discover why {TARGET_LOCATION} chooses us for {SERVICE_TYPE}.',
'["COMPANY_NAME", "TARGET_LOCATION", "SERVICE_TYPE", "TESTIMONIAL_1", "CUSTOMER_NAME_1", "NEIGHBORHOOD_1", "TESTIMONIAL_2", "CUSTOMER_NAME_2", "NEIGHBORHOOD_2", "TESTIMONIAL_3", "CUSTOMER_NAME_3", "NEIGHBORHOOD_3", "REVIEW_COUNT", "SERVICE_PHILOSOPHY", "AWARDS_RECOGNITION"]',
'friendly', 120),

-- Financing Section Templates
('Financing - Options Available', 'financing',
'Flexible {SERVICE_TYPE} Financing Options in {TARGET_LOCATION}

At {COMPANY_NAME}, we believe everyone in {TARGET_LOCATION} deserves access to quality {SERVICE_TYPE} services. That''s why we offer multiple financing options to fit any budget.

Financing Options Available:
• {FINANCING_OPTION_1}: {FINANCING_DETAIL_1}
• {FINANCING_OPTION_2}: {FINANCING_DETAIL_2}  
• {FINANCING_OPTION_3}: {FINANCING_DETAIL_3}
• {FINANCING_OPTION_4}: {FINANCING_DETAIL_4}

Special Offers for {TARGET_LOCATION} Residents:
✓ {SPECIAL_OFFER_1}
✓ {SPECIAL_OFFER_2}
✓ {SPECIAL_OFFER_3}

Our financing partners include {FINANCING_PARTNERS} with approved credit. Most applications are processed within {APPROVAL_TIME} and offer {INTEREST_RATES} for qualified customers.

Don''t let budget concerns delay your {SERVICE_TYPE} project. Contact {COMPANY_NAME} today to discuss financing options and get your free estimate!',
'["COMPANY_NAME", "SERVICE_TYPE", "TARGET_LOCATION", "FINANCING_OPTION_1", "FINANCING_DETAIL_1", "FINANCING_OPTION_2", "FINANCING_DETAIL_2", "FINANCING_OPTION_3", "FINANCING_DETAIL_3", "FINANCING_OPTION_4", "FINANCING_DETAIL_4", "SPECIAL_OFFER_1", "SPECIAL_OFFER_2", "SPECIAL_OFFER_3", "FINANCING_PARTNERS", "APPROVAL_TIME", "INTEREST_RATES"]',
'professional', 140),

-- Service Areas Section Templates
('Service Areas - Coverage Map', 'service_areas',
'Professional {SERVICE_TYPE} Services Throughout {TARGET_LOCATION} and Surrounding Areas

{COMPANY_NAME} proudly serves {TARGET_LOCATION} and the greater {METRO_AREA} with comprehensive {SERVICE_TYPE} services. Our team of certified professionals is ready to help customers throughout our extensive service area.

Primary Service Areas:
• {PRIMARY_CITY}: {PRIMARY_COVERAGE}
• {SECONDARY_CITY}: {SECONDARY_COVERAGE}
• {TERTIARY_CITY}: {TERTIARY_COVERAGE}
• {QUATERNARY_CITY}: {QUATERNARY_COVERAGE}

We also provide {SERVICE_TYPE} services to:
{ADDITIONAL_AREAS}

Whether you''re located in downtown {TARGET_LOCATION}, {SUBURB_1}, {SUBURB_2}, or anywhere in between, {COMPANY_NAME} can help. We typically schedule service within {RESPONSE_TIME} and offer {EMERGENCY_AVAILABILITY} for urgent {SERVICE_TYPE} needs.

Distance from our {TARGET_LOCATION} headquarters is never a barrier to quality service. Contact us today to confirm service availability in your area and schedule your {SERVICE_TYPE} consultation.',
'["COMPANY_NAME", "SERVICE_TYPE", "TARGET_LOCATION", "METRO_AREA", "PRIMARY_CITY", "PRIMARY_COVERAGE", "SECONDARY_CITY", "SECONDARY_COVERAGE", "TERTIARY_CITY", "TERTIARY_COVERAGE", "QUATERNARY_CITY", "QUATERNARY_COVERAGE", "ADDITIONAL_AREAS", "SUBURB_1", "SUBURB_2", "RESPONSE_TIME", "EMERGENCY_AVAILABILITY"]',
'professional', 150);

-- Insert some sample industries and keywords
INSERT OR IGNORE INTO keywords (business_id, keyword, search_volume, competition_level, relevance_score, is_target_keyword) VALUES
(1, 'plumbing services', 2400, 'medium', 95, TRUE),
(1, 'emergency plumber', 1900, 'high', 90, TRUE),
(1, 'drain cleaning', 1600, 'medium', 85, TRUE),
(1, 'water heater repair', 1200, 'medium', 88, TRUE),
(1, 'leak detection', 800, 'low', 82, FALSE),
(1, 'pipe repair', 950, 'medium', 80, FALSE);