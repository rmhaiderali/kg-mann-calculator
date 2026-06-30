import { NavigationRoute, registerRoute } from "workbox-routing"
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching"

precacheAndRoute(self.__WB_MANIFEST)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL("classic/index.html"), {
    allowlist: [/^\/kg-mann-calculator\/classic\//],
  }),
)

registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), {
    denylist: [/^\/kg-mann-calculator\/classic$/],
  }),
)
