# Kaaro Catalogue

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Kaaro Catalogue** is an ecosystem of tools designed to build, maintain, analyze, and visualize rich cultural catalogs. The project currently focuses on two primary catalogs: **Indian Poetry** and **Indian Comedy**, creating a comprehensive digital archive of South Asian cultural heritage.

## 🎯 Project Vision

This project provides:
- **Research Tools**: MCP (Model Context Protocol) tools for discovering and extracting content from the web
- **Catalog Management**: Schema-based data organization using Schema.org standards
- **Visualization Interface**: A beautiful web application to explore and discover catalog content
- **Analysis & Insights**: Tools to understand patterns and discover connections within the catalog

## ✨ Features

### 📚 Cultural Catalogs
- **Indian Poetry Catalog**: Comprehensive collection of poets, their works, and metadata
  - Multi-lingual support (Hindi, Urdu, Sanskrit, Bengali, Tamil, and more)
  - Rich metadata including literary eras, movements, and awards
  - Integration with Rekhta and other poetry sources
- **Comedy Catalog**: Curated collection of Indian comedians and their performances
  - YouTube integration for video content
  - Comedian profiles with biographical information
  - Work metadata including duration, description, and embeddings

### 🛠️ MCP Tools
Atomic, reusable tools exposed via Model Context Protocol:
- **Data Sources**: Wikipedia, Rekhta, YouTube API integrations
- **Enrichment Scripts**: Automated catalog enhancement workflows
- **Validation Tools**: Schema validation and data quality checks
- **Import/Export**: Data migration and format conversion utilities

### 🎨 Web Visualization
A Bloomberg Terminal-inspired interface featuring:
- Explore mode for browsing the entire catalog
- Insights dashboard for data analysis
- Custom renderers for poetry and comedy content
- Bookmarking and favorites functionality
- Responsive design with premium aesthetics

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/kaaroCatalogue.git
cd kaaroCatalogue

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will open automatically at `http://localhost:3000`.

### Building for Production

```bash
npm run build
npm run preview
```

## 📂 Project Structure

```
kaaroCatalogue/
├── src/
│   ├── data/
│   │   ├── catalogs/          # Catalog data files
│   │   │   ├── comedy-index.json
│   │   │   └── poets-index.json
│   │   └── schema/            # JSON Schema definitions
│   ├── mcp-tools/             # MCP tools and scripts
│   │   ├── sources/           # Data source adapters
│   │   ├── index.js           # Main MCP server
│   │   ├── rekhta-adapter.js  # Rekhta integration
│   │   ├── youtube-adapter.js # YouTube API integration
│   │   └── enrich-*.js        # Enrichment workflows
│   └── web/                   # Web application
│       ├── app.js             # Main application logic
│       ├── renderers/         # Content renderers
│       ├── utils/             # Utility functions
│       └── index.html         # Entry point
├── research/                  # Research documents
│   ├── indianPoetIndex.md     # Poetry research
│   └── comedianTargets.md     # Comedy catalog targets
├── package.json
├── vite.config.js
└── README.md
```

## 🎭 Catalogs

### Poetry Catalog
The poetry catalog includes:
- **Classical Era**: Kalidasa, Bharavi, Magha, and the Sanskrit masters
- **Bhakti Movement**: Kabir, Tulsidas, Meera, Surdas
- **Modern Era**: Tagore, Faiz Ahmed Faiz, and contemporary poets
- **Regional Literature**: Coverage across 15+ Indian languages

### Comedy Catalog
The comedy catalog features:
- Stand-up comedians and their performances
- YouTube video integration
- Biographical information and career highlights
- Genre tags and themes

## 🔧 Development

### Running MCP Tools

```bash
# List available poets
node src/mcp-tools/list-poets.js

# Enrich poetry catalog
node src/mcp-tools/enrich-catalogue.js

# Enrich comedy catalog
node src/mcp-tools/enrich-comedy-catalogue.js

# Validate data schemas
node src/mcp-tools/validate-schema.js
```

### Data Schema
The project uses JSON Schema for data validation. Schemas are defined in `src/data/schema/` and follow Schema.org vocabulary where applicable.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on:
- Code of conduct
- Development workflow
- Submitting pull requests
- Data contribution guidelines

### Important: Content Attribution
This project serves as a **curated catalogue**. All creative works (poems, comedy performances, etc.) retain their original authorship and copyright. The catalog provides:
- Metadata and organizational structure (MIT License)
- Links and references to original sources
- Proper attribution to all original creators

See [LICENSE](LICENSE) for full details.

## 📜 License

**Code & Catalog Structure**: MIT License  
**Content**: All poems, performances, and creative works belong to their respective original authors/creators.

This project is a **non-commercial educational archive** that curates and organizes publicly available cultural content. We do not claim ownership of any creative works. All content is properly attributed to original creators.

For full license details, see the [LICENSE](LICENSE) file.

## 🙏 Acknowledgments

- **Original Authors**: All poets, comedians, and artists whose works are cataloged here
- **Data Sources**: Rekhta, Wikipedia, YouTube, and various literary archives
- **Schema.org**: For providing standardized vocabulary for cultural metadata
- **Community Contributors**: Everyone who has contributed to enriching these catalogs

## 📖 Research & Documentation

Comprehensive research documents are available in the `research/` directory:
- [Indian Poet Index](research/indianPoetIndex.md): Exhaustive catalog and critical analysis
- [Comedian Targets](research/comedianTargets.md): Comedy catalog enrichment guide

## 🗺️ Roadmap

- [ ] Expand multi-language support in the UI
- [ ] Add music catalog (Classical Indian music)
- [ ] Implement advanced search and filtering
- [ ] Create API endpoints for catalog access
- [ ] Add user-contributed content moderation
- [ ] Mobile application
- [ ] Audio support for poetry recitations

## 📧 Contact

For questions, suggestions, or collaboration opportunities, please open an issue on GitHub.

---

**Note**: This is a cultural preservation project. If you are a rights holder and have concerns about any content in this catalog, please contact us and we will address your concerns promptly.
