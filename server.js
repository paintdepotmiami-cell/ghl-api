require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contactsRoutes = require('./src/routes/contacts');
const agentRoutes = require('./src/routes/agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
});

// API Key Authentication Middleware
const authenticateApiKey = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    const expectedKey = process.env.API_SECRET;

    // Skip auth if no API_SECRET is configured (dev mode)
    if (!expectedKey) {
        console.warn('⚠️  No API_SECRET configured - running without authentication');
        return next();
    }

    if (!apiKey || apiKey !== expectedKey) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - Invalid or missing X-API-Key header'
        });
    }

    next();
};

// Routes
app.use('/api/contacts', authenticateApiKey, contactsRoutes);
app.use('/api/agent', authenticateApiKey, agentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'GHL Custom Fields API',
        version: '1.0.0',
        endpoints: {
            'POST /api/agent/:contactId/update': 'Update from CRM Agent (||| format)',
            'POST /api/agent/parse': 'Debug parser',
            'POST /api/contacts/:contactId/update': 'Update contact (JSON)',
            'POST /api/contacts/upsert': 'Create or update contact',
            'GET /api/contacts/:contactId': 'Get contact details',
            'GET /health': 'Health check'
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║     GHL Custom Fields API                     ║
║     Running on http://localhost:${PORT}          ║
╚═══════════════════════════════════════════════╝
  `);

    // Configuration check
    if (!process.env.GHL_API_KEY) {
        console.warn('⚠️  GHL_API_KEY not configured');
    }
    if (!process.env.GHL_LOCATION_ID) {
        console.warn('⚠️  GHL_LOCATION_ID not configured');
    }
    if (!process.env.API_SECRET) {
        console.warn('⚠️  API_SECRET not configured - API auth disabled');
    }
});
