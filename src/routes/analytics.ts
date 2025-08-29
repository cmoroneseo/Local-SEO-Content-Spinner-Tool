import { Hono } from 'hono'
import { CloudflareBindings } from '../types'

export const analyticsRoutes = new Hono<{ Bindings: CloudflareBindings }>()

// Get business analytics dashboard data
analyticsRoutes.get('/dashboard/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    
    if (!businessId) {
      return c.json({ success: false, error: 'Invalid business ID' }, 400)
    }

    // Get total content count
    const totalContent = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM generated_content WHERE business_id = ?'
    ).bind(businessId).first()

    // Get content by section type
    const contentBySection = await env.DB.prepare(`
      SELECT section_type, COUNT(*) as count 
      FROM generated_content 
      WHERE business_id = ? 
      GROUP BY section_type
      ORDER BY count DESC
    `).bind(businessId).all()

    // Get content by service
    const contentByService = await env.DB.prepare(`
      SELECT s.name as service_name, COUNT(gc.id) as count
      FROM services s
      LEFT JOIN generated_content gc ON s.id = gc.service_id AND gc.business_id = ?
      WHERE s.business_id = ?
      GROUP BY s.id, s.name
      ORDER BY count DESC
    `).bind(businessId, businessId).all()

    // Get content by city
    const contentByCity = await env.DB.prepare(`
      SELECT sa.city, sa.state, COUNT(gc.id) as count
      FROM service_areas sa
      LEFT JOIN generated_content gc ON sa.id = gc.service_area_id AND gc.business_id = ?
      WHERE sa.business_id = ?
      GROUP BY sa.id, sa.city, sa.state
      ORDER BY count DESC
    `).bind(businessId, businessId).all()

    // Get average SEO scores
    const seoStats = await env.DB.prepare(`
      SELECT 
        AVG(seo_score) as avg_seo_score,
        MIN(seo_score) as min_seo_score,
        MAX(seo_score) as max_seo_score,
        AVG(word_count) as avg_word_count,
        MIN(word_count) as min_word_count,
        MAX(word_count) as max_word_count
      FROM generated_content 
      WHERE business_id = ?
    `).bind(businessId).first()

    // Get recent generation activity (last 30 days)
    const recentActivity = await env.DB.prepare(`
      SELECT 
        DATE(generated_at) as date,
        COUNT(*) as count
      FROM generated_content 
      WHERE business_id = ? 
        AND generated_at >= datetime('now', '-30 days')
      GROUP BY DATE(generated_at)
      ORDER BY date DESC
    `).bind(businessId).all()

    // Get top performing content (by SEO score)
    const topContent = await env.DB.prepare(`
      SELECT 
        gc.*,
        s.name as service_name,
        sa.city, sa.state,
        ct.name as template_name
      FROM generated_content gc
      JOIN services s ON gc.service_id = s.id
      JOIN service_areas sa ON gc.service_area_id = sa.id
      JOIN content_templates ct ON gc.template_id = ct.id
      WHERE gc.business_id = ?
      ORDER BY gc.seo_score DESC
      LIMIT 10
    `).bind(businessId).all()

    // Calculate content coverage (service x area combinations)
    const totalServices = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM services WHERE business_id = ?'
    ).bind(businessId).first()

    const totalAreas = await env.DB.prepare(
      'SELECT COUNT(*) as count FROM service_areas WHERE business_id = ?'
    ).bind(businessId).first()

    const possibleCombinations = (totalServices?.count || 0) * (totalAreas?.count || 0)
    const coveragePercentage = possibleCombinations > 0 
      ? Math.round(((totalContent?.count || 0) / possibleCombinations) * 100) 
      : 0

    return c.json({ 
      success: true, 
      analytics: {
        summary: {
          totalContent: totalContent?.count || 0,
          totalServices: totalServices?.count || 0,
          totalAreas: totalAreas?.count || 0,
          possibleCombinations,
          coveragePercentage,
          avgSeoScore: Math.round(seoStats?.avg_seo_score || 0),
          avgWordCount: Math.round(seoStats?.avg_word_count || 0)
        },
        contentBySection: contentBySection.results,
        contentByService: contentByService.results,
        contentByCity: contentByCity.results,
        seoStats,
        recentActivity: recentActivity.results,
        topContent: topContent.results
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ success: false, error: 'Failed to fetch analytics' }, 500)
  }
})

