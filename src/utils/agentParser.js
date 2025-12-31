/**
 * Parser for CRM Data Governance Agent output
 * Converts "|||" delimited format to JSON
 */

// Mapping from agent output field names to GHL custom field keys
const FIELD_MAPPING = {
    'Pipeline Name': null, // Read-only, don't update
    'Pipeline Stage': 'pipeline_stage',
    'Project Type': 'project_type',
    'Scope': 'scope',
    'Approximate Sqft': 'approx_sqft',
    'Confirmed Sqft': 'confirmed_sqft',
    'Current Surface': 'current_surface',
    'Material Preference': 'material_preference',
    'Pattern Selected': 'pattern_selected',
    'Color Selected': 'color_selected',
    'City Permit Needed': 'city_permits',
    'HOA Permit Needed': 'hoa_permits',
    'Permit Managed By Us': 'permit_by_us',
    'Permit Status': 'permit_status',
    'HOA Info': 'hoa_info',
    'HOA Required Documents': 'hoa_required_documents',
    'City Required Documents': 'city_required_documents',
    'HOA Info Completed': 'hoa_info_completed',
    'Survey Received': 'survey_received',
    'Plans Sent': 'plans_sent',
    'On-Site Visit': 'on_site_visit',
    'Start Timeframe': 'start_timeframe',
    'Initial Price Offered': 'initial_price_offered',
    'Estimate Amount': 'estimate',
    'Discount Offered': 'descuento_ofrecido',
    'Estimate Sent': 'estimate_send',
    'Instant Quote': 'instant_quote',
    'Pavers Price': 'pavers_price',
    'Turf Name': 'turf_name',
    'Turf Price': 'turf_price',
    'Deal Closed': 'cierre_confirmado',
    'Pipeline Inferred Status': 'pipeline_inferred_status',
    'Additional Notes': 'comentarios__notas_adicionales'
};

// Fields that should be treated as numbers
const NUMERIC_FIELDS = [
    'approx_sqft',
    'confirmed_sqft',
    'estimate',
    'descuento_ofrecido',
    'pavers_price',
    'turf_price',
    'instant_quote',
    'initial_price_offered'
];

/**
 * Parse the ||| delimited output from CRM Data Governance Agent
 * @param {string} agentOutput - Raw text output from the agent
 * @returns {object} - Parsed JSON object with GHL field keys
 */
function parseAgentOutput(agentOutput) {
    const result = {};

    // Split by newlines and process each line
    const lines = agentOutput.trim().split('\n');

    for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Split by ||| delimiter
        const parts = line.split('|||');
        if (parts.length !== 2) continue;

        const fieldName = parts[0].trim();
        let value = parts[1].trim();

        // Skip if value is N/A, None, or empty
        if (!value || value === 'N/A' || value === 'None' || value === 'NULL') {
            continue;
        }

        // Get the GHL field key from mapping
        const ghlKey = FIELD_MAPPING[fieldName];

        // Skip if no mapping exists (read-only fields like Pipeline Name)
        if (ghlKey === null || ghlKey === undefined) {
            continue;
        }

        // Convert numeric fields
        if (NUMERIC_FIELDS.includes(ghlKey)) {
            const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
            if (!isNaN(numValue)) {
                value = numValue;
            }
        }

        result[ghlKey] = value;
    }

    return result;
}

/**
 * Validate that required fields are present
 * @param {object} data - Parsed data object
 * @returns {object} - { valid: boolean, errors: string[] }
 */
function validateParsedData(data) {
    const errors = [];

    // Add any required field validations here
    // For now, we just ensure we have at least one field
    if (Object.keys(data).length === 0) {
        errors.push('No valid fields found in agent output');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    parseAgentOutput,
    validateParsedData,
    FIELD_MAPPING
};
