import { Hono } from 'hono'
import { CloudflareBindings, ContentGenerationRequest, GeneratedContent, ContentProject } from '../types'

export const contentRoutes = new Hono<{ Bindings: CloudflareBindings }>()

// Get all content templates
contentRoutes.get('/templates', async (c) => {
  try {
    const { env } = c
    const { results } = await env.DB.prepare(
      'SELECT * FROM content_templates WHERE is_active = 1 ORDER BY section_type, name'
    ).all()
    
    return c.json({ success: true, templates: results })
  } catch (error) {
    console.error('Error fetching templates:', error)
    return c.json({ success: false, error: 'Failed to fetch templates' }, 500)
  }
})

// Generate content for specific combinations
contentRoutes.post('/generate', async (c) => {
  try {
    const { env } = c
    const request: ContentGenerationRequest = await c.req.json()
    
    if (!request.businessId || !request.serviceIds.length || !request.serviceAreaIds.length || !request.templateIds.length) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }

    // Get business info
    const business = await env.DB.prepare(
      'SELECT * FROM businesses WHERE id = ?'
    ).bind(request.businessId).first()

    if (!business) {
      return c.json({ success: false, error: 'Business not found' }, 404)
    }

    // Get services
    const servicesQuery = env.DB.prepare(
      `SELECT * FROM services WHERE id IN (${request.serviceIds.map(() => '?').join(',')}) AND business_id = ?`
    )
    const services = await servicesQuery.bind(...request.serviceIds, request.businessId).all()

    // Get service areas
    const areasQuery = env.DB.prepare(
      `SELECT * FROM service_areas WHERE id IN (${request.serviceAreaIds.map(() => '?').join(',')}) AND business_id = ?`
    )
    const areas = await areasQuery.bind(...request.serviceAreaIds, request.businessId).all()

    // Get templates
    const templatesQuery = env.DB.prepare(
      `SELECT * FROM content_templates WHERE id IN (${request.templateIds.map(() => '?').join(',')}) AND is_active = 1`
    )
    const templates = await templatesQuery.bind(...request.templateIds).all()

    const generatedContent = []
    const totalCombinations = services.results.length * areas.results.length * templates.results.length

    // Generate content for each combination
    for (const service of services.results) {
      for (const area of areas.results) {
        for (const template of templates.results) {
          try {
            // Create content variables for replacement
            const variables = {
              COMPANY_NAME: business.name,
              TARGET_LOCATION: `${area.city}, ${area.state}`,
              SERVICE_TYPE: service.name,
              INDUSTRY: business.industry,
              PHONE_NUMBER: business.phone || '(555) 123-4567',
              WEBSITE_URL: business.website_url || '',
              BUSINESS_EMAIL: business.email || '',
              PRIMARY_LOCATION: business.primary_location,
              SERVICE_DESCRIPTION: service.description || `Professional ${service.name} services`,
              CITY: area.city,
              STATE: area.state,
              YEARS_EXPERIENCE: '15', // Default value, could be made configurable
              SERVICE_BENEFIT_1: 'quality workmanship',
              SERVICE_BENEFIT_2: 'affordable pricing',
              SERVICE_BENEFIT_3: 'exceptional customer service',
              UNIQUE_SELLING_POINT: 'licensed and insured professionals',
              GUARANTEE_PROMISE: '100% satisfaction guarantee',
              TARGET_DEMOGRAPHIC: 'homeowners and businesses'
            }

            // Replace variables in template
            let content = template.template_content
            for (const [key, value] of Object.entries(variables)) {
              content = content.replace(new RegExp(`{${key}}`, 'g'), value)
            }

            // Use AI to enhance the content if available
            if (env.AI && request.customPrompt) {
              try {
                const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
                  messages: [
                    {
                      role: 'system',
                      content: `You are a local SEO content expert. Enhance the following content to be more engaging, SEO-optimized, and unique. Maintain the local focus and professional tone. Target word count: ${request.wordCountTarget || template.word_count_target || 150} words.`
                    },
                    {
                      role: 'user',
                      content: `Original content: ${content}\n\nCustom requirements: ${request.customPrompt}\n\nBusiness: ${business.name} in ${area.city}, ${area.state}\nService: ${service.name}\nIndustry: ${business.industry}`
                    }
                  ]
                })

                if (aiResponse && aiResponse.response) {
                  content = aiResponse.response
                }
              } catch (aiError) {
                console.warn('AI enhancement failed, using template content:', aiError)
              }
            }

            // Calculate basic SEO metrics
            const wordCount = content.split(/\\s+/).length
            const keywordDensity = calculateKeywordDensity(content, [service.name, area.city, business.industry])
            const seoScore = calculateSEOScore(content, service.name, area.city)

            // Generate meta title and description
            const metaTitle = `${service.name} in ${area.city}, ${area.state} | ${business.name}`
            const metaDescription = content.substring(0, 155) + (content.length > 155 ? '...' : '')

            // Save generated content
            const contentResult = await env.DB.prepare(`
              INSERT INTO generated_content (
                business_id, service_id, service_area_id, template_id, section_type,
                content, word_count, seo_score, readability_score, keywords,
                meta_title, meta_description
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
              request.businessId,
              service.id,
              area.id,
              template.id,
              template.section_type,
              content,
              wordCount,
              seoScore,
              75, // Default readability score
              JSON.stringify([service.name, area.city, business.industry]),
              metaTitle,
              metaDescription
            ).run()

            generatedContent.push({
              id: contentResult.meta.last_row_id,
              service: service.name,
              area: `${area.city}, ${area.state}`,
              section: template.section_type,
              template: template.name,
              content,
              wordCount,
              seoScore,
              metaTitle,
              metaDescription
            })

          } catch (error) {
            console.error(`Error generating content for ${service.name} in ${area.city}:`, error)
          }
        }
      }
    }

    return c.json({ 
      success: true, 
      generated: generatedContent,
      totalCombinations,
      message: `Generated ${generatedContent.length} pieces of content` 
    })
    
  } catch (error) {
    console.error('Error generating content:', error)
    return c.json({ success: false, error: 'Failed to generate content' }, 500)
  }
})

// Create content project
contentRoutes.post('/projects', async (c) => {
  try {
    const { env } = c
    const project: ContentProject = await c.req.json()
    
    if (!project.business_id || !project.name) {
      return c.json({ success: false, error: 'Missing required fields' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO content_projects (business_id, name, description, status, export_format)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      project.business_id,
      project.name,
      project.description || null,
      project.status || 'draft',
      project.export_format || 'html'
    ).run()

    return c.json({ 
      success: true, 
      projectId: result.meta.last_row_id,
      message: 'Project created successfully' 
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return c.json({ success: false, error: 'Failed to create project' }, 500)
  }
})

// Get projects for a business
contentRoutes.get('/projects/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    
    const { results } = await env.DB.prepare(
      'SELECT * FROM content_projects WHERE business_id = ? ORDER BY created_at DESC'
    ).bind(businessId).all()
    
    return c.json({ success: true, projects: results })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return c.json({ success: false, error: 'Failed to fetch projects' }, 500)
  }
})

// Get generated content by business
contentRoutes.get('/generated/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const { results } = await env.DB.prepare(`
      SELECT 
        gc.*,
        s.name as service_name,
        sa.city, sa.state,
        ct.name as template_name, ct.section_type
      FROM generated_content gc
      JOIN services s ON gc.service_id = s.id
      JOIN service_areas sa ON gc.service_area_id = sa.id
      JOIN content_templates ct ON gc.template_id = ct.id
      WHERE gc.business_id = ?
      ORDER BY gc.generated_at DESC
      LIMIT ? OFFSET ?
    `).bind(businessId, limit, offset).all()
    
    return c.json({ success: true, content: results })
  } catch (error) {
    console.error('Error fetching generated content:', error)
    return c.json({ success: false, error: 'Failed to fetch content' }, 500)
  }
})

// Export content as different formats
contentRoutes.get('/export/:projectId/:format', async (c) => {
  try {
    const { env } = c
    const projectId = parseInt(c.req.param('projectId'))
    const format = c.req.param('format') // html, markdown, csv, json
    
    // Get project and associated content
    const project = await env.DB.prepare(
      'SELECT * FROM content_projects WHERE id = ?'
    ).bind(projectId).first()

    if (!project) {
      return c.json({ success: false, error: 'Project not found' }, 404)
    }

    const { results: content } = await env.DB.prepare(`
      SELECT 
        gc.*,
        s.name as service_name,
        sa.city, sa.state,
        ct.section_type, ct.name as template_name
      FROM generated_content gc
      JOIN services s ON gc.service_id = s.id
      JOIN service_areas sa ON gc.service_area_id = sa.id  
      JOIN content_templates ct ON gc.template_id = ct.id
      JOIN project_content pc ON gc.id = pc.generated_content_id
      WHERE pc.project_id = ?
      ORDER BY sa.city, s.name, ct.section_type
    `).bind(projectId).all()

    let exportData: string
    let contentType: string

    switch (format) {
      case 'html':
        exportData = generateHTMLExport(content, project)
        contentType = 'text/html'
        break
      case 'markdown':
        exportData = generateMarkdownExport(content, project)
        contentType = 'text/markdown'
        break
      case 'csv':
        exportData = generateCSVExport(content)
        contentType = 'text/csv'
        break
      case 'json':
        exportData = JSON.stringify({ project, content }, null, 2)
        contentType = 'application/json'
        break
      default:
        return c.json({ success: false, error: 'Invalid format' }, 400)
    }

    return new Response(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=\"${project.name}-${format}.${format}\"`
      }
    })

  } catch (error) {
    console.error('Error exporting content:', error)
    return c.json({ success: false, error: 'Failed to export content' }, 500)
  }
})

