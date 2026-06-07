import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // sirv (Vite's static file server) automatically adds
      // Content-Encoding: gzip when serving .gz files, which causes the
      // browser to silently decompress them before JavaScript sees the bytes.
      // Kuromoji needs the raw gzip bytes so its internal zlibjs can
      // decompress them. This middleware suppresses that header for the
      // /dict/*.gz files in the dev server.
      name: 'serve-dict-raw',
      configureServer(server) {
        server.middlewares.use('/dict', (req, res, next) => {
          // Match .gz even when a ?v= cache-buster query string is appended.
          if (/\.gz(\?|$)/.test(req.url || '')) {
            // Don't cache dict files in dev — avoids the stale-cache trap where
            // a previously cached (auto-decompressed) copy gets re-gunzipped.
            res.setHeader('Cache-Control', 'no-store');
            const _setHeader = res.setHeader.bind(res);
            res.setHeader = function (name, value) {
              // Suppress Content-Encoding: gzip so the browser hands kuromoji
              // the raw gzip bytes its internal zlibjs expects.
              if (name.toLowerCase() === 'content-encoding') return this;
              return _setHeader(name, value);
            };
          }
          next();
        });
      },
    },
  ],
});
