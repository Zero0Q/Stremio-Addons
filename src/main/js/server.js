const express = require('express')
const cors = require('cors')
const { createAddon } = require('./addon')
const configManager = require('./configManager')

class EpisoNextServer {
    constructor() {
        this.app = express()
        this.port = process.env.PORT || 7000
        this.addon = null
    }

    // Initialize and start the server
    async start() {
        // Configure middleware
        this.configureMiddleware()
        
        // Initialize addon
        await this.initializeAddon()
        
        // Setup routes
        this.setupRoutes()
        
        // Start listening
        this.listen()
    }

    // Configure Express middleware
    configureMiddleware() {
        this.app.use(cors())
        this.app.use(express.json())
    }

    // Initialize the Stremio addon
    async initializeAddon() {
        const config = configManager.getCurrentConfig()
        this.addon = await createAddon(config)
    }

    // Setup Express routes
    setupRoutes() {
        // Serve the addon
        this.app.use('/', this.addon.getRouter())
        
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', version: require('../../package.json').version })
        })
        
        // Configuration endpoint
        this.app.get('/config', (req, res) => {
            const config = configManager.getCurrentConfig()
            // Remove sensitive information
            const safeConfig = { ...config }
            if (safeConfig.tmdb) safeConfig.tmdb = { ...safeConfig.tmdb, apiKey: '***' }
            if (safeConfig.realDebrid) safeConfig.realDebrid = { ...safeConfig.realDebrid, apiKey: '***' }
            
            res.json(safeConfig)
        })
        
        // Update configuration endpoint
        this.app.post('/config', async (req, res) => {
            try {
                const newConfig = req.body
                await configManager.updateConfig(newConfig)
                
                // Reinitialize addon with new config
                await this.initializeAddon()
                
                res.json({ status: 'ok', message: 'Configuration updated successfully' })
            } catch (error) {
                res.status(500).json({ status: 'error', message: error.message })
            }
        })
    }

    // Start the server
    listen() {
        console.log('EpisoNext server starting...');
        this.app.listen(this.port, () => {
            console.log(`EpisoNext addon running at http://127.0.0.1:${this.port}`)
        })
    }
}

// Create and start server if this file is run directly
if (require.main === module) {
    const server = new EpisoNextServer()
    server.start().catch(error => {
        console.error('Failed to start server:', error)
        process.exit(1)
    })
}

module.exports = EpisoNextServer 