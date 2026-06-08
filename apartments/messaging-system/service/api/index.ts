/**
 * Vercel serverless entrypoint. Vercel auto-detects files in `api/` and compiles
 * TypeScript itself, so no pre-built `dist/` is required. The Express app
 * instance is a valid (req, res) handler; `vercel.json` rewrites all paths here.
 */
import createApp from "../src/index.js";

export default createApp();
