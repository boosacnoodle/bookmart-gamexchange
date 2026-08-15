// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Allow access via Tailscale hostname in dev (Vite blocks non-allowlisted hosts).
  vite: {
    server: {
      allowedHosts: [
        "thomass-mac-mini.tailef4e4a.ts.net",
        ".ts.net",
        ".trycloudflare.com",
        ".pinggy.net",
        ".pinggy-free.link",
      ],
    },
  },
  nitro: {
    cloudflare: {
      // nodejs_compat is now provided by the preview runtime by default.
      // Re-declaring it causes the worker loader to reject the build.
      nodeCompat: false,
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
