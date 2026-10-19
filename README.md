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

## Installable app

The production site can be installed from a supported browser's install control or browser menu. On iOS, use Safari's **Add to Home Screen** action. Installation and service workers require HTTPS (except on localhost).

The service worker caches the app shell and previously loaded static files so the site can open offline. Product, account, checkout, and other API data still require a network connection.

## Build

```sh
npm run build --prefix client
```

Build output is written to `client/dist/` and is not committed.