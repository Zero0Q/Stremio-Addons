const axios = require('axios')
const EventEmitter = require('events')

/**
 * EpisoNext - Continue Watching Enhancer
 * Enhances Stremio's Continue Watching items with intelligent next episode suggestions
 * and rich metadata from TMDB.
 */
class ContinueWatchingEnhancer extends EventEmitter {
    constructor(config = {}) {
        super()
        // Configuration with defaults
        this.config = {
            tmdbApiKey: config.tmdbApiKey || process.env.TMDB_API_KEY,
            cacheExpirationMs: config.cacheExpirationMs || 24 * 60 * 60 * 1000, // 24 hours
            completionThreshold: config.completionThreshold || 0.9, // 90% watched to suggest next episode
            pollingInterval: 5 * 60 * 1000, // 5 minutes
            upcomingEpisodesLookAhead: 30 // days
        }

        // In-memory caches
        this.metadataCache = new Map()
        this.upcomingEpisodesCache = new Map()
        this.watchedSeriesCache = new Set()
        this.lastCleanup = Date.now()
        
        // Real-time monitoring setup
        this.monitoringActive = false
        this.monitoringInterval = null
        this.monitoredItems = []

        console.log('EpisoNext enhancer initialized');
    }

    // Real-time Monitoring Methods
    startRealTimeMonitoring(items, intervalMs = 60000) {
        if (this.monitoringActive) return

        // Initialize watched series
        this.watchedSeriesCache = new Set(
            items.map(item => item.id.split(':')[0])
        )

        this.monitoringActive = true
        this.monitoringInterval = setInterval(
            () => this._checkForUpdates(), 
            intervalMs
        )

        // Initial check
        this._checkForUpdates()

        console.log(`EpisoNext real-time monitoring started for ${items.length} items`)
    }

    async _checkForUpdates() {
        try {
            // Enhance monitored items
            const enhancedItems = await this.enhanceContinueWatching(this.monitoredItems)
            
            // Check for items with new episodes
            const itemsWithNewEpisodes = enhancedItems.filter(item => 
                item.nextEpisode && 
                !item.nextEpisode.isContinuing &&
                item.suggestedAction === 'WATCH_NEXT_EPISODE'
            )
            
            if (itemsWithNewEpisodes.length > 0) {
                console.log(`Found ${itemsWithNewEpisodes.length} items with new episodes available`)
                // Here you would trigger notifications or update UI
                // This would connect to the notification system
            }
        } catch (error) {
            console.error('Error checking for updates:', error)
        }
    }

    async enhanceContinueWatching(watchingItems) {
        try {
            if (!Array.isArray(watchingItems) || watchingItems.length === 0) {
                return []
            }

            // Clean up cache if needed
            this._cleanupCache()

            // Process each item with caching
            const enhancedItems = await Promise.all(
                watchingItems.map(item => this._processItemWithCache(item))
            )

            return enhancedItems.filter(Boolean)
        } catch (error) {
            console.error('Error enhancing Continue Watching items:', error)
            return watchingItems // Return original items on error
        }
    }

    async _processItemWithCache(item) {
        try {
            if (!item || !item.id) {
                return null
            }

            // Extract basic info
            const { id, type, name, season, episode, progress } = item
            
            // Skip non-series items for now
            if (type !== 'series') {
                return item
            }

            // Get metadata with caching
            const metadata = await this._getEnrichedMetadata(name, type)
            if (!metadata) {
                return item
            }

            // Find next episode based on current progress
            const nextEpisode = this._findNextEpisode(metadata, season, episode, progress)

            // Create enhanced item
            return {
                ...item,
                metadata: {
                    title: metadata.title || name,
                    overview: metadata.overview,
                    posterUrl: metadata.poster_path ? 
                        `https://image.tmdb.org/t/p/w500${metadata.poster_path}` : null,
                    backdropUrl: metadata.backdrop_path ? 
                        `https://image.tmdb.org/t/p/original${metadata.backdrop_path}` : null,
                    rating: metadata.vote_average,
                    genres: metadata.genres?.map(g => g.name) || []
                },
                nextEpisode: nextEpisode,
                suggestedAction: this._determineSuggestedAction(progress, nextEpisode)
            }
        } catch (error) {
            console.error(`Error processing item ${item?.id}:`, error)
            return item
        }
    }

    async _getEnrichedMetadata(title, type) {
        const cacheKey = `${type}:${title}`
        
        // Check cache first
        if (this.metadataCache.has(cacheKey)) {
            const cachedData = this.metadataCache.get(cacheKey)
            if (Date.now() - cachedData.timestamp < this.config.cacheExpirationMs) {
                return cachedData.data
            }
        }

        // Fetch from TMDB if not in cache or expired
        try {
            const tmdbType = type === 'series' ? 'tv' : 'movie'
            const searchUrl = `https://api.themoviedb.org/3/search/${tmdbType}`
            
            const response = await axios.get(searchUrl, {
                params: {
                    api_key: this.config.tmdbApiKey,
                    query: title,
                    include_adult: false
                }
            })

            if (response.data.results && response.data.results.length > 0) {
                const bestMatch = response.data.results[0]
                const tmdbId = bestMatch.id
                
                // Get detailed info
                const detailsUrl = `https://api.themoviedb.org/3/${tmdbType}/${tmdbId}`
                const detailsResponse = await axios.get(detailsUrl, {
                    params: {
                        api_key: this.config.tmdbApiKey,
                        append_to_response: type === 'series' ? 'seasons,episodes' : ''
                    }
                })

                // Cache the result
                this.metadataCache.set(cacheKey, {
                    data: detailsResponse.data,
                    timestamp: Date.now()
                })

                return detailsResponse.data
            }
            
            return null
        } catch (error) {
            console.error(`Error fetching metadata for ${title}:`, error)
            return null
        }
    }

