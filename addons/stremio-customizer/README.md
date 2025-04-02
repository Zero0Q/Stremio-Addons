# Stremio Customizer

A powerful addon for Stremio that allows comprehensive customization of the Stremio interface and functionality.

## Features

- **UI Customization**: Change colors, layouts, and visual elements
- **Catalog Management**: Hide, reorder, or modify how catalogs appear
- **Content Filtering**: Create custom filters for your content
- **Addon Management**: Control how addons behave and interact
- **User Preferences**: Save and load different customization profiles

## Installation

1. Install the addon by clicking on the following link in Stremio:
   `stremio://addon/https://your-addon-url/manifest.json`

2. Once installed, you can access the customization interface at:
   `https://your-addon-url/`

## Usage

### Authentication

1. Log into Stremio Web (https://web.stremio.com/)
2. Open your browser's developer console (F12 or right-click and select "Inspect")
3. Run this command to get your auth key:
   ```javascript
   JSON.parse(localStorage.getItem("profile")).auth.key
   ```
4. Copy the auth key and paste it into the customizer interface

### Customization Options

#### UI Customization
- Change theme colors
- Modify layout spacing
- Adjust font sizes and styles
- Hide or show UI elements

#### Catalog Management
- Hide specific catalogs
- Reorder how catalogs appear
- Create custom catalog groupings

#### Content Filtering
- Set up custom filters
- Create personalized content views
- Filter by custom tags or attributes

#### Addon Management
- Control which addons are active
- Modify addon behavior
- Create conditional addon activation rules

## Development

To run this addon locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The addon will be available at `http://localhost:7000/`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 