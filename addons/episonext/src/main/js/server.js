const express = require('express')
const cors = require('cors')
const path = require('path')

class EpisoNextServer {
    constructor(port = 7000) {
        this.port = port
        this.app = express()
    }

    start() {
        // Initialize middleware
        this.app.use(cors())
        this.app.use(express.json())
        
        // Serve static files from resources directory
        const resourcesPath = path.join(__dirname, '../resources')
        this.app.use(express.static(resourcesPath))
        
        // Setup routes
        this.setupRoutes()
        
        // Start server
        this.app.listen(this.port, () => {
            console.log('=================================================')
            console.log('EpisoNext server running on port ' + this.port)
            console.log('Addon available at: http://localhost:' + this.port + '/manifest.json')
            console.log('Installation link: stremio://addon/com.stremio.episonext/manifest.json')
            console.log('=================================================')
        })
    }
    
    setupRoutes() {
        // Explicitly serve manifest.json
        this.app.get('/manifest.json', (req, res) => {
            res.sendFile(path.join(__dirname, '../resources/manifest.json'))
        })
        
        // Stream handler endpoint
        this.app.get('/stream/:type/:id', (req, res) => {
            const { type, id } = req.params
            
            // Mock response for stream requests
            res.json({
                streams: [
                    {
                        name: 'EpisoNext Enhanced Stream',
                        description: 'Enhanced stream with next episode tracking',
                        url: `https://example.com/stream/${id}`
                    }
                ]
            })
        })
        
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({ status: 'ok' })
        })
        
        // Configuration endpoints (excluding sensitive info)
        this.app.get('/config', (req, res) => {
            // Return non-sensitive configuration
            res.status(200).json({
                version: '1.1.0',
                features: {
                    realTimeMonitoring: true,
                    notifications: true,
                    upcomingEpisodes: true
                }
            })
        })
    }
    
    stop() {
        // Cleanup logic here
        console.log('Stopping EpisoNext server')
    }
}

// If this file is run directly, start the server
if (require.main === module) {
    const server = new EpisoNextServer()
    server.start()
}

module.exports = EpisoNextServer 