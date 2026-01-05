# Contributing to Kaaro Catalogue

Thank you for your interest in contributing to Kaaro Catalogue! This document provides guidelines for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Contribution Guidelines](#contribution-guidelines)
- [Data Contribution Guidelines](#data-contribution-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, identity, or experience level.

### Our Standards

- Be respectful and considerate in all communications
- Welcome diverse perspectives and experiences
- Accept constructive criticism gracefully
- Focus on what is best for the community and the project
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

When creating a bug report, include:
- Clear and descriptive title
- Steps to reproduce the issue
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, browser)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:
- Use a clear and descriptive title
- Provide a detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any related issues or PRs

### Code Contributions

We welcome code contributions! Areas where you can help:
- Bug fixes
- Feature implementations
- Documentation improvements
- Test coverage
- Performance optimizations
- UI/UX enhancements

### Content Contributions

#### Important: Content Attribution

When contributing catalog data, you MUST:
- Provide proper attribution to original authors/creators
- Include source references and links
- Verify the accuracy of metadata
- Respect copyright and intellectual property rights
- Only include publicly available content

**We do not accept:**
- Copyrighted content without proper attribution
- Content that violates intellectual property rights
- Plagiarized or misattributed works
- Content without verifiable sources

## Development Setup

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Git

### Setup Steps

1. **Fork the repository**
   ```bash
   # Fork on GitHub, then clone your fork
   git clone https://github.com/yourusername/kaaroCatalogue.git
   cd kaaroCatalogue
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Make your changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update documentation as needed

6. **Test your changes**
   ```bash
   # Run validation tools
   node src/mcp-tools/validate-schema.js
   
   # Test the web interface manually
   npm run dev
   ```

## Contribution Guidelines

### Code Style

- Use modern ES6+ JavaScript syntax
- Follow consistent indentation (4 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for functions and classes
- Keep functions focused and single-purpose

### Commit Messages

Follow conventional commit format:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(poetry): add support for Punjabi poetry rendering

fix(ui): resolve bookmark button state inconsistency

docs(readme): update installation instructions
```

### Documentation

- Update README.md for new features
- Add JSDoc comments for new functions
- Update relevant documentation in `/research` if applicable
- Include inline comments for complex logic

## Data Contribution Guidelines

### Adding Poets to the Catalog

1. **Research thoroughly**
   - Verify biographical information
   - Cross-reference multiple sources
   - Document sources in the research files

2. **Follow the schema**
   - Use the catalog JSON schema
   - Include all required fields
   - Validate before submitting

3. **Provide attribution**
   ```json
   {
     "poet": {
       "name": "Poet Name",
       "sources": [
         {
           "type": "Wikipedia",
           "url": "https://en.wikipedia.org/..."
         }
       ],
       "works": [
         {
           "title": "Work Title",
           "originalAuthor": "Poet Name",
           "source": "Original Publication/Source"
         }
       ]
     }
   }
   ```

### Adding Comedy Content

1. **YouTube Integration**
   - Only use publicly available YouTube videos
   - Respect YouTube's Terms of Service
   - Include proper attribution to performers
   - Add metadata (duration, description, themes)

2. **Comedian Profiles**
   - Verify biographical information
   - Include career highlights
   - Reference reliable sources
   - Add social media links only if publicly available

### Data Quality Standards

- **Accuracy**: All information must be verifiable
- **Completeness**: Include all required schema fields
- **Consistency**: Follow existing naming conventions
- **Attribution**: Always credit original creators
- **Sources**: Document all data sources

## Pull Request Process

### Before Submitting

1. **Test thoroughly**
   - Run validation scripts
   - Test in the web interface
   - Check for console errors
   - Verify responsiveness (if UI changes)

2. **Update documentation**
   - Update README if needed
   - Add/update comments
   - Update CHANGELOG.md (if exists)

3. **Clean up**
   - Remove debug code
   - Remove commented-out code
   - Ensure no merge conflicts

### Submitting Your PR

1. **Create the pull request**
   - Use a clear, descriptive title
   - Reference related issues
   - Provide detailed description of changes

2. **PR Description Template**
   ```markdown
   ## Description
   Brief summary of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Data contribution
   
   ## Related Issues
   Closes #issue_number
   
   ## Testing
   Describe how you tested the changes
   
   ## Screenshots (if applicable)
   Add screenshots for UI changes
   
   ## Checklist
   - [ ] Code follows project style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No new warnings or errors
   - [ ] Proper attribution for content
   ```

3. **Respond to feedback**
   - Address review comments promptly
   - Make requested changes
   - Ask for clarification if needed

### Review Process

- Maintainers will review PRs within 1-2 weeks
- Reviews focus on code quality, functionality, and alignment with project goals
- Content contributions will be verified for accuracy and attribution
- Changes may be requested before merging

## Development Workflows

### Adding a New Catalog Type

1. Create schema in `src/data/schema/`
2. Create data file in `src/data/catalogs/`
3. Create MCP tools in `src/mcp-tools/`
4. Create renderer in `src/web/renderers/`
5. Update main app to integrate new catalog
6. Add documentation

### Adding a New Data Source

1. Create adapter in `src/mcp-tools/sources/`
2. Implement standard interface
3. Add authentication/API key handling (if needed)
4. Create enrichment scripts
5. Add validation
6. Document usage

## Questions?

- Open an issue for questions
- Check existing documentation
- Review closed issues and PRs for similar topics

## License

By contributing, you agree that your contributions will be licensed under the MIT License, with the understanding that:
- Code contributions are licensed under MIT
- Data contributions respect original creator copyrights
- All creative works retain their original authorship

---

Thank you for contributing to Kaaro Catalogue! Your efforts help preserve and share cultural heritage.
