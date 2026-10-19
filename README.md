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

The checkout's searchable village and Post Office suggestions are intentionally empty until the verified location names are available. Configure `VITE_DELIVERY_VILLAGES` and `VITE_DELIVERY_POST_OFFICES` as pipe-separated values (for example, `Name One|Name Two`); customers can still enter unlisted locations manually. Restart Vite after changing these values.

The checkout map uses the browser's Geolocation API only after a customer selects **Use My Current Location**. A point is saved to the address only after the customer confirms it. To show the map before GPS is requested, configure `VITE_DELIVERY_MAP_CENTER` as `latitude,longitude` using a verified center for the actual delivery area; leave it blank rather than guessing. Set this public Vite variable in the Vercel project and redeploy the client when using a configured center. GPS and map selection still work without it.

Map tiles come from the public OpenStreetMap standard tile service with visible attribution. That community service is not an unlimited or guaranteed-availability map API; its tile usage policy applies. If tiles are unavailable, customers can still enter the written address and place an order without coordinates. Reverse geocoding is intentionally not used, so precise coordinates are not sent to a third-party address lookup provider and no unverified place names are inserted into the address form.

## Installable app

The production site can be installed from a supported browser's install control or browser menu. On iOS, use Safari's **Add to Home Screen** action. Installation and service workers require HTTPS (except on localhost).

The service worker caches the app shell and previously loaded static files so the site can open offline. Product, account, checkout, and other API data still require a network connection.

## Build

```sh
npm run build --prefix client
```

Build output is written to `client/dist/` and is not committed.