# PirateScroll - TorrentFreak Top 10 Movies Addon

A Stremio addon that provides a catalog of the most pirated movies of the week based on TorrentFreak's weekly reports.

## Features

- Weekly updated catalog of most pirated movies
- Automatic metadata fetching from Cinemeta
- Real-time updates from TorrentFreak RSS feed
- Cached responses for better performance

## Installation

1. Clone this repository
2. Install dependencies:
```bash
npm install
```
3. Start the addon:
```bash
npm start
```

## Configuration

The addon can be configured through environment variables:

- `PORT`: Server port (default: 7550)
- `CACHE_DURATION`: Cache duration in seconds (default: 259200 - 3 days)

## Usage

1. Install the addon in Stremio
2. Access the catalog "Top 10 Most Pirated by TorrentFreak"
3. Browse through the weekly most pirated movies

## Development

To run in development mode:
```bash
npm run dev
```

## Error Handling

The addon includes:
- Network timeout protection
- Error logging
- Automatic retry mechanism
- State management to prevent concurrent updates

## Security

- Rate limiting
- Input validation
- Secure error handling
- No user input processing

## License

MIT

# Installing

Install it from Stremio's add-on catalog, in the community add-ons section.

# Running this Add-on Locally

```
npm i
npm start
```

This will reply with a link, use it in Stremio.

![addlink](https://user-images.githubusercontent.com/1777923/43146711-65a33ccc-8f6a-11e8-978e-4c69640e63e3.png)

