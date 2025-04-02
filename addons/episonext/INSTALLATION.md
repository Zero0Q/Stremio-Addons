# Installing EpisoNext

## Quick Installation

### One-Click Installation

You can install this addon directly in Stremio by clicking the following link:

```
stremio://addon/com.stremio.episonext/manifest.json
```

Or visit the web installation page when running the addon locally:

```
http://localhost:7000
```

## Manual Installation from GitHub

### Prerequisites
- Node.js 14 or higher
- npm or yarn
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/episonext.git
cd episonext
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start the Addon

```bash
npm start
```

The first time you run the addon, a configuration window will appear where you can enter your TMDB API key.

### Step 4: Add to Stremio

Once the addon is running, you can add it to Stremio by clicking:

```
stremio://addon/com.stremio.episonext/manifest.json
```

Or by entering this URL in Stremio's addon search:

```
http://localhost:7000/manifest.json
```

## Development Mode

To run the addon in development mode:

```bash
npm run dev
```

This will start the addon with hot reloading enabled.

## Building for Production

To build the addon for production:

```bash
npm run build
```

## Troubleshooting

If you encounter issues during installation:

1. Check that you have the correct Node.js version (14+)
2. Verify your TMDB API key is valid
3. Ensure port 7000 is available
4. Make sure Stremio is installed and running
5. Check that the manifest.json file exists at src/main/resources/manifest.json

## Updating

To update to the latest version:

```bash
git pull
npm install
npm start
```

## Uninstalling

To uninstall from Stremio, go to the Addons section and remove "EpisoNext". 