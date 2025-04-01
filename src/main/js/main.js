const { app, BrowserWindow } = require('electron')
const configManager = require('./configManager')
const configUI = require('./configUI')
const continueWatchingEnhancer = require('./continueWatchingEnhancer')

class EpisoNextApp {
    constructor() {
        this.mainWindow = null
        this.configWindow = null
    }

    // Initialize the application
    initialize() {
        // Handle app ready event
        app.whenReady().then(() => {
            console.log('EpisoNext application starting...')
            // Initialize configuration UI
            configUI.initialize()

            // Check if first-time setup is needed
            this.checkFirstTimeSetup()

            // Create main application window
            this.createMainWindow()

            // Setup app lifecycle events
            this.setupAppEvents()
        })
    }

    // Check if first-time setup is required
    checkFirstTimeSetup() {
        const currentConfig = configManager.getCurrentConfig()

        // Check if any critical API keys are missing
        if (!currentConfig.tmdb.apiKey || !currentConfig.realDebrid.apiKey) {
            // Open configuration window
            this.openConfigurationWindow()
        }
    }

    // Create main application window
    createMainWindow() {
        this.mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            title: 'EpisoNext',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        // Load main application interface
        this.mainWindow.loadFile(this.getMainInterfacePath())

        // Setup main window events
        this.setupMainWindowEvents()
    }

    // Get path to main interface HTML
    getMainInterfacePath() {
        const path = require('path')
        return path.join(__dirname, 'main-interface.html')
    }

    // Open configuration window
    openConfigurationWindow() {
        if (this.configWindow) {
            this.configWindow.focus()
            return
        }

        this.configWindow = new BrowserWindow({
            width: 800,
            height: 600,
            title: 'EpisoNext Configuration',
            parent: this.mainWindow,
            modal: true,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        // Load configuration interface
        this.configWindow.loadFile(configUI.getConfigurationHTMLPath())

        // Handle window closed event
        this.configWindow.on('closed', () => {
            this.configWindow = null
        })
    }

    // Setup main window events
    setupMainWindowEvents() {
        // Handle window closed
        this.mainWindow.on('closed', () => {
            this.mainWindow = null
        })

        // Start real-time monitoring when window is ready
        this.mainWindow.webContents.on('did-finish-load', () => {
            this.startRealTimeMonitoring()
        })
    }

    // Start real-time monitoring
    startRealTimeMonitoring() {
        const config = configManager.getCurrentConfig()

        // Only start monitoring if required services are enabled
        if (config.tmdb.enabled && config.tmdb.apiKey) {
            // Get current watching items (this would typically come from Stremio)
            const mockWatchingItems = [
                {
                    id: 'tt0944947:S1E5', // Game of Thrones
                    name: 'Game of Thrones',
                    type: 'series',
                    season: 1,
                    episode: 5,
                    progress: 0.7
                }
            ]

            continueWatchingEnhancer.startRealTimeMonitoring(mockWatchingItems)
        }
    }

    // Setup app lifecycle events
    setupAppEvents() {
        // macOS specific behaviors
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createMainWindow()
            }
        })

        // Quit when all windows are closed
        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        // Stop real-time monitoring before quitting
        app.on('before-quit', () => {
            continueWatchingEnhancer.stopRealTimeMonitoring()
        })
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
                    ipcRenderer.send('open-configuration')
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

// Initialize and run the application
const addonApp = new EpisoNextApp()
addonApp.initialize()

module.exports = addonApp 