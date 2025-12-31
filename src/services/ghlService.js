const axios = require('axios');

const GHL_API_BASE = 'https://services.leadconnectorhq.com';
const GHL_API_VERSION = '2021-07-28';

/**
 * GHL API Service
 * Handles all communication with GoHighLevel API v2
 */
class GHLService {
  constructor() {
    this.apiKey = process.env.GHL_API_KEY;
    this.locationId = process.env.GHL_LOCATION_ID;
    
    if (!this.apiKey) {
      console.warn('⚠️  GHL_API_KEY not set in environment');
    }
    if (!this.locationId) {
      console.warn('⚠️  GHL_LOCATION_ID not set in environment');
    }
  }

  /**
   * Get axios config with auth headers
   */
  getConfig() {
    return {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Version': GHL_API_VERSION,
        'Content-Type': 'application/json'
      }
    };
  }

  /**
   * Map incoming data to GHL contact format
   * Separates standard fields from custom fields
   */
  mapToGHLFormat(data) {
    // Standard GHL contact fields
    const standardFields = {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      address1: data.address1,
      city: data.city,
      state: data.state,
      postalCode: data.postal_code,
      locationId: this.locationId
    };

    // Custom fields - everything else goes here
    // GHL expects array of { key, value } or { id, value }
    const customFieldsData = [
      { key: 'language', value: data.language },
      { key: 'spam', value: data.spam },
      { key: 'rent', value: data.rent },
      { key: 'project_type', value: data.project_type },
      { key: 'scope', value: data.scope },
      { key: 'current_surface', value: data.current_surface },
      { key: 'approx_sqft', value: String(data.approx_sqft) },
      { key: 'confirmed_sqft', value: String(data.confirmed_sqft) },
      { key: 'material_preference', value: data.material_preference },
      { key: 'pattern_selected', value: data.pattern_selected },
      { key: 'color_selected', value: data.color_selected },
      { key: 'pavers_price', value: String(data.pavers_price) },
      { key: 'turf_name', value: data.turf_name },
      { key: 'turf_price', value: String(data.turf_price) },
      { key: 'instant_quote', value: String(data.instant_quote) },
      { key: 'detalle_estimado', value: data.detalle_estimado },
      { key: 'city_permits', value: data.city_permits },
      { key: 'hoa_permits', value: data.hoa_permits },
      { key: 'permit_by_us', value: data.permit_by_us },
      { key: 'permit_status', value: data.permit_status },
      { key: 'plans_sent', value: data.plans_sent },
      { key: 'survey_received', value: data.survey_received },
      { key: 'hoa_info', value: data.hoa_info },
      { key: 'hoa_info_completed', value: data.hoa_info_completed },
      { key: 'city_required_documents', value: data.city_required_documents },
      { key: 'hoa_required_documents', value: data.hoa_required_documents },
      { key: 'permit_update', value: data.permit_update },
      { key: 'estimate_send', value: data.estimate_send },
      { key: 'estimate', value: String(data.estimate) },
      { key: 'descuento_ofrecido', value: String(data.descuento_ofrecido) },
      { key: 'cierre_confirmado', value: data.cierre_confirmado },
      { key: 'start_timeframe', value: data.start_timeframe },
      { key: 'pipeline_stage', value: data.pipeline_stage },
      { key: 'comentarios__notas_adicionales', value: data.comentarios__notas_adicionales }
    ].filter(field => field.value !== undefined && field.value !== null);

    return {
      ...standardFields,
      customFields: customFieldsData
    };
  }

  /**
   * Update a contact's custom fields
   * @param {string} contactId - GHL Contact ID
   * @param {object} data - Field data to update
   */
  async updateContact(contactId, data) {
    const url = `${GHL_API_BASE}/contacts/${contactId}`;
    const payload = this.mapToGHLFormat(data);
    
    console.log(`📤 Updating contact ${contactId} with ${payload.customFields.length} custom fields`);
    
    try {
      const response = await axios.put(url, payload, this.getConfig());
      console.log(`✅ Contact ${contactId} updated successfully`);
      return {
        success: true,
        contactId: contactId,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ Error updating contact ${contactId}:`, error.response?.data || error.message);
      throw {
        success: false,
        contactId: contactId,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Create or update a contact (upsert)
   * @param {object} data - Contact data
   */
  async upsertContact(data) {
    const url = `${GHL_API_BASE}/contacts/upsert`;
    const payload = this.mapToGHLFormat(data);
    
    console.log(`📤 Upserting contact with email: ${data.email}`);
    
    try {
      const response = await axios.post(url, payload, this.getConfig());
      const contactId = response.data?.contact?.id;
      console.log(`✅ Contact upserted successfully. ID: ${contactId}`);
      return {
        success: true,
        contactId: contactId,
        isNew: response.data?.new || false,
        data: response.data
      };
    } catch (error) {
      console.error(`❌ Error upserting contact:`, error.response?.data || error.message);
      throw {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  /**
   * Get contact by ID
   * @param {string} contactId - GHL Contact ID
   */
  async getContact(contactId) {
    const url = `${GHL_API_BASE}/contacts/${contactId}`;
    
    try {
      const response = await axios.get(url, this.getConfig());
      return {
        success: true,
        contact: response.data?.contact
      };
    } catch (error) {
      throw {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }
}

module.exports = new GHLService();
