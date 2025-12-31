const express = require('express');
const ghlService = require('../services/ghlService');
const { parseAgentOutput, validateParsedData } = require('../utils/agentParser');

const router = express.Router();

/**
 * POST /api/agent/:contactId/update
 * Receive raw ||| delimited output from CRM Data Governance Agent
 * Accepts:
 *   - JSON: { "rawOutput": "..." }
 *   - Raw text body (Content-Type: text/plain)
 */
router.post('/:contactId/update', express.text({ type: '*/*' }), async (req, res) => {
    const { contactId } = req.params;

    // Handle both JSON and raw text body
    let rawOutput;
    if (typeof req.body === 'string') {
        // Raw text was sent
        rawOutput = req.body;
    } else if (typeof req.body === 'object' && req.body.rawOutput) {
        // JSON with rawOutput field
        rawOutput = req.body.rawOutput;
    } else {
        rawOutput = null;
    }

    if (!contactId) {
        return res.status(400).json({
            success: false,
            error: 'contactId is required'
        });
    }

    if (!rawOutput || rawOutput.trim() === '') {
        return res.status(400).json({
            success: false,
            error: 'Body cannot be empty - send the agent output as raw text or JSON { "rawOutput": "..." }'
        });
    }

    try {
        // Parse the agent output
        console.log(`📥 Received agent output for contact ${contactId}`);
        console.log(`📄 Raw output:\n${rawOutput.substring(0, 200)}...`);

        const parsedData = parseAgentOutput(rawOutput);

        // Validate parsed data
        const validation = validateParsedData(parsedData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: validation.errors
            });
        }

        console.log(`📋 Parsed ${Object.keys(parsedData).length} fields from agent output`);

        // Update contact in GHL
        const result = await ghlService.updateContact(contactId, parsedData);

        res.json({
            ...result,
            parsedFields: Object.keys(parsedData).length,
            fields: parsedData
        });
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
});

/**
 * POST /api/agent/parse
 * Debug endpoint - parse agent output without updating GHL
 */
router.post('/parse', (req, res) => {
    const { rawOutput } = req.body;

    if (!rawOutput) {
        return res.status(400).json({
            success: false,
            error: 'rawOutput is required'
        });
    }

    try {
        const parsedData = parseAgentOutput(rawOutput);
        const validation = validateParsedData(parsedData);

        res.json({
            success: validation.valid,
            parsedFields: Object.keys(parsedData).length,
            fields: parsedData,
            validation
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
