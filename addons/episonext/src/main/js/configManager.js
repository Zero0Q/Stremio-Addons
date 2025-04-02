const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

/**
 * EpisoNext Configuration Manager
 * Handles loading, saving, and validating configuration for the EpisoNext addon
 */
class ConfigManager {
    constructor() {
        this.configPath = this._getConfigPath()
        this.config = this._loadConfig()
    }

    /**
     * Get the configuration file path
     * @returns {string} Path to the configuration file
     */
    _getConfigPath() {
        // Determine config directory based on environment
        let configDir
        
        if (process.env.NODE_ENV === 'production') {
            // In production, use standard locations based on OS
            if (process.platform === 'win32') {
                configDir = path.join(process.env.APPDATA || '', 'EpisoNext')
            } else if (process.platform === 'darwin') {
                configDir = path.join(process.env.HOME || '', 'Library', 'Preferences', 'EpisoNext')
            } else {
                configDir = path.join(process.env.HOME || '', '.config', 'episonext')
            }
        } else {
            // In development, use local config directory
            configDir = path.join(__dirname, '../../config')
        }

        // Create config directory if it doesn't exist
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true })
        }

        return path.join(configDir, 'app-config.json')
    }

    /**
     * Load configuration from file
     * @returns {Object} Configuration object
     */
    _loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                const configData = fs.readFileSync(this.configPath, 'utf8')
                const config = JSON.parse(configData)
                return this._validateConfig(config)
            }
        } catch (error) {
            console.error('EpisoNext configuration error:', error)
        }

        // Return default configuration if loading fails
        return this._getDefaultConfig()
    }

    /**
     * Get default configuration
     * @returns {Object} Default configuration
     */
    _getDefaultConfig() {
        return {
            addonName: 'EpisoNext',
            addonVersion: '1.0.0',
            tmdb: {
                enabled: true,
                apiKey: '',
                includeAdult: false
            },
            realDebrid: {
                enabled: false,
                apiKey: ''
            },
            notifications: {
                pushNotifications: true,
                email: '',
                notifyOnNewEpisodes: true,
                notifyOnUpcomingEpisodes: true
            },
            displayPreferences: {
                theme: 'auto',
                showRatings: true,
                showOverviews: true
            },
            advanced: {
                cacheExpirationHours: 24,
                pollingIntervalMinutes: 60,
                completionThreshold: 0.9,
                upcomingEpisodesLookAheadDays: 30
            }
        }
    }

    /**
     * Validate configuration object
     * @param {Object} config - Configuration to validate
     * @returns {Object} Validated configuration
     */
    _validateConfig(config) {
        const defaultConfig = this._getDefaultConfig()
        
        // Ensure all required sections exist
        const validatedConfig = {
            addonName: defaultConfig.addonName,
            addonVersion: defaultConfig.addonVersion,
            tmdb: { ...defaultConfig.tmdb, ...config.tmdb },
            realDebrid: { ...defaultConfig.realDebrid, ...config.realDebrid },
            notifications: { ...defaultConfig.notifications, ...config.notifications },
            displayPreferences: { ...defaultConfig.displayPreferences, ...config.displayPreferences },
            advanced: { ...defaultConfig.advanced, ...config.advanced }
        }

        return validatedConfig
    }

    /**
     * Get current configuration
     * @returns {Object} Current configuration
     */
    getCurrentConfig() {
        return { ...this.config }
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration to apply
     * @returns {Promise<Object>} Updated configuration
     */
    async updateConfig(newConfig) {
        try {
            // Validate and merge with existing config
            const updatedConfig = this._validateConfig({
                ...this.config,
                ...newConfig
            })

            // Save to file
            await this._saveConfig(updatedConfig)

            // Update current config
            this.config = updatedConfig

            console.log('EpisoNext configuration updated')
            return this.config
        } catch (error) {
            console.error('EpisoNext configuration error:', error)
            throw error
        }
    }

    /**
     * Save configuration to file
     * @param {Object} config - Configuration to save
     * @returns {Promise<void>}
     */
    async _saveConfig(config) {
        return new Promise((resolve, reject) => {
            const configData = JSON.stringify(config, null, 2)
            
            fs.writeFile(this.configPath, configData, 'utf8', (err) => {
                if (err) {
                    reject(err)
                } else {
                    resolve()
                }
            })
        })
    }

    /**
     * Reset configuration to defaults
     * @returns {Promise<Object>} Default configuration
     */
    async resetConfig() {
        const defaultConfig = this._getDefaultConfig()
        await this._saveConfig(defaultConfig)
        this.config = defaultConfig
        return this.config
    }

    /**
     * Get configuration file path
     * @returns {string} Path to configuration file
     */
    getConfigFilePath() {
        return this.configPath
    }
}

// Export singleton instance
module.exports = new ConfigManager() 