// Get keyword analysis
analyticsRoutes.get('/keywords/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    
    // Get stored keywords
    const storedKeywords = await env.DB.prepare(
      'SELECT * FROM keywords WHERE business_id = ? ORDER BY relevance_score DESC'
    ).bind(businessId).all()

    // Analyze keywords from generated content
    const generatedContent = await env.DB.prepare(`
      SELECT content, keywords FROM generated_content 
      WHERE business_id = ? 
      ORDER BY generated_at DESC 
      LIMIT 100
    `).bind(businessId).all()

    // Extract and count keywords from content
    const keywordFrequency: Record<string, number> = {}
    
    generatedContent.results?.forEach((content: any) => {
      if (content.keywords) {
        try {
          const keywords = JSON.parse(content.keywords)
          keywords.forEach((keyword: string) => {
            keywordFrequency[keyword] = (keywordFrequency[keyword] || 0) + 1
          })
        } catch (e) {
          // Skip invalid JSON
        }
      }
    })

    // Convert to array and sort by frequency
    const keywordAnalysis = Object.entries(keywordFrequency)
      .map(([keyword, frequency]) => ({ keyword, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50) // Top 50 keywords

    return c.json({ 
      success: true, 
      keywords: {
        stored: storedKeywords.results,
        analysis: keywordAnalysis,
        totalContent: generatedContent.results?.length || 0
      }
    })
  } catch (error) {
    console.error('Error fetching keyword analysis:', error)
    return c.json({ success: false, error: 'Failed to fetch keyword analysis' }, 500)
  }
})

// Get content performance metrics
analyticsRoutes.get('/performance/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    
    // Get performance data by service and area combination
    const performanceData = await env.DB.prepare(`
      SELECT 
        s.name as service_name,
        sa.city, sa.state,
        COUNT(gc.id) as content_count,
        AVG(gc.seo_score) as avg_seo_score,
        AVG(gc.word_count) as avg_word_count,
        AVG(gc.readability_score) as avg_readability_score,
        MAX(gc.generated_at) as last_generated
      FROM services s
      CROSS JOIN service_areas sa
      LEFT JOIN generated_content gc ON s.id = gc.service_id AND sa.id = gc.service_area_id
      WHERE s.business_id = ? AND sa.business_id = ?
      GROUP BY s.id, sa.id, s.name, sa.city, sa.state
      ORDER BY content_count DESC, avg_seo_score DESC
    `).bind(businessId, businessId).all()

    // Get content gaps (service/area combinations without content)
    const contentGaps = performanceData.results?.filter((item: any) => item.content_count === 0) || []

    // Get high-performing combinations
    const highPerformers = performanceData.results?.filter((item: any) => 
      item.content_count > 0 && item.avg_seo_score > 80
    ) || []

    // Get low-performing combinations that need improvement
    const needsImprovement = performanceData.results?.filter((item: any) => 
      item.content_count > 0 && item.avg_seo_score < 60
    ) || []

    return c.json({ 
      success: true, 
      performance: {
        allCombinations: performanceData.results,
        contentGaps,
        highPerformers,
        needsImprovement,
        summary: {
          totalCombinations: performanceData.results?.length || 0,
          withContent: (performanceData.results?.length || 0) - contentGaps.length,
          gapsCount: contentGaps.length,
          highPerformersCount: highPerformers.length,
          needsImprovementCount: needsImprovement.length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return c.json({ success: false, error: 'Failed to fetch performance metrics' }, 500)
  }
})

// Get export statistics
analyticsRoutes.get('/exports/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    
    // Get project statistics
    const projectStats = await env.DB.prepare(`
      SELECT 
        status,
        export_format,
        COUNT(*) as count
      FROM content_projects 
      WHERE business_id = ?
      GROUP BY status, export_format
    `).bind(businessId).all()

    // Get recent projects
    const recentProjects = await env.DB.prepare(`
      SELECT * FROM content_projects 
      WHERE business_id = ?
      ORDER BY updated_at DESC
      LIMIT 10
    `).bind(businessId).all()

    return c.json({ 
      success: true, 
      exports: {
        projectStats: projectStats.results,
        recentProjects: recentProjects.results
      }
    })
  } catch (error) {
    console.error('Error fetching export statistics:', error)
    return c.json({ success: false, error: 'Failed to fetch export statistics' }, 500)
  }
})