    _findNextEpisode(metadata, currentSeason, currentEpisode, progress) {
        try {
            if (!metadata || !metadata.seasons || metadata.seasons.length === 0) {
                return null
            }

            // If progress is below threshold, suggest continuing the current episode
            if (progress < this.config.completionThreshold) {
                return {
                    seasonNumber: currentSeason,
                    episodeNumber: currentEpisode,
                    isContinuing: true
                }
            }

            // Get seasons information
            const seasons = metadata.seasons
                .filter(s => s.season_number > 0) // Filter out specials (season 0)
                .sort((a, b) => a.season_number - b.season_number)

            // Find current season
            const currentSeasonInfo = seasons.find(s => s.season_number === currentSeason)
            if (!currentSeasonInfo) {
                return null
            }

            // Get episodes for current season
            const episodesUrl = `https://api.themoviedb.org/3/tv/${metadata.id}/season/${currentSeason}`
            return axios.get(episodesUrl, {
                params: {
                    api_key: this.config.tmdbApiKey
                }
            }).then(response => {
                const episodes = response.data.episodes || []
                
                // If there's a next episode in the current season
                if (currentEpisode < episodes.length) {
                    const nextEp = episodes[currentEpisode] // Episodes are 0-indexed in the array
                    return {
                        seasonNumber: currentSeason,
                        episodeNumber: currentEpisode + 1,
                        title: nextEp.name,
                        overview: nextEp.overview,
                        stillUrl: nextEp.still_path ? 
                            `https://image.tmdb.org/t/p/original${nextEp.still_path}` : null,
                        airDate: nextEp.air_date,
                        isContinuing: false
                    }
                }
                
                // Check if there's a next season
                const currentSeasonIndex = seasons.findIndex(s => s.season_number === currentSeason)
                if (currentSeasonIndex < seasons.length - 1) {
                    const nextSeason = seasons[currentSeasonIndex + 1]
                    return {
                        seasonNumber: nextSeason.season_number,
                        episodeNumber: 1,
                        title: `Season ${nextSeason.season_number} Episode 1`,
                        overview: nextSeason.overview,
                        posterUrl: nextSeason.poster_path ? 
                            `https://image.tmdb.org/t/p/w500${nextSeason.poster_path}` : null,
                        isContinuing: false
                    }
                }
                
                return null // No next episode found
            }).catch(error => {
                console.error(`Error fetching episodes for ${metadata.name} S${currentSeason}:`, error)
                return null
            })
        } catch (error) {
            console.error('Error finding next episode:', error)
            return null
        }
    }

    _determineSuggestedAction(progress, nextEpisode) {
        if (!nextEpisode) {
            return 'FINISHED_SERIES'
        }
        
        if (nextEpisode.isContinuing) {
            return 'CONTINUE_WATCHING'
        }
        
        if (progress >= this.config.completionThreshold) {
            return 'WATCH_NEXT_EPISODE'
        }
        
        return 'CONTINUE_WATCHING'
    }

    // Cleanup method to manage cache
    _cleanupCache() {
        const now = Date.now()
        
        // Only clean up once per hour to avoid unnecessary processing
        if (now - this.lastCleanup < 60 * 60 * 1000) {
            return
        }
        
        this.lastCleanup = now
        
        for (const [key, value] of this.metadataCache.entries()) {
            if (now - value.timestamp > this.config.cacheExpirationMs) {
                this.metadataCache.delete(key)
            }
        }
    }

    stopRealTimeMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval)
            this.monitoringInterval = null
            this.monitoringActive = false
            console.log('EpisoNext real-time monitoring stopped')
        }
    }

    // Method to update watched series
    updateWatchedSeries(newWatchingItems) {
        this.watchedSeriesCache = new Set(
            newWatchingItems.map(item => item.id.split(':')[0])
        )
    }
}

// Example usage
const enhancer = module.exports = new ContinueWatchingEnhancer()

// Event listeners example
enhancer.on('upcomingEpisode', (episode) => {
    console.log('Upcoming Episode:', episode)
    // Could trigger notifications, update UI, etc.
})

enhancer.on('nextEpisodeAvailable', (episode) => {
    console.log('Next Episode Available:', episode)
    // Could suggest watching, update recommendations, etc.
})

enhancer.on('monitoringError', (error) => {
    console.error('Monitoring Error:', error)
    // Could implement error recovery or user notification
})

console.error('EpisoNext enhancer error:', error); 