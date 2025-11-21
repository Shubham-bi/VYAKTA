# Project Structure

This document outlines the folder structure for the frontend application.

## Folder Structure

```
src/
  app/
    store.ts          # Redux store configuration
  
  api/
    apiClient.ts      # Axios API client configuration
  
  components/         # Reusable UI components
  
  features/           # Feature-specific modules (containers, components, slices)
  
  hooks/              # Custom React hooks
  
  pages/              # Page-level components/routes
  
  utils/              # Utility functions and helpers
```

## Description

- **app/**: Contains application-wide configuration, such as the Redux store setup
- **api/**: HTTP client configuration and API-related utilities
- **components/**: Shared, reusable UI components that can be used across the application
- **features/**: Feature modules that contain all related code (components, state management, etc.) organized by feature
- **hooks/**: Custom React hooks for shared logic
- **pages/**: Top-level page components that represent different routes
- **utils/**: Helper functions, constants, and utility modules