// Add custom keyword for tracking
analyticsRoutes.post('/keywords/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    const { keyword, searchVolume, competitionLevel, relevanceScore } = await c.req.json()
    
    if (!keyword) {
      return c.json({ success: false, error: 'Keyword is required' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO keywords (business_id, keyword, search_volume, competition_level, relevance_score, is_target_keyword)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      businessId,
      keyword,
      searchVolume || 0,
      competitionLevel || 'unknown',
      relevanceScore || 50,
      true
    ).run()

    return c.json({ 
      success: true, 
      keywordId: result.meta.last_row_id,
      message: 'Keyword added successfully' 
    })
  } catch (error) {
    console.error('Error adding keyword:', error)
    return c.json({ success: false, error: 'Failed to add keyword' }, 500)
  }
})

// Record content analytics (for external tracking)
analyticsRoutes.post('/track/:contentId', async (c) => {
  try {
    const { env } = c
    const contentId = parseInt(c.req.param('contentId'))
    const { metricType, metricValue, source } = await c.req.json()
    
    if (!metricType || metricValue === undefined) {
      return c.json({ success: false, error: 'Metric type and value are required' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO content_analytics (generated_content_id, metric_type, metric_value, date_recorded, source)
      VALUES (?, ?, ?, DATE('now'), ?)
    `).bind(
      contentId,
      metricType,
      metricValue,
      source || 'manual'
    ).run()

    return c.json({ 
      success: true, 
      analyticsId: result.meta.last_row_id,
      message: 'Analytics recorded successfully' 
    })
  } catch (error) {
    console.error('Error recording analytics:', error)
    return c.json({ success: false, error: 'Failed to record analytics' }, 500)
  }
})

// Get content trends over time
analyticsRoutes.get('/trends/:businessId', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('businessId'))
    const days = parseInt(c.req.query('days') || '30')
    
    // Get content generation trends
    const generationTrends = await env.DB.prepare(`
      SELECT 
        DATE(generated_at) as date,
        COUNT(*) as content_count,
        AVG(seo_score) as avg_seo_score,
        AVG(word_count) as avg_word_count
      FROM generated_content 
      WHERE business_id = ? 
        AND generated_at >= datetime('now', '-${days} days')
      GROUP BY DATE(generated_at)
      ORDER BY date
    `).bind(businessId).all()

    // Get section type trends
    const sectionTrends = await env.DB.prepare(`
      SELECT 
        DATE(generated_at) as date,
        section_type,
        COUNT(*) as count
      FROM generated_content 
      WHERE business_id = ? 
        AND generated_at >= datetime('now', '-${days} days')
      GROUP BY DATE(generated_at), section_type
      ORDER BY date, section_type
    `).bind(businessId).all()

    return c.json({ 
      success: true, 
      trends: {
        generation: generationTrends.results,
        sections: sectionTrends.results,
        period: `${days} days`
      }
    })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return c.json({ success: false, error: 'Failed to fetch trends' }, 500)
  }
})