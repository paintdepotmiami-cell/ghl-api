const express = require('express');
const ghlService = require('../services/ghlService');

const router = express.Router();

/**
 * POST /api/contacts/:contactId/update
 * Update an existing contact's custom fields
 */
router.post('/:contactId/update', async (req, res) => {
    const { contactId } = req.params;
    const data = req.body;

    if (!contactId) {
        return res.status(400).json({
            success: false,
            error: 'contactId is required'
        });
    }

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Request body cannot be empty'
        });
    }

    try {
        const result = await ghlService.updateContact(contactId, data);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
});

/**
 * POST /api/contacts/upsert
 * Create or update a contact based on email/phone
 */
router.post('/upsert', async (req, res) => {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Request body cannot be empty'
        });
    }

    if (!data.email && !data.phone) {
        return res.status(400).json({
            success: false,
            error: 'email or phone is required for upsert'
        });
    }

    try {
        const result = await ghlService.upsertContact(data);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
});

/**
 * GET /api/contacts/:contactId
 * Get contact details
 */
router.get('/:contactId', async (req, res) => {
    const { contactId } = req.params;

    try {
        const result = await ghlService.getContact(contactId);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json(error);
    }
});

module.exports = router;