// Utility functions
function calculateKeywordDensity(content: string, keywords: string[]): Record<string, number> {
  const words = content.toLowerCase().split(/\\s+/)
  const totalWords = words.length
  const density: Record<string, number> = {}

  keywords.forEach(keyword => {
    const keywordWords = keyword.toLowerCase().split(/\\s+/)
    let count = 0
    
    for (let i = 0; i <= words.length - keywordWords.length; i++) {
      const phrase = words.slice(i, i + keywordWords.length).join(' ')
      if (phrase === keyword.toLowerCase()) {
        count++
      }
    }
    
    density[keyword] = (count / totalWords) * 100
  })

  return density
}

function calculateSEOScore(content: string, primaryKeyword: string, location: string): number {
  let score = 0
  const contentLower = content.toLowerCase()
  
  // Check for primary keyword (0-30 points)
  const keywordCount = (contentLower.match(new RegExp(primaryKeyword.toLowerCase(), 'g')) || []).length
  if (keywordCount > 0 && keywordCount <= 3) score += 30
  else if (keywordCount > 3) score += 15 // Keyword stuffing penalty
  
  // Check for location (0-25 points)
  if (contentLower.includes(location.toLowerCase())) score += 25
  
  // Check content length (0-20 points)
  const wordCount = content.split(/\\s+/).length
  if (wordCount >= 100 && wordCount <= 300) score += 20
  else if (wordCount >= 50) score += 10
  
  // Check for engaging elements (0-25 points)
  if (content.includes('!')) score += 5 // Exclamation marks
  if (content.match(/\\?/)) score += 5 // Questions
  if (content.match(/\\d+/)) score += 5 // Numbers
  if (content.includes('Call') || content.includes('Contact')) score += 10 // Call to action
  
  return Math.min(score, 100)
}

