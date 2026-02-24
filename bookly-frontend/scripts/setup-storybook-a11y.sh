#!/bin/bash
# Setup script for Storybook + a11y tooling
# Run from bookly-backend-frontend directory:
#   bash scripts/setup-storybook-a11y.sh

set -e

echo "📦 Installing Storybook dependencies..."
npm install -D \
  @storybook/nextjs \
  @storybook/react \
  @storybook/addon-essentials \
  @storybook/addon-a11y \
  @storybook/addon-interactions \
  storybook

echo "♿ Installing axe-core for Playwright a11y tests..."
npm install -D @axe-core/playwright

echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  npx storybook dev -p 6006    # Start Storybook"
echo "  npx storybook build          # Build static Storybook"
echo "  npx playwright test          # Run E2E + a11y tests"
