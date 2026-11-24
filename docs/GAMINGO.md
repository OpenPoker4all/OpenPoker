# Gamingo sandbox catalog

This integration lists assigned sandbox games for one active organizer. Set
GAMINGO_CATALOG_ORGANIZER_ID, GAMINGO_OPERATOR_ID, GAMINGO_KEY_ID and
GAMINGO_KEY_SECRET only in the server environment. Aggregator keys also require
GAMINGO_AGGREGATOR_ID. Never put credentials in the client build.

The catalog requires an authenticated session and a current organizer membership.
Only the matching user can trigger a signed GET to the supplier. The response must
identify a sandbox test operator. The browser receives IDs, titles and availability.
No launch is enabled by default. Wallet operations, checkout and balance transfers are unavailable.

For a read-only CLI check, also set GAMINGO_JURISDICTION and run
`node tools/gamingo-sandbox.mjs` from app/.

## Optional free Play Money demos

By default only the organizer catalog is available. To offer free demos on a
host approved for sandbox play, configure GAMINGO_FUN_JURISDICTION to an assigned
sandbox jurisdiction. The assigned active organizer can then choose **Add to Play
Money for everyone** in Marketplace → Gamingo Casino Manager. Every signed-in
player can open Casino and choose a game without buying a plugin or joining a
paid club. Removing the plugin or losing membership blocks new sessions.

Each launch checks the assigned sandbox games and maintenance flags, signs a
fun-mode request in provider-held G, and accepts only a fun/G launch on the
Gamingo games origin. Demo credits never enter DanGG balances. No launch token
is persisted by the integration. There are no real-money launches or wallet
callbacks.

A platform operator can also publish free demos independently of the organizer.
Set GAMINGO_PLATFORM_DEMO_OWNER to the exact assigned organizer ID to opt in at
deployment, or choose the Gamingo checkbox under Admin → Game settings and save.
An explicit admin setting overrides the deployment default. Either publication
requires the assigned organizer's active membership and sandbox jurisdiction.
This does not grant administrator rights or record consent on the organizer's behalf.

The public demo lobby displays supplier-hosted game covers from the catalog on
the Gamingo image origin. The Emerald Orbit lobby banner is original artwork
generated for DanGG with ChatGPT Images. The launch dialog fills the viewport;
browsers that support native fullscreen are asked to enter it on the player's tap.
