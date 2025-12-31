const express = require('express');
const ghlService = require('../services/ghlService');
const { parseAgentOutput, validateParsedData } = require('../utils/agentParser');

const router = express.Router();

/**
 * POST /api/agent/:contactId/update
 * Receive raw ||| delimited output from CRM Data Governance Agent
 * Parse it and update the contact in GHL
 */
router.post('/:contactId/update', async (req, res) => {
    const { contactId } = req.params;
    const { rawOutput } = req.body;

    if (!contactId) {
        return res.status(400).json({
            success: false,
            error: 'contactId is required'
        });
    }

    if (!rawOutput) {
        return res.status(400).json({
            success: false,
            error: 'rawOutput is required - provide the agent\'s ||| delimited output'
        });
    }

    try {
        // Parse the agent output
        console.log(`📥 Received agent output for contact ${contactId}`);
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
