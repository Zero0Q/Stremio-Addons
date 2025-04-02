const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const url = require('url')
const EpisoNextServer = require('./server')
const configManager = require('./configManager')
const configUI = require('./configUI')
const continueWatchingEnhancer = require('./continueWatchingEnhancer')

class EpisoNextApp {
    constructor() {
        this.mainWindow = null
        this.configWindow = null
        this.server = new EpisoNextServer()
        
        // Set up app event listeners
        this.setupAppEvents()
    }
    
    initialize() {
        // Start the server
        this.server.start()
        
        // Create the main window
        this.createMainWindow()
        
        // Check if we need to show the configuration window
        const config = configManager.getCurrentConfig()
        if (!config.tmdb || !config.tmdb.apiKey) {
            this.openConfigurationWindow()
        } else {
            // Start real-time monitoring if we have the necessary API keys
            this.startRealTimeMonitoring()
        }
    }
    
    setupAppEvents() {
        // Quit when all windows are closed
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })
        
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow()
            }
        })
        
        app.on('before-quit', () => {
            // Stop the server when the app is closing
            if (this.server) {
                this.server.stop()
            }
        })
        
        // Set up IPC event listeners
        this.setupIpcEvents()
    }
    
    setupIpcEvents() {
        // Handle configuration updates
        ipcMain.on('update-config', (event, config) => {
            configManager.updateConfig(config)
            
            // Close config window if it exists
            if (this.configWindow) {
                this.configWindow.close()
                this.configWindow = null
            }
            
            // Start real-time monitoring with new config
            this.startRealTimeMonitoring()
        })
        
        // Handle open configuration request
        ipcMain.on('open-config', () => {
            this.openConfigurationWindow()
        })
    }
    
    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1000,
            height: 700,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        
        // Load the main interface
        this.mainWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../resources/index.html'),
            protocol: 'file:',
            slashes: true
        }))
        
        // Open DevTools in development
        if (process.env.NODE_ENV === 'development') {
            this.mainWindow.webContents.openDevTools()
        }
        
        this.mainWindow.on('closed', () => {
            this.mainWindow = null
        })
    }
    
    openConfigurationWindow() {
        if (this.configWindow) {
            this.configWindow.focus()
            return
        }
        
        this.configWindow = new BrowserWindow({
            width: 600,
            height: 400,
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })
        
        this.configWindow.loadURL(url.format({
            pathname: path.join(__dirname, '../resources/config.html'),
            protocol: 'file:',
            slashes: true
        }))
        
        this.configWindow.on('closed', () => {
            this.configWindow = null
        })
    }
    
    startRealTimeMonitoring() {
        // Start real-time monitoring if we have the necessary configuration
        const config = configManager.getCurrentConfig()
        if (config.tmdb && config.tmdb.apiKey) {
            // In a real implementation, this would start the monitoring process
            console.log('Starting real-time monitoring with TMDB API key')
        }
    }

    // Create main interface HTML
    createMainInterfaceHTML() {
        const fs = require('fs')
        const path = require('path')

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>EpisoNext</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 1200px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }
                .dashboard-section {
                    margin-bottom: 20px;
                    padding: 15px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                }
                .action-buttons {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <h1>EpisoNext</h1>

            <div class="dashboard-section" id="configStatus">
                <h2>Configuration Status</h2>
                <div id="apiKeyStatus"></div>
                <div id="monitoringStatus"></div>
            </div>

            <div class="dashboard-section" id="upcomingEpisodes">
                <h2>Upcoming Episodes</h2>
                <div id="upcomingEpisodesList"></div>
            </div>

            <div class="dashboard-section" id="nextEpisodes">
                <h2>Next Episodes</h2>
                <div id="nextEpisodesList"></div>
            </div>

            <div class="action-buttons">
                <button onclick="openConfiguration()">Open Configuration</button>
                <button onclick="refreshMonitoring()">Refresh Monitoring</button>
            </div>

            <script>
                const { ipcRenderer } = require('electron')

                // Open configuration window
                function openConfiguration() {
                    ipcRenderer.send('open-config')
                }

                // Refresh real-time monitoring
                function refreshMonitoring() {
                    ipcRenderer.send('refresh-monitoring')
                }

                // Listen for upcoming episode updates
                ipcRenderer.on('upcoming-episodes', (event, episodes) => {
                    const upcomingList = document.getElementById('upcomingEpisodesList')
                    upcomingList.innerHTML = episodes.map(episode => 
                        \`<div class="episode-item">
                            \${episode.title} - Air Date: \${episode.airDate}
                        </div>\`
                    ).join('')
                })

                // Listen for next episode updates
                ipcRenderer.on('next-episodes', (event, episodes) => {
                    const nextList = document.getElementById('nextEpisodesList')
                    nextList.innerHTML = episodes.map(episode => 
                        \`<div class="episode-item">
                            \${episode.title} - Season \${episode.seasonNumber}, Episode \${episode.episodeNumber}
                        </div>\`
                    ).join('')
                })
            </script>
        </body>
        </html>
        `

        const mainInterfacePath = path.join(__dirname, 'main-interface.html')
        fs.writeFileSync(mainInterfacePath, htmlContent, 'utf8')
    }
}

// Start the application when Electron is ready
app.whenReady().then(() => {
    const episoNextApp = new EpisoNextApp()
    episoNextApp.initialize()
})

module.exports = EpisoNextApp 