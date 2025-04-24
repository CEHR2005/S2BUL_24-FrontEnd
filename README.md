# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Docker Setup with PostgreSQL

This project includes Docker and Docker Compose configuration for easy development and deployment with PostgreSQL database integration.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Getting Started with Docker

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. Access the application at http://localhost:5173

3. To stop the containers:
   ```bash
   docker-compose down
   ```

### PostgreSQL Database

The PostgreSQL database is accessible with the following credentials:
- Host: localhost
- Port: 5432
- Database: testdb
- Username: postgres
- Password: postgres

For persistence, database data is stored in a Docker volume named `postgres_data`.

### Environment Variables

The application uses the following environment variables for database connection:
- `VITE_DB_HOST`: PostgreSQL host (default: postgres)
- `VITE_DB_PORT`: PostgreSQL port (default: 5432)
- `VITE_DB_NAME`: PostgreSQL database name (default: testdb)
- `VITE_DB_USER`: PostgreSQL username (default: postgres)
- `VITE_DB_PASSWORD`: PostgreSQL password (default: postgres)

## Vite Configuration

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
