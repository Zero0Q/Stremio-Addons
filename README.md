# EpisoNext

Smart next episode tracking and real-time monitoring for Stremio

![EpisoNext Logo](./assets/logo.png)

## Features

- **Smart Next Episode Recommendations**: Intelligently suggests the next episode to watch based on your viewing history
- **Real-Time Monitoring**: Keeps track of new episodes for series you're watching
- **Rich Metadata**: Enhances your Continue Watching list with additional information
- **Cross-Season Navigation**: Seamlessly transition between seasons
- **Intelligent Caching**: Optimized performance with minimal API calls

## Installation

For detailed installation instructions, please see [INSTALLATION.md](./INSTALLATION.md).

### Quick Install

```
stremio://addon/com.stremio.episonext/manifest.json
```

Or visit our [web installation page](http://localhost:7000) when running the addon locally.

## Configuration

EpisoNext requires a TMDB API key to function properly. When you first launch the application, a configuration window will appear.

### Required API Keys

#### TMDB API Key
1. Visit [TMDB API Documentation](https://www.themoviedb.org/documentation/api)
2. Create a free account
3. Request an API key
4. Enter the API key in the configuration window

### Optional API Keys

#### Real-Debrid API Key (Optional)
- This enhances streaming capabilities but is not required

## Development

### Prerequisites

- Node.js 14 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/episonext.git

# Install dependencies
cd episonext
npm install

# Start development server
npm run dev
```

### Building

```bash
npm run build
```

### Running the Addon

```bash
# Start the addon server
npm start
```

The addon will be available at:
- Local URL: http://localhost:7000/manifest.json
- Installation URL: stremio://addon/com.stremio.episonext/manifest.json

## Troubleshooting

If the addon link is not working:

1. Make sure the server is running
2. Check that the manifest.json file exists at src/main/resources/manifest.json
3. Verify that the addon ID in all files is consistent (com.stremio.episonext)
4. Ensure Stremio is installed and running

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Stremio](https://www.stremio.com/) for their amazing streaming platform
- [TMDB](https://www.themoviedb.org/) for providing metadata

## Configuration Guide

### API Key Requirements

To use EpisoNext, you'll need to obtain API keys for the following services:

#### 1. TMDB (The Movie Database) API Key
- Visit [TMDB API Documentation](https://www.themoviedb.org/documentation/api)
- Create a free account
- Request an API key
- Copy your API key

#### 2. Real-Debrid API Key (Optional)
- Visit [Real-Debrid API Download](https://real-debrid.com/apidownload)
- Log in to your Real-Debrid account
- Generate an API key
- Copy your API key

### Configuration Process

1. **Launch the Addon**
   - When you first launch the addon, a configuration window will automatically open

2. **Enter API Keys**
   - In the configuration window, you'll see sections for:
     - TMDB Configuration
     - Real-Debrid Configuration
     - Notification Settings
     - Privacy Settings
     - Display Preferences

3. **Validate API Keys**
   - Click the "Validate" button next to each API key input
   - The addon will check the validity of your API keys
   - Green validation status means the key is working
   - Red validation status indicates an issue with the key

4. **Optional Settings**
   - Configure notification preferences
   - Choose display theme and language
   - Set privacy settings

5. **Save Configuration**
   - Click "Save Configuration" to store your settings
   - The addon will encrypt sensitive information

### Troubleshooting

- If API key validation fails, double-check the key
- Use the "Help" button to open documentation for each service
- Ensure you have an active internet connection

### Privacy and Security

- API keys are encrypted at rest
- You can disable data sharing in privacy settings
- Notification emails are optional

## Advanced Configuration

### Manual Configuration

If you prefer, you can manually edit the configuration file:
- Location: `episonext/config/app-config.json`
- **Warning**: Manually editing may break encryption

### Resetting Configuration

- In the configuration window, click "Reset to Default"
- This will clear all saved settings

## Supported Services

- TMDB for series metadata
- Real-Debrid for torrent management (optional)
- WebDAV for library sync (optional)

## Minimum Requirements

- Node.js 14+
- Electron
- Active internet connection
- Stremio (latest version)

## Troubleshooting

For additional help:
- Check console logs
- Verify API key permissions
- Ensure all dependencies are installed

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT License 