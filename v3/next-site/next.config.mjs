export default {
  trailingSlash: true,
  poweredByHeader: false,
  outputFileTracingRoot: import.meta.dirname,
  distDir: process.env.NODE_ENV==='development'?'.next-dev':'.next',
};
