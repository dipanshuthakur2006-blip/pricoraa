/*
This file sends development and production output to separate Next.js folders.
Separate folders avoid stale build files in the synced project workspace.
*/

/** Keep development files separate from the production build files. */
const nextConfig = {};
if (process.env.NODE_ENV === "development") {
  nextConfig.distDir = ".next-dev";
} else {
  nextConfig.distDir = ".next-prod";
}

module.exports = nextConfig;
