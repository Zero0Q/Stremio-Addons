const configManager = require('./configManager')
const { dialog } = require('electron')

class ConfigUI {
    constructor() {
        this.configWindow = null
    }

    // Create configuration window
    createConfigWindow() {
        const { BrowserWindow } = require('electron')
        
        this.configWindow = new BrowserWindow({
            width: 800,
            height: 600,
            title: 'EpisoNext Configuration',
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        // Load configuration HTML
        this.configWindow.loadFile(this.getConfigurationHTMLPath())

        // Setup IPC communication
        this.setupIPCHandlers()
    }

    // Get path to configuration HTML
    getConfigurationHTMLPath() {
        const path = require('path')
        return path.join(__dirname, 'config-ui.html')
    }

    // Setup IPC handlers for configuration
    setupIPCHandlers() {
        const { ipcMain } = require('electron')

        // Fetch current configuration
        ipcMain.handle('get-config', () => {
            return configManager.getCurrentConfig()
        })

        // Save configuration
        ipcMain.handle('save-config', (event, configUpdates) => {
            try {
                // Update each section of configuration
                Object.entries(configUpdates).forEach(([section, updates]) => {
                    configManager.updateConfig(section, updates)
                })

                return { success: true }
            } catch (error) {
                return { 
                    success: false, 
                    error: error.message 
                }
            }
        })

        // Validate API keys
        ipcMain.handle('validate-api-keys', async () => {
            try {
                const validationResults = await configManager.validateApiKeys()
                return {
                    success: true,
                    results: validationResults
                }
            } catch (error) {
                return {
                    success: false,
                    error: error.message
                }
            }
        })

        // Open API key help dialog
        ipcMain.handle('open-api-key-help', (event, service) => {
            const helpLinks = {
                tmdb: 'https://www.themoviedb.org/documentation/api',
                realDebrid: 'https://real-debrid.com/apidownload'
            }

            dialog.showMessageBox({
                type: 'info',
                title: `${service.toUpperCase()} API Key Help`,
                message: `How to get your ${service.toUpperCase()} API Key:`,
                detail: `Visit ${helpLinks[service]} to learn how to obtain an API key.`,
                buttons: ['Open Website', 'Cancel']
            }).then((result) => {
                if (result.response === 0) {
                    require('electron').shell.openExternal(helpLinks[service])
                }
            })
        })
    }

    // Create configuration HTML file
    createConfigurationHTML() {
        const fs = require('fs')
        const path = require('path')

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>EpisoNext Configuration</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    max-width: 800px; 
                    margin: 0 auto; 
                    padding: 20px; 
                }
                .config-section { 
                    margin-bottom: 20px; 
                    padding: 15px; 
                    border: 1px solid #ddd; 
                    border-radius: 5px; 
                }
                .input-group { 
                    margin-bottom: 10px; 
                }
                .input-group label { 
                    display: block; 
                    margin-bottom: 5px; 
                }
                .input-group input { 
                    width: 100%; 
                    padding: 8px; 
                }
                .validation-status { 
                    margin-top: 10px; 
                    padding: 10px; 
                    border-radius: 5px; 
                }
                .valid { 
                    background-color: #dff0d8; 
                    color: #3c763d; 
                }
                .invalid { 
                    background-color: #f2dede; 
                    color: #a94442; 
                }
            </style>
        </head>
        <body>
            <h1>EpisoNext Configuration</h1>
            
            <div class="config-section" id="tmdbConfig">
                <h2>TMDB Configuration</h2>
                <div class="input-group">
                    <label for="tmdbApiKey">TMDB API Key</label>
                    <input type="text" id="tmdbApiKey" name="tmdbApiKey">
                    <button onclick="validateTMDBKey()">Validate</button>
                    <button onclick="openApiKeyHelp('tmdb')">Help</button>
                    <div id="tmdbValidationStatus" class="validation-status"></div>
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="tmdbEnabled"> Enable TMDB Integration
                    </label>
                </div>
            </div>

            <div class="config-section" id="realDebridConfig">
                <h2>Real-Debrid Configuration</h2>
                <div class="input-group">
                    <label for="realDebridApiKey">Real-Debrid API Key</label>
                    <input type="text" id="realDebridApiKey" name="realDebridApiKey">
                    <button onclick="validateRealDebridKey()">Validate</button>
                    <button onclick="openApiKeyHelp('realDebrid')">Help</button>
                    <div id="realDebridValidationStatus" class="validation-status"></div>
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="realDebridEnabled"> Enable Real-Debrid Integration
                    </label>
                </div>
            </div>

            <div class="config-section" id="notificationConfig">
                <h2>Notification Settings</h2>
                <div class="input-group">
                    <label for="notificationEmail">Email for Notifications</label>
                    <input type="email" id="notificationEmail" name="notificationEmail">
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="pushNotifications"> Enable Push Notifications
                    </label>
                </div>
            </div>

            <div class="config-section" id="privacyConfig">
                <h2>Privacy Settings</h2>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="shareData"> Share Anonymous Usage Data
                    </label>
                </div>
                <div class="input-group">
                    <label>
                        <input type="checkbox" id="analyticsEnabled"> Enable Analytics
                    </label>
                </div>
            </div>

            <div class="config-section" id="displayConfig">
                <h2>Display Preferences</h2>
                <div class="input-group">
                    <label for="theme">Theme</label>
                    <select id="theme">
                        <option value="default">Default</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="language">Language</label>
                    <select id="language">
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                </div>
            </div>

            <div class="config-section">
                <button onclick="saveConfiguration()">Save Configuration</button>
                <button onclick="resetToDefault()">Reset to Default</button>
            </div>

            <script>
                const { ipcRenderer } = require('electron')

                // Load existing configuration
                async function loadConfiguration() {
                    const config = await ipcRenderer.invoke('get-config')
                    
                    // TMDB Config
                    document.getElementById('tmdbApiKey').value = config.tmdb.apiKey || ''
                    document.getElementById('tmdbEnabled').checked = config.tmdb.enabled

                    // Real-Debrid Config
                    document.getElementById('realDebridApiKey').value = config.realDebrid.apiKey || ''
                    document.getElementById('realDebridEnabled').checked = config.realDebrid.enabled

                    // Notification Config
                    document.getElementById('notificationEmail').value = config.notifications.email || ''
                    document.getElementById('pushNotifications').checked = config.notifications.pushNotifications

                    // Privacy Settings
                    document.getElementById('shareData').checked = config.privacySettings.shareData
                    document.getElementById('analyticsEnabled').checked = config.privacySettings.analyticsEnabled

                    // Display Preferences
                    document.getElementById('theme').value = config.displayPreferences.theme
                    document.getElementById('language').value = config.displayPreferences.language
                }

                // Validate TMDB Key
                async function validateTMDBKey() {
                    const tmdbApiKey = document.getElementById('tmdbApiKey').value
                    const validationStatus = document.getElementById('tmdbValidationStatus')

                    // Temporarily save the key for validation
                    await ipcRenderer.invoke('save-config', { 
                        tmdb: { apiKey: tmdbApiKey } 
                    })

                    const result = await ipcRenderer.invoke('validate-api-keys')
                    
                    if (result.success) {
                        const tmdbValidation = result.results.find(r => r.service === 'TMDB')
                        
                        if (tmdbValidation.valid) {
                            validationStatus.textContent = 'TMDB API Key is valid!'
                            validationStatus.className = 'validation-status valid'
                        } else {
                            validationStatus.textContent = 'Invalid TMDB API Key: ' + tmdbValidation.error
                            validationStatus.className = 'validation-status invalid'
                        }
                    }
                }

                // Validate Real-Debrid Key
                async function validateRealDebridKey() {
                    const realDebridApiKey = document.getElementById('realDebridApiKey').value
                    const validationStatus = document.getElementById('realDebridValidationStatus')

                    // Temporarily save the key for validation
                    await ipcRenderer.invoke('save-config', { 
                        realDebrid: { apiKey: realDebridApiKey } 
                    })

                    const result = await ipcRenderer.invoke('validate-api-keys')
                    
                    if (result.success) {
                        const realDebridValidation = result.results.find(r => r.service === 'Real-Debrid')
                        
                        if (realDebridValidation.valid) {
                            validationStatus.textContent = 'Real-Debrid API Key is valid!'
                            validationStatus.className = 'validation-status valid'
                        } else {
                            validationStatus.textContent = 'Invalid Real-Debrid API Key: ' + realDebridValidation.error
                            validationStatus.className = 'validation-status invalid'
                        }
                    }
                }

                // Open API Key Help
                function openApiKeyHelp(service) {
                    ipcRenderer.invoke('open-api-key-help', service)
                }

                // Save Configuration
                async function saveConfiguration() {
                    const configUpdates = {
                        tmdb: {
                            apiKey: document.getElementById('tmdbApiKey').value,
                            enabled: document.getElementById('tmdbEnabled').checked
                        },
                        realDebrid: {
                            apiKey: document.getElementById('realDebridApiKey').value,
                            enabled: document.getElementById('realDebridEnabled').checked
                        },
                        notifications: {
                            email: document.getElementById('notificationEmail').value,
                            pushNotifications: document.getElementById('pushNotifications').checked
                        },
                        privacySettings: {
                            shareData: document.getElementById('shareData').checked,
                            analyticsEnabled: document.getElementById('analyticsEnabled').checked
                        },
                        displayPreferences: {
                            theme: document.getElementById('theme').value,
                            language: document.getElementById('language').value
                        }
                    }

                    const result = await ipcRenderer.invoke('save-config', configUpdates)

                    if (result.success) {
                        alert('Configuration saved successfully!')
                    } else {
                        alert('Error saving configuration: ' + result.error)
                    }
                }

                // Reset to Default
                async function resetToDefault() {
                    const confirmed = confirm('Are you sure you want to reset all settings to default?')
                    if (confirmed) {
                        await ipcRenderer.invoke('reset-config')
                        loadConfiguration()
                        alert('Configuration reset to default.')
                    }
                }

                // Load configuration on page load
                loadConfiguration()
            </script>
        </body>
        </html>
        `

        // Ensure config directory exists
        const configUIPath = path.join(__dirname, 'config-ui.html')
        fs.writeFileSync(configUIPath, htmlContent, 'utf8')
    }

    // Initialize configuration UI
    initialize() {
        // Create configuration HTML
        this.createConfigurationHTML()

        // Add reset config handler
        const { ipcMain } = require('electron')
        ipcMain.handle('reset-config', () => {
            configManager.resetToDefault()
            return { success: true }
        })
    }
}

module.exports = new ConfigUI() 