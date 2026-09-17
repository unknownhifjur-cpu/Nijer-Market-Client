# NIJER MARKET — Customer Client

React + Vite storefront for product browsing, search, cart, wishlist, authentication, checkout, and order tracking.

See the [root README](../README.md) for complete setup, environment variables, payment behavior, and security notes.

## Local development

From the repository root:

```sh
npm install --prefix client
npm run dev --prefix client
```

The development server uses `http://localhost:5173`.

Optional: copy `client/.env.example` to `client/.env` and set `VITE_API_URL` to the API base URL, including `/api`. Only public configuration belongs in Vite environment variables.

## Build

```sh
npm run build --prefix client
```

Build output is written to `client/dist/` and is not committed.