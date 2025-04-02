const Parser = require('rss-parser')
const parser = new Parser()

const needle = require('needle')
const cheerio = require('cheerio')
const async = require('async')
const express = require('express')
const rateLimit = require('express-rate-limit')

let top10 = []
let oldImdbIds = []
let isUpdating = false
let lastUpdateTime = null
let lastError = null

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
})

const getMeta = (imdbId, cb) => {
    const found = top10.some(meta => {
      if (meta && meta.imdb_id && meta.imdb_id === imdbId) {
        cb(meta)
        return true
      }
    })
    if (!found) {
      needle.get('https://v3-cinemeta.strem.io/meta/movie/' + imdbId + '.json', {
        timeout: 10000 // 10 second timeout
      }, (err, resp, body) => {
        if (err) {
          console.error('Error fetching meta for', imdbId, err)
          lastError = err
          cb(false)
          return
        }
        cb(body && body.meta ? body.meta : false)
      })
    }
}

let updateMetasTimer

function updateMetas() {
  if (updateMetasTimer) {
    clearTimeout(updateMetasTimer)
    updateMetasTimer = false
  }

  const metas = []
  const metaQueue = async.queue((imdbId, cb) => {
    getMeta(imdbId, (metaObj) => {
      if (metaObj)
        metas.push(metaObj)
      cb()
    })
  }, 1)

  metaQueue.drain = () => {
    top10 = metas
    isUpdating = false
    lastUpdateTime = new Date()

    if (top10.length < oldImdbIds.length)
      updateMetasTimer = setTimeout(updateMetas, 3600000) // try again in 1 hour
  }

  oldImdbIds.forEach(imdbId => { metaQueue.push(imdbId) })
}

const populate = async () => {
  if (isUpdating) return
  isUpdating = true

  try {
    let feed = await parser.parseURL('https://torrentfreak.com/category/dvdrip/feed/')
    const imdbIds = []

    feed.items.some(item => {
      if (item.title.startsWith('Top 10 Most Pirated Movies of The Week')) {
        if (item['content:encoded']) {
          const $ = cheerio.load(item['content:encoded'])
          $('a').each((ij, el) => {
            const href = $(el).attr('href')
            if (href && href.startsWith('https://www.imdb.com/title/')) {
              const imdbId = href.replace('https://www.imdb.com/title/', '').replace('/','')
              if (imdbId && imdbIds.indexOf(imdbId) === -1)
                imdbIds.push(imdbId)
            }
          })
          return true
        }
      }
    })

    if (!imdbIds.length || JSON.stringify(imdbIds) === JSON.stringify(oldImdbIds)) {
      isUpdating = false
      return
    }

    if (JSON.stringify(oldImdbIds) !== JSON.stringify(imdbIds)) {
      oldImdbIds = imdbIds
      updateMetas()
    }
  } catch (err) {
    console.error('Error populating feed:', err)
    lastError = err
    isUpdating = false
  }
}

// Initial populate
populate()

// Populate every 2 days
setInterval(populate, 172800000)

const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')

const addon = new addonBuilder({
    id: 'org.tftop10',
    version: '0.0.3',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/TorrentFreak_logo.svg/982px-TorrentFreak_logo.svg.png',
    name: 'TorrentFreak Top 10 Movies',
    description: 'Add-on to show a Catalog for TorrenFreak\'s Weekly Top 10 Movies',
    resources: ['catalog'],
    types: ['movie'],
    idPrefixes: ['tt'],
    catalogs: [
        {
            type: 'movie',
            id: 'tktop10movies',
            name: 'Top 10 Most Pirated by TorrentFreak'
        }
    ]
})

addon.defineCatalogHandler(args => {
    return new Promise((resolve, reject) => {
        try {
            resolve({ metas: args.type === 'movie' && args.id === 'tktop10movies' ? top10 : [] })
        } catch (err) {
            reject(err)
        }
    })
})

const app = express()
app.use(limiter)

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        lastUpdate: lastUpdateTime,
        isUpdating,
        error: lastError ? lastError.message : null,
        moviesCount: top10.length
    })
})

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...')
    if (updateMetasTimer) {
        clearTimeout(updateMetasTimer)
    }
    process.exit(0)
})

// cache for 3 days
serveHTTP(addon.getInterface(), { port: process.env.PORT || 7550, cache: 259200 })

publishToCentral("https://top-10-torrentfreak.herokuapp.com/manifest.json")
