# Hackter Client Development Guidelines

This document provides specific information for developers working on the Hackter Client project.

## Build/Configuration Instructions

### Project Overview
- Vue 3 application built with Vite
- Uses Vue Router for navigation
- Integrates with Colyseus.js for multiplayer functionality
- Uses PixiJS for 2D rendering

### Development Environment Setup

1. **Prerequisites**:
   - Node.js (latest LTS version recommended)
   - npm (comes with Node.js)

2. **Installation**:
   ```sh
   npm install
   ```

3. **Development Server**:
   ```sh
   npm run dev
   ```
   This starts a local development server with hot module replacement.

4. **Production Build**:
   ```sh
   npm run build
   ```
   The built files will be in the `dist` directory.

5. **Preview Production Build**:
   ```sh
   npm run preview
   ```

### Configuration

- **Vite Configuration**: The project uses standard Vite configuration in `vite.config.js`
- **Path Aliases**: `@` is aliased to the `src` directory for easier imports
- **Environment Variables**: Create `.env` files for environment-specific configurations (following Vite conventions)

## Testing Information

### Current Testing Status

The project currently does not have a testing framework set up. Here are recommendations for implementing testing:

### Recommended Testing Setup

1. **Install Testing Dependencies**:
   ```sh
   npm install --save-dev vitest @vue/test-utils jsdom @testing-library/vue
   ```

2. **Configure Vitest**:
   Add to `vite.config.js`:
   ```js
   import { defineConfig } from 'vite'
   // ... other imports

   export default defineConfig({
     // ... existing config
     test: {
       environment: 'jsdom',
       globals: true,
     },
   })
   ```

3. **Add Test Script to package.json**:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "lint": "eslint . --fix",
       "format": "prettier --write src/",
       "test": "vitest run",
       "test:watch": "vitest"
     }
   }
   ```

4. **Create Test Files**:
   - Create a `tests` directory in the project root
   - Name test files with `.spec.js` or `.test.js` suffix
   - Place component tests alongside components or in a parallel directory structure

### Example Test

For a component like `Game.vue`, create a test file `Game.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Game from '@/views/Game.vue'

describe('Game Component', () => {
  it('renders properly', () => {
    const wrapper = mount(Game)
    expect(wrapper.exists()).toBe(true)
  })

  // Add more specific tests based on component functionality
})
```

## Additional Development Information

### Code Style and Linting

- The project uses ESLint for linting with Vue.js specific rules
- Prettier is configured for code formatting
- Run linting with `npm run lint`
- Run formatting with `npm run format`
- No comments are allowed in the codebase

### Project Structure

- `src/components/`: Reusable Vue components
- `src/views/`: Page-level Vue components
- `src/router/`: Vue Router configuration
- `src/assets/`: Static assets like CSS, images, etc.

### Working with Colyseus.js

- Colyseus.js is used for real-time multiplayer functionality
- When implementing multiplayer features, follow the client-server architecture pattern
- Ensure proper error handling for connection issues

### Working with PixiJS

- PixiJS v8 is used for 2D rendering
- When creating game graphics, use PixiJS's container-based approach for better performance
- Consider using PixiJS's asset loader for managing game assets

### Performance Considerations

- Use Vue's `defineAsyncComponent` for code-splitting larger components
- Optimize PixiJS rendering by using object pooling for frequently created/destroyed objects
- Use Vue's `v-once` directive for static content that doesn't need to be re-rendered

### Debugging

- Use Vue DevTools (enabled in the Vite configuration) for debugging Vue components
- Use browser developer tools for debugging PixiJS rendering issues
- For network-related issues with Colyseus, enable verbose logging in the Colyseus client
