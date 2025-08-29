import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { CloudflareBindings } from './types'
import { renderer } from './renderer'

// Import route handlers
import { businessRoutes } from './routes/business'
import { contentRoutes } from './routes/content'
import { analyticsRoutes } from './routes/analytics'

const app = new Hono<{ Bindings: CloudflareBindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Use JSX renderer
app.use(renderer)

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// API Routes
app.route('/api/business', businessRoutes)
app.route('/api/content', contentRoutes)
app.route('/api/analytics', analyticsRoutes)

// Main application page
app.get('/', (c) => {
  return c.render(
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Local SEO Content Spinner Pro
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            AI-powered content generation for local businesses with unlimited features, 
            comprehensive analytics, and priority support - 10x better than the competition.
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex justify-center mb-12">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 flex space-x-2">
            <button 
              className="nav-btn px-6 py-3 bg-orange-500 text-white rounded-xl font-medium transition-all hover:bg-orange-600 active" 
              data-tab="business"
            >
              <i className="fas fa-building mr-2"></i>Business Information
            </button>
            <button 
              className="nav-btn px-6 py-3 text-white/70 rounded-xl font-medium transition-all hover:bg-white/20" 
              data-tab="sections"
            >
              <i className="fas fa-cog mr-2"></i>Content Sections
            </button>
            <button 
              className="nav-btn px-6 py-3 text-white/70 rounded-xl font-medium transition-all hover:bg-white/20" 
              data-tab="city-service"
            >
              <i className="fas fa-map-marker-alt mr-2"></i>City/Service Content
            </button>
            <button 
              className="nav-btn px-6 py-3 text-white/70 rounded-xl font-medium transition-all hover:bg-white/20" 
              data-tab="analytics"
            >
              <i className="fas fa-chart-line mr-2"></i>Analytics
            </button>
            <button 
              className="nav-btn px-6 py-3 text-white/70 rounded-xl font-medium transition-all hover:bg-white/20" 
              data-tab="preview"
            >
              <i className="fas fa-eye mr-2"></i>Preview
            </button>
          </div>
        </nav>

        {/* Business Information Tab */}
        <div id="business-tab" className="tab-content">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mr-4">
                <i className="fas fa-building text-white text-xl"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Business Information</h2>
                <p className="text-gray-300">Enter your business information to get started with content generation</p>
              </div>
            </div>

            <form id="business-form" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Company Name *</label>
                  <input 
                    type="text" 
                    id="company-name" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="ABC Plumbing Services"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Industry *</label>
                  <select 
                    id="industry" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="" className="text-gray-800">Select Industry</option>
                    <option value="plumbing" className="text-gray-800">Plumbing</option>
                    <option value="hvac" className="text-gray-800">HVAC</option>
                    <option value="electrician" className="text-gray-800">Electrical</option>
                    <option value="landscaping" className="text-gray-800">Landscaping</option>
                    <option value="roofing" className="text-gray-800">Roofing</option>
                    <option value="pest-control" className="text-gray-800">Pest Control</option>
                    <option value="cleaning" className="text-gray-800">Cleaning Services</option>
                    <option value="locksmith" className="text-gray-800">Locksmith</option>
                    <option value="auto-repair" className="text-gray-800">Auto Repair</option>
                    <option value="dental" className="text-gray-800">Dental</option>
                    <option value="legal" className="text-gray-800">Legal Services</option>
                    <option value="real-estate" className="text-gray-800">Real Estate</option>
                    <option value="home-improvement" className="text-gray-800">Home Improvement</option>
                    <option value="fitness" className="text-gray-800">Fitness/Gym</option>
                    <option value="restaurant" className="text-gray-800">Restaurant/Food</option>
                    <option value="other" className="text-gray-800">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Primary Location *</label>
                  <input 
                    type="text" 
                    id="primary-location" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="Phoenix, AZ"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Website URL (Optional)</label>
                  <input 
                    type="url" 
                    id="website-url" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="https://abcplumbing.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white font-medium mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    placeholder="info@abcplumbing.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Business Description</label>
                <textarea 
                  id="description" 
                  rows="4" 
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Describe your business, what makes you unique, and your key services..."
                ></textarea>
              </div>

              {/* Services Section */}
              <div>
                <label className="block text-white font-medium mb-2">Key Services *</label>
                <div id="services-container">
                  <div className="flex items-center space-x-3 mb-3">
                    <input 
                      type="text" 
                      className="service-input flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Add a service (e.g., Drain Cleaning)"
                    />
                    <button 
                      type="button" 
                      className="add-service-btn px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div id="services-list" className="space-y-2"></div>
              </div>

              {/* Service Areas Section */}
              <div>
                <label className="block text-white font-medium mb-2">Service Areas / Cities *</label>
                <div id="areas-container">
                  <div className="flex items-center space-x-3 mb-3">
                    <input 
                      type="text" 
                      className="area-input flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Add a city (e.g., Phoenix, AZ)"
                    />
                    <button 
                      type="button" 
                      className="add-area-btn px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div id="areas-list" className="space-y-2"></div>
              </div>

              {/* Unique Selling Points */}
              <div>
                <label className="block text-white font-medium mb-2">Unique Selling Points</label>
                <div id="usps-container">
                  <div className="flex items-center space-x-3 mb-3">
                    <input 
                      type="text" 
                      className="usp-input flex-1 px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      placeholder="Add a unique selling point"
                    />
                    <button 
                      type="button" 
                      className="add-usp-btn px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <div id="usps-list" className="space-y-2"></div>
              </div>

              <div className="flex justify-center pt-6">
                <button 
                  type="submit" 
                  id="save-business-btn" 
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <i className="fas fa-save"></i>
                  <span>Save Business Information</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Content Generation Tabs (hidden initially) */}
        <div id="sections-tab" className="tab-content hidden">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Content Generation Dashboard</h2>
            <div id="content-dashboard">Loading...</div>
          </div>
        </div>

        <div id="city-service-tab" className="tab-content hidden">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">City/Service Content Generation</h2>
            <div id="generation-interface">Loading...</div>
          </div>
        </div>

        <div id="analytics-tab" className="tab-content hidden">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Analytics & Performance</h2>
            <div id="analytics-dashboard">Loading...</div>
          </div>
        </div>

        <div id="preview-tab" className="tab-content hidden">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Content Preview & Export</h2>
            <div id="preview-area">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  )
})

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default app
