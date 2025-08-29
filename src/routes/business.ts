import { Hono } from 'hono'
import { CloudflareBindings, Business, Service, ServiceArea } from '../types'

export const businessRoutes = new Hono<{ Bindings: CloudflareBindings }>()

// Get all businesses
businessRoutes.get('/', async (c) => {
  try {
    const { env } = c
    const { results } = await env.DB.prepare(
      'SELECT * FROM businesses ORDER BY created_at DESC'
    ).all()
    
    return c.json({ success: true, businesses: results })
  } catch (error) {
    console.error('Error fetching businesses:', error)
    return c.json({ success: false, error: 'Failed to fetch businesses' }, 500)
  }
})

// Create new business
businessRoutes.post('/', async (c) => {
  try {
    const { env } = c
    const business: Business = await c.req.json()
    
    // Validate required fields
    if (!business.name || !business.industry || !business.primary_location) {
      return c.json({ 
        success: false, 
        error: 'Missing required fields: name, industry, primary_location' 
      }, 400)
    }

    // Insert business
    const result = await env.DB.prepare(`
      INSERT INTO businesses (name, industry, primary_location, website_url, phone, email, description, unique_selling_points, target_audience, brand_voice)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      business.name,
      business.industry,
      business.primary_location,
      business.website_url || null,
      business.phone || null,
      business.email || null,
      business.description || null,
      business.unique_selling_points || '[]',
      business.target_audience || null,
      business.brand_voice || 'professional'
    ).run()

    const businessId = result.meta.last_row_id

    return c.json({ 
      success: true, 
      businessId,
      message: 'Business created successfully' 
    })
  } catch (error) {
    console.error('Error creating business:', error)
    return c.json({ success: false, error: 'Failed to create business' }, 500)
  }
})

// Get business by ID with services and areas
businessRoutes.get('/:id', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('id'))
    
    if (!businessId) {
      return c.json({ success: false, error: 'Invalid business ID' }, 400)
    }

    // Get business
    const businessResult = await env.DB.prepare(
      'SELECT * FROM businesses WHERE id = ?'
    ).bind(businessId).first()

    if (!businessResult) {
      return c.json({ success: false, error: 'Business not found' }, 404)
    }

    // Get services
    const servicesResult = await env.DB.prepare(
      'SELECT * FROM services WHERE business_id = ? ORDER BY name'
    ).bind(businessId).all()

    // Get service areas
    const areasResult = await env.DB.prepare(
      'SELECT * FROM service_areas WHERE business_id = ? ORDER BY city'
    ).bind(businessId).all()

    return c.json({ 
      success: true, 
      business: businessResult,
      services: servicesResult.results,
      serviceAreas: areasResult.results
    })
  } catch (error) {
    console.error('Error fetching business:', error)
    return c.json({ success: false, error: 'Failed to fetch business' }, 500)
  }
})

// Add service to business
businessRoutes.post('/:id/services', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('id'))
    const service: Service = await c.req.json()
    
    if (!businessId || !service.name) {
      return c.json({ success: false, error: 'Invalid data' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO services (business_id, name, description, price_range, duration, benefits)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      businessId,
      service.name,
      service.description || null,
      service.price_range || null,
      service.duration || null,
      service.benefits || '[]'
    ).run()

    return c.json({ 
      success: true, 
      serviceId: result.meta.last_row_id,
      message: 'Service added successfully' 
    })
  } catch (error) {
    console.error('Error adding service:', error)
    return c.json({ success: false, error: 'Failed to add service' }, 500)
  }
})

// Add service area to business
businessRoutes.post('/:id/areas', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('id'))
    const area: ServiceArea = await c.req.json()
    
    if (!businessId || !area.city || !area.state) {
      return c.json({ success: false, error: 'Invalid data' }, 400)
    }

    const result = await env.DB.prepare(`
      INSERT INTO service_areas (business_id, city, state, zip_codes, population, demographics)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      businessId,
      area.city,
      area.state,
      area.zip_codes || '[]',
      area.population || null,
      area.demographics || '{}'
    ).run()

    return c.json({ 
      success: true, 
      areaId: result.meta.last_row_id,
      message: 'Service area added successfully' 
    })
  } catch (error) {
    console.error('Error adding service area:', error)
    return c.json({ success: false, error: 'Failed to add service area' }, 500)
  }
})

// Bulk add services
businessRoutes.post('/:id/services/bulk', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('id'))
    const { services }: { services: string[] } = await c.req.json()
    
    if (!businessId || !services || services.length === 0) {
      return c.json({ success: false, error: 'Invalid data' }, 400)
    }

    // Begin transaction-like operations
    const serviceIds = []
    
    for (const serviceName of services) {
      const result = await env.DB.prepare(`
        INSERT INTO services (business_id, name, description)
        VALUES (?, ?, ?)
      `).bind(businessId, serviceName.trim(), '').run()
      
      serviceIds.push(result.meta.last_row_id)
    }

    return c.json({ 
      success: true, 
      serviceIds,
      message: `${services.length} services added successfully` 
    })
  } catch (error) {
    console.error('Error adding services bulk:', error)
    return c.json({ success: false, error: 'Failed to add services' }, 500)
  }
})

// Bulk add service areas
businessRoutes.post('/:id/areas/bulk', async (c) => {
  try {
    const { env } = c
    const businessId = parseInt(c.req.param('id'))
    const { areas }: { areas: string[] } = await c.req.json()
    
    if (!businessId || !areas || areas.length === 0) {
      return c.json({ success: false, error: 'Invalid data' }, 400)
    }

    const areaIds = []
    
    for (const areaName of areas) {
      // Parse "City, State" format
      const parts = areaName.split(',').map(p => p.trim())
      const city = parts[0] || areaName.trim()
      const state = parts[1] || 'Unknown'
      
      const result = await env.DB.prepare(`
        INSERT INTO service_areas (business_id, city, state)
        VALUES (?, ?, ?)
      `).bind(businessId, city, state).run()
      
      areaIds.push(result.meta.last_row_id)
    }

    return c.json({ 
      success: true, 
      areaIds,
      message: `${areas.length} service areas added successfully` 
    })
  } catch (error) {
    console.error('Error adding areas bulk:', error)
    return c.json({ success: false, error: 'Failed to add service areas' }, 500)
  }
})

// Delete service
businessRoutes.delete('/services/:serviceId', async (c) => {
  try {
    const { env } = c
    const serviceId = parseInt(c.req.param('serviceId'))
    
    await env.DB.prepare('DELETE FROM services WHERE id = ?').bind(serviceId).run()
    
    return c.json({ success: true, message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return c.json({ success: false, error: 'Failed to delete service' }, 500)
  }
})

// Delete service area
businessRoutes.delete('/areas/:areaId', async (c) => {
  try {
    const { env } = c
    const areaId = parseInt(c.req.param('areaId'))
    
    await env.DB.prepare('DELETE FROM service_areas WHERE id = ?').bind(areaId).run()
    
    return c.json({ success: true, message: 'Service area deleted successfully' })
  } catch (error) {
    console.error('Error deleting service area:', error)
    return c.json({ success: false, error: 'Failed to delete service area' }, 500)
  }
})