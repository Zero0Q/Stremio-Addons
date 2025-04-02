# Stremio Addons Collection

A collection of useful Stremio addons to enhance your streaming experience.

## Addons

### 1. PirateScroll
A Stremio addon that provides a catalog of the most pirated movies of the week based on TorrentFreak's weekly reports.

[View PirateScroll Documentation](./addons/PirateScroll/README.md)

### 2. EpisoNext
Smart next episode tracking and real-time monitoring for Stremio.

[View EpisoNext Documentation](./addons/episonext/README.md)

### 3. Stremio-Customizer
A Stremio addon that allows comprehensive customization of the Stremio interface.

[View Stremio-Customizer Documentation](./addons/stremio-customizer/README.md)

## Installation

Each addon can be installed independently. Please refer to the individual addon documentation for specific installation instructions.

### Quick Install Links
- PirateScroll: `stremio://addon/org.tftop10/manifest.json`
- EpisoNext: `stremio://addon/com.stremio.episonext/manifest.json`
- Stremio-Customizer: `stremio://addon/org.stremio.customizer/manifest.json`

## Development

### Prerequisites
- Node.js >= 14.x
- npm or yarn
- Git

### Setup
```bash
# Clone the repository
git clone https://github.com/Zero0Q/Stremio-Addons.git

# Install dependencies for all addons
cd Stremio-Addons
./update-deps.bat  # Windows
# or
./update-deps.sh   # Linux/Mac
```

### Running the Addons
Each addon can be run independently:

```bash
# For PirateScroll
cd addons/PirateScroll
npm install
npm start

# For EpisoNext
cd addons/episonext
npm install
npm start

# For Stremio-Customizer
cd addons/stremio-customizer
npm install
npm start
```

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](.github/CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing

Each addon includes its own test suite. To run all tests:

```bash
npm run test
```

## CI/CD

We use GitHub Actions for continuous integration and deployment. The pipeline:
- Runs tests for each addon
- Checks code style
- Builds the addons
- Deploys to production on successful merge to master

## Security

Found a security issue? Please report it privately via [GitHub Security Advisories](https://github.com/Zero0Q/Stremio-Addons/security/advisories/new).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
