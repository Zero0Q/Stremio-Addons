# Installing EpisoNext

## Quick Installation

### One-Click Installation

You can install this addon directly in Stremio by clicking the following link:

```
stremio://addon/com.stremio.episonext/manifest.json
```

Or visit our web installation page:

```
https://episonext.github.io
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
# or
yarn install
```

### Step 3: Configure the Addon

Run the configuration utility:

```bash
npm run configure
```

This will open the configuration window where you can enter your API keys.

### Step 4: Start the Addon

```bash
npm start
```

### Step 5: Add to Stremio

Once the addon is running, you can add it to Stremio by visiting:

```
http://localhost:7000/manifest.json
```

Or by entering this URL in Stremio's addon search.

## Docker Installation

We also provide a Docker image for easy deployment:

```bash
docker pull ghcr.io/yourusername/episonext:latest
docker run -p 7000:7000 -v ./config:/app/config ghcr.io/yourusername/episonext:latest
```

## GitHub Actions Integration

This addon uses GitHub Actions for CI/CD. Each push to the main branch:
1. Runs tests
2. Builds the addon
3. Publishes to GitHub Pages
4. Updates the Docker image

## Troubleshooting

If you encounter issues during installation:

1. Check that you have the correct Node.js version
2. Verify your API keys are valid
3. Ensure ports 7000 and 7001 are available
4. Check the logs with `npm run logs`

## Updating

To update to the latest version:

```bash
git pull
npm install
npm run build
```

Or simply reinstall using the one-click installation link.

## Uninstalling

To uninstall from Stremio, go to the Addons section and remove "EpisoNext".

To completely remove the addon:

```bash
npm run uninstall
``` 