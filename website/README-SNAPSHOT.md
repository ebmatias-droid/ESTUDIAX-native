# ESTUDIAX website source snapshot

This folder contains the public source snapshot for https://estudiax.higgsfield.app, including the app source, UI components, server routes, migrations, configuration, assets, and lockfile.

## Build

Install Bun, then run:

```sh
cd website/app
bun install --frozen-lockfile
bun run typecheck
bun run build
```

Configure deployment secrets only in the hosting provider's secret manager. Never commit API keys, OAuth client secrets, certificates, or `.env` files. The live site uses server-side credentials that are intentionally not included in this source snapshot.
