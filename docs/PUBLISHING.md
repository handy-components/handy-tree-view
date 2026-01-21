# Publishing HandyTreeView to NPM

This guide explains how to publish the HandyTreeView package to npm as a public package.

## Prerequisites

1. **NPM Account**: Create an account at [npmjs.com](https://www.npmjs.com/)
2. **NPM Login**: Login to npm from your terminal:
   ```bash
   npm login
   ```
3. **Organization Access**: If publishing under `@handy-components`, ensure you have access to the organization:
   ```bash
   npm team ls @handy-components
   ```

## Pre-Publishing Checklist

Before publishing, ensure:

- [ ] Package is built (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Version number is correct in `package.json`
- [ ] README.md is up to date
- [ ] LICENSE file is present
- [ ] `private` field is removed from `package.json`
- [ ] `publishConfig.access` is set to `"public"`
- [ ] `files` array in `package.json` includes all necessary files

## Publishing Steps

### 1. Build the Package

```bash
npm run build
```

This creates the `dist/` directory with compiled JavaScript and TypeScript definitions.

### 2. Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows what files will be included in the package. The `files` array in `package.json` controls this:
- `dist/` - Compiled code
- `README.md` - Documentation
- `LICENSE` - License file

### 3. Test the Package Locally (Optional)

Test the package before publishing:

```bash
npm pack
```

This creates a `.tgz` file. You can install it locally:
```bash
npm install ./handy-components-handy-tree-view-1.0.0.tgz
```

### 4. Publish to NPM

#### First Time Publishing

For the first publish:

```bash
npm publish --access public
```

The `--access public` flag ensures the package is public (even though `publishConfig.access` is set).

#### Subsequent Publishes

For version updates:

```bash
# Update version (patch, minor, or major)
npm version patch  # or minor, or major

# Publish
npm publish
```

### 5. Verify Publication

Check that your package is published:

```bash
npm view @handy-components/handy-tree-view
```

Or visit: https://www.npmjs.com/package/@handy-components/handy-tree-view

## Version Management

### Semantic Versioning

Follow [Semantic Versioning](https://semver.org/):
- **MAJOR** (1.0.0 → 2.0.0): Breaking changes
- **MINOR** (1.0.0 → 1.1.0): New features (backward compatible)
- **PATCH** (1.0.0 → 1.0.1): Bug fixes (backward compatible)

### Update Version

```bash
# Patch version (1.0.0 → 1.0.1)
npm version patch

# Minor version (1.0.0 → 1.1.0)
npm version minor

# Major version (1.0.0 → 2.0.0)
npm version major
```

This automatically:
- Updates `package.json` version
- Creates a git tag
- Commits the change

## Publishing Scoped Packages

Since this package uses a scoped name (`@handy-components/handy-tree-view`), ensure:

1. **Organization exists**: The `@handy-components` organization must exist on npm
2. **Access**: You must be a member of the organization
3. **Public access**: Set `publishConfig.access: "public"` in `package.json`

### Create Organization (if needed)

```bash
npm org create handy-components
```

### Add Members to Organization

```bash
npm team add <username> handy-components developers
```

## Troubleshooting

### Error: "You do not have permission to publish"

- Ensure you're logged in: `npm whoami`
- Check organization membership: `npm team ls @handy-components`
- Verify package name doesn't already exist

### Error: "Package name already exists"

- Check if the package name is taken: `npm view @handy-components/handy-tree-view`
- If taken, you may need to use a different name or contact the owner

### Error: "You cannot publish over the previously published versions"

- Update the version number before publishing
- Use `npm version patch|minor|major` to bump version

### Package Not Appearing on npm

- Wait a few minutes for npm to index
- Check: https://www.npmjs.com/package/@handy-components/handy-tree-view
- Verify the package name matches exactly

## Post-Publishing

After successful publication:

1. **Update Documentation**: Update README if needed
2. **Create Release Notes**: Document changes in GitHub releases
3. **Announce**: Share the package with your community
4. **Monitor**: Watch for issues and feedback

## Continuous Publishing

For automated publishing, consider:

- GitHub Actions workflow
- CI/CD pipeline
- Automated version bumping
- Automated changelog generation

## Example GitHub Actions Workflow

```yaml
name: Publish to NPM

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.NPM_TOKEN}}
```

## Additional Resources

- [NPM Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Scoped Packages](https://docs.npmjs.com/about-scoped-packages)
- [Semantic Versioning](https://semver.org/)