function generateHTMLExport(content: any[], project: any): string {
  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${project.name} - Generated Content</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .page { margin-bottom: 60px; page-break-after: always; }
    .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
    .section { margin-bottom: 30px; }
    .meta { background: #f5f5f5; padding: 10px; margin-bottom: 20px; }
  </style>
</head>
<body>`

  const groupedContent = groupContentByServiceAndArea(content)
  
  Object.entries(groupedContent).forEach(([key, sections]) => {
    html += `<div class="page">
      <div class="header">
        <h1>${sections[0].service_name} in ${sections[0].city}, ${sections[0].state}</h1>
      </div>`
    
    sections.forEach(section => {
      html += `<div class="section">
        <h2>${section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}</h2>
        <div class="meta">
          <strong>Meta Title:</strong> ${section.meta_title}<br>
          <strong>Meta Description:</strong> ${section.meta_description}
        </div>
        <div class="content">${section.content.replace(/\\n/g, '<br>')}</div>
      </div>`
    })
    
    html += '</div>'
  })

  html += '</body></html>'
  return html
}

function generateMarkdownExport(content: any[], project: any): string {
  let markdown = `# ${project.name}\\n\\n`
  
  const groupedContent = groupContentByServiceAndArea(content)
  
  Object.entries(groupedContent).forEach(([key, sections]) => {
    markdown += `## ${sections[0].service_name} in ${sections[0].city}, ${sections[0].state}\\n\\n`
    
    sections.forEach(section => {
      markdown += `### ${section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}\\n\\n`
      markdown += `**Meta Title:** ${section.meta_title}\\n\\n`
      markdown += `**Meta Description:** ${section.meta_description}\\n\\n`
      markdown += `${section.content}\\n\\n---\\n\\n`
    })
  })

  return markdown
}

function generateCSVExport(content: any[]): string {
  const headers = ['Service', 'City', 'State', 'Section Type', 'Template', 'Content', 'Word Count', 'SEO Score', 'Meta Title', 'Meta Description']
  let csv = headers.join(',') + '\\n'
  
  content.forEach(item => {
    const row = [
      `\"${item.service_name}\"`,
      `\"${item.city}\"`,
      `\"${item.state}\"`,
      `\"${item.section_type}\"`,
      `\"${item.template_name}\"`,
      `\"${item.content.replace(/\"/g, '\"\"')}\"`,
      item.word_count,
      item.seo_score,
      `\"${item.meta_title}\"`,
      `\"${item.meta_description}\"`
    ]
    csv += row.join(',') + '\\n'
  })
  
  return csv
}

function groupContentByServiceAndArea(content: any[]): Record<string, any[]> {
  const grouped: Record<string, any[]> = {}
  
  content.forEach(item => {
    const key = `${item.service_name}-${item.city}-${item.state}`
    if (!grouped[key]) {
      grouped[key] = []
    }
    grouped[key].push(item)
  })
  
  return grouped
}