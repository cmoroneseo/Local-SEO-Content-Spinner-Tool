// Local SEO Spinner Pro - Frontend Application
class LocalSEOSpinner {
  constructor() {
    this.currentBusiness = null;
    this.services = [];
    this.serviceAreas = [];
    this.uniqueSellingPoints = [];
    this.init();
  }

  init() {
    this.setupTabNavigation();
    this.setupBusinessForm();
    this.loadExistingBusiness();
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        
        // Update button states
        tabButtons.forEach(btn => {
          btn.classList.remove('bg-orange-500', 'text-white', 'active');
          btn.classList.add('text-white/70');
        });
        button.classList.add('bg-orange-500', 'text-white', 'active');
        button.classList.remove('text-white/70');

        // Show/hide tab contents
        tabContents.forEach(content => {
          content.classList.add('hidden');
        });
        
        const targetContent = document.getElementById(`${targetTab}-tab`);
        if (targetContent) {
          targetContent.classList.remove('hidden');
          
          // Load tab-specific content
          this.loadTabContent(targetTab);
        }
      });
    });
  }

  setupBusinessForm() {
    // Add service functionality
    document.querySelector('.add-service-btn').addEventListener('click', () => {
      const input = document.querySelector('.service-input');
      const value = input.value.trim();
      if (value) {
        this.addService(value);
        input.value = '';
      }
    });

    // Add service area functionality
    document.querySelector('.add-area-btn').addEventListener('click', () => {
      const input = document.querySelector('.area-input');
      const value = input.value.trim();
      if (value) {
        this.addServiceArea(value);
        input.value = '';
      }
    });

    // Add USP functionality
    document.querySelector('.add-usp-btn').addEventListener('click', () => {
      const input = document.querySelector('.usp-input');
      const value = input.value.trim();
      if (value) {
        this.addUSP(value);
        input.value = '';
      }
    });

    // Handle Enter key on inputs
    document.querySelector('.service-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.add-service-btn').click();
      }
    });

    document.querySelector('.area-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.add-area-btn').click();
      }
    });

    document.querySelector('.usp-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        document.querySelector('.add-usp-btn').click();
      }
    });

    // Business form submission
    document.getElementById('business-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveBusiness();
    });
  }

  addService(serviceName) {
    this.services.push(serviceName);
    this.renderServices();
  }

  removeService(index) {
    this.services.splice(index, 1);
    this.renderServices();
  }

  renderServices() {
    const container = document.getElementById('services-list');
    container.innerHTML = '';
    
    this.services.forEach((service, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between bg-white/20 rounded-lg px-4 py-2';
      div.innerHTML = `
        <span class="text-white">${service}</span>
        <button type="button" onclick="app.removeService(${index})" class="text-red-400 hover:text-red-300">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(div);
    });
  }

  addServiceArea(areaName) {
    this.serviceAreas.push(areaName);
    this.renderServiceAreas();
  }

  removeServiceArea(index) {
    this.serviceAreas.splice(index, 1);
    this.renderServiceAreas();
  }

  renderServiceAreas() {
    const container = document.getElementById('areas-list');
    container.innerHTML = '';
    
    this.serviceAreas.forEach((area, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between bg-white/20 rounded-lg px-4 py-2';
      div.innerHTML = `
        <span class="text-white">${area}</span>
        <button type="button" onclick="app.removeServiceArea(${index})" class="text-red-400 hover:text-red-300">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(div);
    });
  }

  addUSP(usp) {
    this.uniqueSellingPoints.push(usp);
    this.renderUSPs();
  }

  removeUSP(index) {
    this.uniqueSellingPoints.splice(index, 1);
    this.renderUSPs();
  }

  renderUSPs() {
    const container = document.getElementById('usps-list');
    container.innerHTML = '';
    
    this.uniqueSellingPoints.forEach((usp, index) => {
      const div = document.createElement('div');
      div.className = 'flex items-center justify-between bg-white/20 rounded-lg px-4 py-2';
      div.innerHTML = `
        <span class="text-white">${usp}</span>
        <button type="button" onclick="app.removeUSP(${index})" class="text-red-400 hover:text-red-300">
          <i class="fas fa-times"></i>
        </button>
      `;
      container.appendChild(div);
    });
  }

  async saveBusiness() {
    const formData = {
      name: document.getElementById('company-name').value,
      industry: document.getElementById('industry').value,
      primary_location: document.getElementById('primary-location').value,
      website_url: document.getElementById('website-url').value,
      phone: document.getElementById('phone').value,
      email: document.getElementById('email').value,
      description: document.getElementById('description').value,
      unique_selling_points: JSON.stringify(this.uniqueSellingPoints),
      brand_voice: 'professional'
    };

    // Validate required fields
    if (!formData.name || !formData.industry || !formData.primary_location) {
      this.showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (this.services.length === 0) {
      this.showNotification('Please add at least one service', 'error');
      return;
    }

    if (this.serviceAreas.length === 0) {
      this.showNotification('Please add at least one service area', 'error');
      return;
    }

    try {
      this.showLoading('Saving business information...');

      // Save business
      const businessResponse = await axios.post('/api/business', formData);
      
      if (!businessResponse.data.success) {
        throw new Error(businessResponse.data.error);
      }

      const businessId = businessResponse.data.businessId;
      this.currentBusiness = { ...formData, id: businessId };

      // Save services
      if (this.services.length > 0) {
        const servicesResponse = await axios.post(`/api/business/${businessId}/services/bulk`, {
          services: this.services
        });
        
        if (!servicesResponse.data.success) {
          throw new Error(servicesResponse.data.error);
        }
      }

      // Save service areas
      if (this.serviceAreas.length > 0) {
        const areasResponse = await axios.post(`/api/business/${businessId}/areas/bulk`, {
          areas: this.serviceAreas
        });
        
        if (!areasResponse.data.success) {
          throw new Error(areasResponse.data.error);
        }
      }

      this.hideLoading();
      this.showNotification('Business information saved successfully!', 'success');
      
      // Enable other tabs
      this.enableContentTabs();
      
      // Auto-switch to sections tab
      setTimeout(() => {
        document.querySelector('[data-tab="sections"]').click();
      }, 1500);

    } catch (error) {
      this.hideLoading();
      this.showNotification(`Error: ${error.message}`, 'error');
    }
  }

  async loadExistingBusiness() {
    try {
      const response = await axios.get('/api/business');
      if (response.data.success && response.data.businesses.length > 0) {
        const business = response.data.businesses[0];
        this.currentBusiness = business;
        this.populateBusinessForm(business);
        this.enableContentTabs();
      }
    } catch (error) {
      console.log('No existing business found');
    }
  }

  populateBusinessForm(business) {
    document.getElementById('company-name').value = business.name || '';
    document.getElementById('industry').value = business.industry || '';
    document.getElementById('primary-location').value = business.primary_location || '';
    document.getElementById('website-url').value = business.website_url || '';
    document.getElementById('phone').value = business.phone || '';
    document.getElementById('email').value = business.email || '';
    document.getElementById('description').value = business.description || '';

    if (business.unique_selling_points) {
      try {
        this.uniqueSellingPoints = JSON.parse(business.unique_selling_points);
        this.renderUSPs();
      } catch (e) {
        this.uniqueSellingPoints = [];
      }
    }
  }

  enableContentTabs() {
    const tabs = ['sections', 'city-service', 'analytics', 'preview'];
    tabs.forEach(tab => {
      const button = document.querySelector(`[data-tab="${tab}"]`);
      if (button) {
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        button.disabled = false;
      }
    });
  }

  async loadTabContent(tabName) {
    if (!this.currentBusiness) return;

    switch (tabName) {
      case 'sections':
        await this.loadContentDashboard();
        break;
      case 'city-service':
        await this.loadGenerationInterface();
        break;
      case 'analytics':
        await this.loadAnalytics();
        break;
      case 'preview':
        await this.loadPreview();
        break;
    }
  }

  async loadContentDashboard() {
    const container = document.getElementById('content-dashboard');
    container.innerHTML = '<div class="text-center text-white">Loading content dashboard...</div>';

    try {
      // Load business details with services and areas
      const response = await axios.get(`/api/business/${this.currentBusiness.id}`);
      if (!response.data.success) {
        throw new Error('Failed to load business data');
      }

      const { business, services, serviceAreas } = response.data;
      
      // Load content templates
      const templatesResponse = await axios.get('/api/content/templates');
      const templates = templatesResponse.data.success ? templatesResponse.data.templates : [];

      this.renderContentDashboard(business, services, serviceAreas, templates);

    } catch (error) {
      container.innerHTML = `<div class="text-red-400 text-center">Error loading dashboard: ${error.message}</div>`;
    }
  }

  renderContentDashboard(business, services, serviceAreas, templates) {
    const container = document.getElementById('content-dashboard');
    
    const totalCombinations = services.length * serviceAreas.length * templates.length;
    
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Summary Cards -->
        <div class="bg-blue-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${services.length}</div>
          <div class="text-blue-300">Services</div>
        </div>
        <div class="bg-green-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${serviceAreas.length}</div>
          <div class="text-green-300">Service Areas</div>
        </div>
        <div class="bg-purple-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${totalCombinations}</div>
          <div class="text-purple-300">Possible Combinations</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Services List -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-tools mr-2"></i>Your Services
          </h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${services.map(service => `
              <div class="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2">
                <span class="text-white">${service.name}</span>
                <button onclick="app.deleteService(${service.id})" class="text-red-400 hover:text-red-300">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Service Areas List -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-map-marker-alt mr-2"></i>Service Areas
          </h3>
          <div class="space-y-2 max-h-64 overflow-y-auto">
            ${serviceAreas.map(area => `
              <div class="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2">
                <span class="text-white">${area.city}, ${area.state}</span>
                <button onclick="app.deleteServiceArea(${area.id})" class="text-red-400 hover:text-red-300">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Content Templates -->
      <div class="mt-8 bg-white/10 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">
          <i class="fas fa-file-alt mr-2"></i>Available Content Templates
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${templates.map(template => `
            <div class="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
              <div class="text-white font-medium mb-2">${template.name}</div>
              <div class="text-gray-300 text-sm mb-2">Type: ${template.section_type}</div>
              <div class="text-gray-400 text-xs">${template.word_count_target || 150} words target</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mt-8 text-center">
        <button onclick="app.startBulkGeneration()" class="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105 mr-4">
          <i class="fas fa-magic mr-2"></i>Generate All Content
        </button>
        <button onclick="document.querySelector('[data-tab=\"city-service\"]').click()" class="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105">
          <i class="fas fa-cog mr-2"></i>Custom Generation
        </button>
      </div>
    `;
  }

  async loadGenerationInterface() {
    const container = document.getElementById('generation-interface');
    container.innerHTML = '<div class="text-center text-white">Loading generation interface...</div>';

    try {
      // Load business data
      const response = await axios.get(`/api/business/${this.currentBusiness.id}`);
      if (!response.data.success) {
        throw new Error('Failed to load business data');
      }

      const { services, serviceAreas } = response.data;
      
      // Load templates
      const templatesResponse = await axios.get('/api/content/templates');
      const templates = templatesResponse.data.success ? templatesResponse.data.templates : [];

      this.renderGenerationInterface(services, serviceAreas, templates);

    } catch (error) {
      container.innerHTML = `<div class="text-red-400 text-center">Error loading interface: ${error.message}</div>`;
    }
  }

  renderGenerationInterface(services, serviceAreas, templates) {
    const container = document.getElementById('generation-interface');
    
    container.innerHTML = `
      <form id="generation-form" class="space-y-8">
        <!-- Service Selection -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-tools mr-2"></i>Select Services
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${services.map(service => `
              <label class="flex items-center space-x-3 bg-white/10 rounded-lg p-3 hover:bg-white/20 cursor-pointer">
                <input type="checkbox" name="services" value="${service.id}" class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                <span class="text-white">${service.name}</span>
              </label>
            `).join('')}
          </div>
          <div class="mt-4">
            <button type="button" onclick="app.toggleAllServices(true)" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg mr-2">Select All</button>
            <button type="button" onclick="app.toggleAllServices(false)" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">Clear All</button>
          </div>
        </div>

        <!-- Service Area Selection -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-map-marker-alt mr-2"></i>Select Service Areas
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            ${serviceAreas.map(area => `
              <label class="flex items-center space-x-3 bg-white/10 rounded-lg p-3 hover:bg-white/20 cursor-pointer">
                <input type="checkbox" name="areas" value="${area.id}" class="w-4 h-4 text-green-600 rounded focus:ring-green-500">
                <span class="text-white">${area.city}, ${area.state}</span>
              </label>
            `).join('')}
          </div>
          <div class="mt-4">
            <button type="button" onclick="app.toggleAllAreas(true)" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg mr-2">Select All</button>
            <button type="button" onclick="app.toggleAllAreas(false)" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">Clear All</button>
          </div>
        </div>

        <!-- Template Selection -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-file-alt mr-2"></i>Select Content Templates
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            ${templates.map(template => `
              <label class="flex items-center space-x-3 bg-white/10 rounded-lg p-3 hover:bg-white/20 cursor-pointer">
                <input type="checkbox" name="templates" value="${template.id}" class="w-4 h-4 text-purple-600 rounded focus:ring-purple-500">
                <div class="text-white">
                  <div class="font-medium">${template.name}</div>
                  <div class="text-sm text-gray-300">${template.section_type} • ${template.word_count_target || 150} words</div>
                </div>
              </label>
            `).join('')}
          </div>
          <div class="mt-4">
            <button type="button" onclick="app.toggleAllTemplates(true)" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg mr-2">Select All</button>
            <button type="button" onclick="app.toggleAllTemplates(false)" class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg">Clear All</button>
          </div>
        </div>

        <!-- Generation Options -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">
            <i class="fas fa-cog mr-2"></i>Generation Options
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-white font-medium mb-2">Content Tone</label>
              <select id="content-tone" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="professional" class="text-gray-800">Professional</option>
                <option value="friendly" class="text-gray-800">Friendly</option>
                <option value="authoritative" class="text-gray-800">Authoritative</option>
                <option value="casual" class="text-gray-800">Casual</option>
              </select>
            </div>
            <div>
              <label class="block text-white font-medium mb-2">Target Word Count</label>
              <input type="number" id="word-count-target" value="150" min="50" max="500" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-white font-medium mb-2">Custom Enhancement Prompt (Optional)</label>
            <textarea id="custom-prompt" rows="3" class="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Add specific requirements, keywords, or style preferences..."></textarea>
          </div>
        </div>

        <!-- Generation Actions -->
        <div class="text-center">
          <div id="generation-summary" class="bg-blue-500/20 rounded-xl p-4 mb-6 hidden">
            <div class="text-white text-lg font-medium mb-2">Generation Summary</div>
            <div class="text-blue-200">
              <span id="selected-services">0</span> services × 
              <span id="selected-areas">0</span> areas × 
              <span id="selected-templates">0</span> templates = 
              <span id="total-combinations" class="font-bold">0</span> pieces of content
            </div>
          </div>
          <button type="submit" class="px-10 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-105">
            <i class="fas fa-magic mr-2"></i>Generate Selected Content
          </button>
        </div>
      </form>

      <!-- Generation Results -->
      <div id="generation-results" class="mt-8 hidden">
        <h3 class="text-xl font-bold text-white mb-4">Generation Results</h3>
        <div id="results-container"></div>
      </div>
    `;

    // Setup form handlers
    this.setupGenerationForm();
  }

  setupGenerationForm() {
    const form = document.getElementById('generation-form');
    const serviceCheckboxes = form.querySelectorAll('input[name="services"]');
    const areaCheckboxes = form.querySelectorAll('input[name="areas"]');
    const templateCheckboxes = form.querySelectorAll('input[name="templates"]');

    // Update summary when selections change
    const updateSummary = () => {
      const selectedServices = form.querySelectorAll('input[name="services"]:checked').length;
      const selectedAreas = form.querySelectorAll('input[name="areas"]:checked').length;
      const selectedTemplates = form.querySelectorAll('input[name="templates"]:checked').length;
      const totalCombinations = selectedServices * selectedAreas * selectedTemplates;

      document.getElementById('selected-services').textContent = selectedServices;
      document.getElementById('selected-areas').textContent = selectedAreas;
      document.getElementById('selected-templates').textContent = selectedTemplates;
      document.getElementById('total-combinations').textContent = totalCombinations;

      const summary = document.getElementById('generation-summary');
      if (totalCombinations > 0) {
        summary.classList.remove('hidden');
      } else {
        summary.classList.add('hidden');
      }
    };

    [...serviceCheckboxes, ...areaCheckboxes, ...templateCheckboxes].forEach(checkbox => {
      checkbox.addEventListener('change', updateSummary);
    });

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.generateContent();
    });
  }

  toggleAllServices(select) {
    const checkboxes = document.querySelectorAll('input[name="services"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = select;
    });
    document.getElementById('generation-form').querySelector('input[name="services"]').dispatchEvent(new Event('change'));
  }

  toggleAllAreas(select) {
    const checkboxes = document.querySelectorAll('input[name="areas"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = select;
    });
    document.getElementById('generation-form').querySelector('input[name="areas"]').dispatchEvent(new Event('change'));
  }

  toggleAllTemplates(select) {
    const checkboxes = document.querySelectorAll('input[name="templates"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = select;
    });
    document.getElementById('generation-form').querySelector('input[name="templates"]').dispatchEvent(new Event('change'));
  }

  async generateContent() {
    const form = document.getElementById('generation-form');
    
    const selectedServices = Array.from(form.querySelectorAll('input[name="services"]:checked')).map(cb => parseInt(cb.value));
    const selectedAreas = Array.from(form.querySelectorAll('input[name="areas"]:checked')).map(cb => parseInt(cb.value));
    const selectedTemplates = Array.from(form.querySelectorAll('input[name="templates"]:checked')).map(cb => parseInt(cb.value));

    if (selectedServices.length === 0 || selectedAreas.length === 0 || selectedTemplates.length === 0) {
      this.showNotification('Please select at least one service, area, and template', 'error');
      return;
    }

    const requestData = {
      businessId: this.currentBusiness.id,
      serviceIds: selectedServices,
      serviceAreaIds: selectedAreas,
      templateIds: selectedTemplates,
      tone: document.getElementById('content-tone').value,
      wordCountTarget: parseInt(document.getElementById('word-count-target').value),
      customPrompt: document.getElementById('custom-prompt').value.trim() || undefined
    };

    try {
      this.showLoading(`Generating ${selectedServices.length * selectedAreas.length * selectedTemplates.length} pieces of content...`);

      const response = await axios.post('/api/content/generate', requestData);
      
      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      this.hideLoading();
      this.showNotification(`Successfully generated ${response.data.generated.length} pieces of content!`, 'success');
      
      this.displayGenerationResults(response.data.generated);

    } catch (error) {
      this.hideLoading();
      this.showNotification(`Generation failed: ${error.message}`, 'error');
    }
  }

  displayGenerationResults(results) {
    const resultsSection = document.getElementById('generation-results');
    const container = document.getElementById('results-container');
    
    resultsSection.classList.remove('hidden');
    
    container.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        ${results.map((result, index) => `
          <div class="bg-white/10 rounded-xl p-6 hover:bg-white/15 transition-colors">
            <div class="flex items-center justify-between mb-4">
              <div class="text-white font-medium">${result.service} • ${result.area}</div>
              <div class="text-xs text-gray-400">${result.section}</div>
            </div>
            <div class="text-sm text-gray-300 mb-4">
              <div class="mb-1"><strong>Template:</strong> ${result.template}</div>
              <div class="mb-1"><strong>Words:</strong> ${result.wordCount}</div>
              <div class="mb-1"><strong>SEO Score:</strong> 
                <span class="text-${result.seoScore >= 80 ? 'green' : result.seoScore >= 60 ? 'yellow' : 'red'}-400">
                  ${result.seoScore}/100
                </span>
              </div>
            </div>
            <div class="text-white text-sm max-h-32 overflow-y-auto mb-4 bg-black/20 rounded p-3">
              ${result.content.substring(0, 200)}${result.content.length > 200 ? '...' : ''}
            </div>
            <div class="flex space-x-2">
              <button onclick="app.viewFullContent(${index})" class="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded">
                View Full
              </button>
              <button onclick="app.copyContent(${index})" class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded">
                Copy
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-8 text-center">
        <button onclick="app.exportResults()" class="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all">
          <i class="fas fa-download mr-2"></i>Export All Results
        </button>
      </div>
    `;

    // Store results for later use
    this.lastGenerationResults = results;
  }

  async loadAnalytics() {
    const container = document.getElementById('analytics-dashboard');
    container.innerHTML = '<div class="text-center text-white">Loading analytics...</div>';

    try {
      const response = await axios.get(`/api/analytics/dashboard/${this.currentBusiness.id}`);
      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      this.renderAnalytics(response.data.analytics);

    } catch (error) {
      container.innerHTML = `<div class="text-red-400 text-center">Error loading analytics: ${error.message}</div>`;
    }
  }

  renderAnalytics(analytics) {
    const container = document.getElementById('analytics-dashboard');
    
    container.innerHTML = `
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-blue-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${analytics.summary.totalContent}</div>
          <div class="text-blue-300">Total Content</div>
        </div>
        <div class="bg-green-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${analytics.summary.coveragePercentage}%</div>
          <div class="text-green-300">Coverage</div>
        </div>
        <div class="bg-purple-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${analytics.summary.avgSeoScore}</div>
          <div class="text-purple-300">Avg SEO Score</div>
        </div>
        <div class="bg-orange-500/20 rounded-xl p-6 text-center">
          <div class="text-3xl font-bold text-white mb-2">${analytics.summary.avgWordCount}</div>
          <div class="text-orange-300">Avg Words</div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Content by Section -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">Content by Section</h3>
          <div class="space-y-3">
            ${analytics.contentBySection.map(section => `
              <div class="flex items-center justify-between">
                <span class="text-white capitalize">${section.section_type}</span>
                <span class="text-gray-300">${section.count}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Content by Service -->
        <div class="bg-white/10 rounded-xl p-6">
          <h3 class="text-xl font-bold text-white mb-4">Content by Service</h3>
          <div class="space-y-3 max-h-64 overflow-y-auto">
            ${analytics.contentByService.map(service => `
              <div class="flex items-center justify-between">
                <span class="text-white">${service.service_name}</span>
                <span class="text-gray-300">${service.count}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Top Performing Content -->
      <div class="bg-white/10 rounded-xl p-6 mb-8">
        <h3 class="text-xl font-bold text-white mb-4">Top Performing Content</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-white text-sm">
            <thead>
              <tr class="border-b border-white/20">
                <th class="text-left py-3">Service</th>
                <th class="text-left py-3">Location</th>
                <th class="text-left py-3">Section</th>
                <th class="text-left py-3">SEO Score</th>
                <th class="text-left py-3">Words</th>
              </tr>
            </thead>
            <tbody>
              ${analytics.topContent.slice(0, 10).map(content => `
                <tr class="border-b border-white/10">
                  <td class="py-3">${content.service_name}</td>
                  <td class="py-3">${content.city}, ${content.state}</td>
                  <td class="py-3">${content.section_type}</td>
                  <td class="py-3">
                    <span class="px-2 py-1 rounded text-xs ${content.seo_score >= 80 ? 'bg-green-500' : content.seo_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}">
                      ${content.seo_score}
                    </span>
                  </td>
                  <td class="py-3">${content.word_count}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="bg-white/10 rounded-xl p-6">
        <h3 class="text-xl font-bold text-white mb-4">Recent Activity (Last 30 Days)</h3>
        ${analytics.recentActivity.length > 0 ? `
          <div class="space-y-2">
            ${analytics.recentActivity.slice(0, 10).map(activity => `
              <div class="flex items-center justify-between">
                <span class="text-white">${activity.date}</span>
                <span class="text-gray-300">${activity.count} pieces generated</span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="text-gray-400 text-center py-8">No recent activity</div>
        `}
      </div>
    `;
  }

  async loadPreview() {
    const container = document.getElementById('preview-area');
    container.innerHTML = '<div class="text-center text-white">Loading preview...</div>';

    try {
      const response = await axios.get(`/api/content/generated/${this.currentBusiness.id}?limit=20`);
      if (!response.data.success) {
        throw new Error(response.data.error);
      }

      this.renderPreview(response.data.content);

    } catch (error) {
      container.innerHTML = `<div class="text-red-400 text-center">Error loading preview: ${error.message}</div>`;
    }
  }

  renderPreview(content) {
    const container = document.getElementById('preview-area');
    
    if (content.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-400 py-12">
          <i class="fas fa-file-alt text-6xl mb-4"></i>
          <div class="text-xl mb-2">No Content Generated Yet</div>
          <div class="mb-6">Generate some content to see it here</div>
          <button onclick="document.querySelector('[data-tab=\"city-service\"]').click()" class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl">
            Generate Content
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <!-- Export Options -->
      <div class="flex justify-between items-center mb-8">
        <h3 class="text-xl font-bold text-white">Generated Content Preview</h3>
        <div class="space-x-3">
          <button onclick="app.exportContent('html')" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
            <i class="fas fa-code mr-2"></i>Export HTML
          </button>
          <button onclick="app.exportContent('csv')" class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg">
            <i class="fas fa-table mr-2"></i>Export CSV
          </button>
          <button onclick="app.exportContent('json')" class="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg">
            <i class="fas fa-file-code mr-2"></i>Export JSON
          </button>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ${content.map((item, index) => `
          <div class="bg-white/10 rounded-xl p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="text-white font-medium">${item.service_name}</div>
              <div class="text-xs text-gray-400">${item.city}, ${item.state}</div>
            </div>
            <div class="text-sm text-gray-300 mb-4">
              <div class="mb-1"><strong>Section:</strong> ${item.section_type}</div>
              <div class="mb-1"><strong>Template:</strong> ${item.template_name}</div>
              <div class="mb-1"><strong>SEO Score:</strong> 
                <span class="text-${item.seo_score >= 80 ? 'green' : item.seo_score >= 60 ? 'yellow' : 'red'}-400">
                  ${item.seo_score}/100
                </span>
              </div>
            </div>
            <div class="bg-black/20 rounded p-4 mb-4">
              <div class="text-xs text-gray-400 mb-2">Meta Title:</div>
              <div class="text-white text-sm mb-3">${item.meta_title}</div>
              <div class="text-xs text-gray-400 mb-2">Meta Description:</div>
              <div class="text-gray-300 text-sm mb-3">${item.meta_description}</div>
              <div class="text-xs text-gray-400 mb-2">Content:</div>
              <div class="text-white text-sm max-h-32 overflow-y-auto">
                ${item.content.substring(0, 300)}${item.content.length > 300 ? '...' : ''}
              </div>
            </div>
            <div class="flex space-x-2">
              <button onclick="app.viewFullPreviewContent(${index})" class="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded">
                View Full
              </button>
              <button onclick="app.copyPreviewContent(${index})" class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs rounded">
                Copy
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Load More -->
      <div class="text-center mt-8">
        <button onclick="app.loadMoreContent()" class="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl">
          Load More Content
        </button>
      </div>
    `;

    // Store content for later use
    this.previewContent = content;
  }

  // Utility methods
  showLoading(message) {
    // Create or update loading overlay
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'loading-overlay';
      overlay.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center max-w-md mx-4">
        <div class="animate-spin w-12 h-12 border-4 border-white/30 border-t-white rounded-full mx-auto mb-4"></div>
        <div class="text-white text-lg font-medium">${message}</div>
      </div>
    `;
    overlay.classList.remove('hidden');
  }

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 max-w-md p-4 rounded-xl shadow-lg transform translate-x-full transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500' : 
      type === 'error' ? 'bg-red-500' : 
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    
    notification.innerHTML = `
      <div class="flex items-center text-white">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i>
        <span class="flex-1">${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-3 text-white/80 hover:text-white">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  async startBulkGeneration() {
    if (!this.currentBusiness) return;
    
    try {
      // Get all services and areas
      const response = await axios.get(`/api/business/${this.currentBusiness.id}`);
      const { services, serviceAreas } = response.data;
      
      // Get all templates
      const templatesResponse = await axios.get('/api/content/templates');
      const templates = templatesResponse.data.templates;
      
      const totalCombinations = services.length * serviceAreas.length * templates.length;
      
      const confirmed = confirm(`This will generate ${totalCombinations} pieces of content. Continue?`);
      if (!confirmed) return;
      
      // Generate all content
      const requestData = {
        businessId: this.currentBusiness.id,
        serviceIds: services.map(s => s.id),
        serviceAreaIds: serviceAreas.map(a => a.id),
        templateIds: templates.map(t => t.id),
        tone: 'professional',
        wordCountTarget: 150
      };
      
      this.showLoading(`Generating ${totalCombinations} pieces of content...`);
      
      const generateResponse = await axios.post('/api/content/generate', requestData);
      
      this.hideLoading();
      
      if (generateResponse.data.success) {
        this.showNotification(`Successfully generated ${generateResponse.data.generated.length} pieces of content!`, 'success');
        
        // Switch to preview tab
        setTimeout(() => {
          document.querySelector('[data-tab="preview"]').click();
        }, 1500);
      } else {
        throw new Error(generateResponse.data.error);
      }
      
    } catch (error) {
      this.hideLoading();
      this.showNotification(`Bulk generation failed: ${error.message}`, 'error');
    }
  }

  // Additional helper methods would go here...
  // (copyContent, viewFullContent, exportContent, etc.)
}

// Initialize the application
const app = new LocalSEOSpinner();

// Make app globally available for onclick handlers
window.app = app;