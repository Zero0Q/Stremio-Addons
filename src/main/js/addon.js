const { addonBuilder } = require('stremio-addon-sdk')
const continueWatchingEnhancer = require('./continueWatchingEnhancer')
const NotificationManager = require('./notificationManager')

// Create and configure the addon
function createAddon(config = {}) {
    const addon = addonBuilder({
        id: 'com.stremio.episonext',
        version: '1.1.0',
        name: 'EpisoNext',
        description: 'Smart next episode tracking and real-time monitoring for Stremio',
        resources: ['stream'],
        types: ['series'],
        catalogs: [],
        idPrefixes: ['tt']
    })

    // Initialize notification manager
    const notificationManager = new NotificationManager()

    // Handler to enhance Continue Watching items
    addon.defineStreamHandler(async (args, cb) => {
        try {
            // In a real implementation, this would come from Stremio's actual Continue Watching
            const mockContinueWatchingItems = [
                {
                    id: 'tt0944947:S1E5', // Game of Thrones
                    name: 'Game of Thrones',
                    type: 'series',
                    season: 1,
                    episode: 5,
                    progress: 0.7
                },
                {
                    id: 'tt2861424:S2E8', // Better Call Saul
                    name: 'Better Call Saul',
                    type: 'series',
                    season: 2,
                    episode: 8,
                    progress: 0.9
                }
            ]

            // Enhance Continue Watching items
            const enhancedItems = await continueWatchingEnhancer.enhanceContinueWatching(
                mockContinueWatchingItems
            )

            // Start real-time monitoring
            continueWatchingEnhancer.startRealTimeMonitoring(mockContinueWatchingItems)

            // Return enhanced items
            cb(null, { 
                enhancedContinueWatching: enhancedItems.map(item => ({
                    ...item,
                    // Add custom UI hints for Stremio
                    uiHints: {
                        nextEpisodeButton: item.nextEpisode ? {
                            id: item.nextEpisode.id,
                            title: item.nextEpisode.suggestedAction.message,
                            actionText: item.nextEpisode.suggestedAction.actionText
                        } : null,
                        additionalMetadata: {
                            overview: item.overview,
                            rating: item.voteAverage
                        }
                    }
                }))
            })
        } catch (error) {
            console.error('Continue Watching enhancement error:', error)
            cb(error)
        }
    })

    // Setup event listeners for real-time monitoring
    setupEventListeners(notificationManager)

    // Periodic cache cleanup
    setInterval(() => {
        continueWatchingEnhancer.cleanupCache()
    }, 24 * 60 * 60 * 1000) // Daily cleanup

    return addon
}

// Setup event listeners for real-time monitoring
function setupEventListeners(notificationManager) {
    // Listen for upcoming episodes
    continueWatchingEnhancer.on('upcomingEpisode', (episode) => {
        // Send notification about upcoming episode
        notificationManager.sendNotification({
            title: 'Upcoming Episode',
            body: `${episode.title} from ${episode.seriesId} is coming soon on ${episode.airDate}`,
            type: 'upcoming_episode'
        })
    })

    // Listen for next episodes
    continueWatchingEnhancer.on('nextEpisodeAvailable', (episode) => {
        // Send notification about next episode
        notificationManager.sendNotification({
            title: 'Next Episode Available',
            body: `Next episode of ${episode.seriesId} is ready: ${episode.title}`,
            type: 'next_episode'
        })
    })

    // Listen for monitoring errors
    continueWatchingEnhancer.on('monitoringError', (error) => {
        // Log and potentially notify about monitoring issues
        notificationManager.sendNotification({
            title: 'Monitoring Error',
            body: 'There was an issue monitoring your series',
            type: 'error'
        })
    })
}

// Method to update watched series dynamically
function updateWatchedSeries(newWatchingItems) {
    continueWatchingEnhancer.updateWatchedSeries(newWatchingItems)
}

// Method to stop real-time monitoring
function stopMonitoring() {
    continueWatchingEnhancer.stopRealTimeMonitoring()
}

module.exports = {
    createAddon,
    updateWatchedSeries,
    stopMonitoring
} 