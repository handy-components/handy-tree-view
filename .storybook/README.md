# Storybook Setup

This directory contains Storybook configuration for HandyTreeView.

## Installation

After adding Storybook dependencies to package.json, install them:

```bash
npm install
```

## Running Storybook

Start the Storybook development server:

```bash
npm run storybook
```

This will start Storybook on http://localhost:6006

## Building Storybook

Build a static version of Storybook:

```bash
npm run build-storybook
```

The output will be in the `storybook-static/` directory.

## Stories

Stories are located in the `__stories__/` directory:
- `HandyTreeView.stories.tsx` - Comprehensive stories showcasing all HandyTreeView features

## Features Demonstrated

The stories include examples of:
- Basic tree view
- Controlled expansion
- Multi-selection with checkboxes
- API ref usage
- Disabled items
- Custom labels
- Keyboard navigation
- Large tree performance
- Double-click handling
- Context menu
- Custom icons
- Loading states
- Selection propagation
