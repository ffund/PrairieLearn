const config = require('../lib/config');

const SUBDOMAINS = [
  {
    pattern: /variant-\d+/,
    routes: [/^\/pl\/course\/\d+\/question\/\d+\/preview/],
  },
  {
    pattern: /workspace-\d+/,
    routes: [],
  },
];

module.exports = function (req, res, next) {
  const canonicalHost = config.serverCanonicalHost;
  const canonicalHostUrl = new URL(canonicalHost);

  // If the deepest subdomain matches a subdomain where we would actually serve
  // content from, validate that the route is something that we should actually
  // serve from. If it doesn't, redirect to the original URL but on our
  // "canonical" host.
  const requestSubdomain = req.hostname.split('.')[0];
  for (const sub of SUBDOMAINS) {
    if (requestSubdomain.match(sub.pattern)) {
      for (const route of sub.routes) {
        if (req.originalUrl.match(route)) {
          return next();
        }
      }

      // If we fall through to here, we need to redirect to the canonical domain.
      const redirectUrl = new URL(req.originalUrl, canonicalHostUrl);
      redirectUrl.protocol = req.protocol;
      return res.redirect(302, redirectUrl.toString());
    }
  }

  // If we fall through to here, we're safe to continue on.
  next();
};
