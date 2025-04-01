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

Or visit our [web installation page](https://episonext.github.io).

## Configuration

EpisoNext can be configured through the settings UI or by editing the configuration file directly.

### UI Configuration

1. Launch the EpisoNext configuration UI
2. Adjust settings according to your preferences
3. Save changes

### Manual Configuration

Edit the `config.json` file in the EpisoNext data directory:

```json
{
  "tmdbApiKey": "your_api_key",
  "cacheExpirationTime": 86400,
  "monitoringInterval": 3600,
  "enableNotifications": true
}
```

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