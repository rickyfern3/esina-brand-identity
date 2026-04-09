/**
 * ESINA Attribution Pixel v1.0
 * ──────────────────────────────────────────────────────────────────────
 * Add to any brand website with one line:
 *   <script src="https://esina-brand-identity.vercel.app/esina.js?brand=BRAND_ID"></script>
 *
 * What this does:
 *   1. Injects <link rel="brand-identity"> so AI agents can find the brand.md profile
 *   2. Captures match_token from URL params (set by ESINA when sending a referral)
 *   3. Stores the token in a first-party cookie for the shopping session
 *   4. Detects purchase completions and posts attribution back to ESINA
 * ──────────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  var ESINA_BASE = "https://esina-brand-identity.vercel.app";
  var COOKIE_NAME = "esina_token";
  var COOKIE_DAYS = 30;
  var ATTR_ENDPOINT = ESINA_BASE + "/api/attribution/convert";

  // ── 1. Extract brand ID from this script's src URL ──────────────────

  var brandId = null;
  (function () {
    var scripts = document.querySelectorAll("script[src*=\"esina.js\"]");
    for (var i = 0; i < scripts.length; i++) {
      try {
        var u = new URL(scripts[i].src);
        var b = u.searchParams.get("brand");
        if (b) { brandId = b; break; }
      } catch (e) { /* ignore parse errors */ }
    }
  })();

  if (!brandId) {
    console.warn("[ESINA] No brand= param found in esina.js URL. Attribution disabled.");
    return;
  }

  // ── 2. Inject <link rel="brand-identity"> for AI agent discovery ─────

  (function injectDiscoveryLink() {
    var profileUrl = ESINA_BASE + "/api/brand/" + brandId;
    var existing = document.querySelector("link[rel=\"brand-identity\"]");
    if (existing) return;

    var link = document.createElement("link");
    link.rel = "brand-identity";
    link.type = "text/markdown";
    link.href = profileUrl;
    link.setAttribute("data-esina-brand", brandId);
    document.head.appendChild(link);
  })();

  // ── 3. Cookie helpers ────────────────────────────────────────────────

  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var d = new Date();
      d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + d.toUTCString();
    }
    // SameSite=Lax is safe for first-party attribution cookies
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
  }

  function getCookie(name) {
    var key = name + "=";
    var parts = document.cookie.split(";");
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      if (part.indexOf(key) === 0) {
        return decodeURIComponent(part.substring(key.length));
      }
    }
    return null;
  }

  // ── 4. Capture match_token from URL and store in cookie ──────────────

  var matchToken = null;

  (function captureToken() {
    try {
      var params = new URLSearchParams(window.location.search);
      var tokenFromUrl = params.get("esina_token") || params.get("match_token");
      if (tokenFromUrl) {
        matchToken = tokenFromUrl;
        setCookie(COOKIE_NAME, tokenFromUrl, COOKIE_DAYS);
        return;
      }
    } catch (e) { /* ignore */ }

    // Fall back to cookie (persists through session)
    var tokenFromCookie = getCookie(COOKIE_NAME);
    if (tokenFromCookie) {
      matchToken = tokenFromCookie;
    }
  })();

  // ── 5. Attribution fire ──────────────────────────────────────────────

  var hasFired = false;

  function fireConversion(conversionType) {
    if (hasFired) return;
    hasFired = true;

    var payload = {
      brand_id: brandId,
      conversion_type: conversionType || "purchase",
    };
    if (matchToken) {
      payload.match_token = matchToken;
    }

    // Use sendBeacon for reliability (fires even on page unload)
    var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ATTR_ENDPOINT, blob);
    } else {
      // Fallback: sync XHR (less reliable but compatible)
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", ATTR_ENDPOINT, false); // synchronous
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
      } catch (e) { /* ignore network errors */ }
    }
  }

  // ── 6. Shopify conversion detection ─────────────────────────────────
  //
  // Shopify's thank_you page URL patterns:
  //   /thank_you
  //   /orders/{order_id}
  //   /checkouts/{token}/thank_you
  //   /?order_id=...

  function isShopifyThankYouPage(url) {
    return (
      /\/thank_you/.test(url) ||
      /\/orders\/[a-zA-Z0-9]+/.test(url) ||
      /[?&]order_id=/.test(url) ||
      /\/checkouts\/[a-zA-Z0-9]+\/thank_you/.test(url)
    );
  }

  // Check immediately on load
  if (isShopifyThankYouPage(window.location.href)) {
    fireConversion("purchase");
  }

  // Also watch for Shopify SPA navigations (History API)
  (function watchHistoryChanges() {
    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;

    history.pushState = function () {
      originalPushState.apply(history, arguments);
      if (isShopifyThankYouPage(window.location.href)) {
        fireConversion("purchase");
      }
    };

    history.replaceState = function () {
      originalReplaceState.apply(history, arguments);
      if (isShopifyThankYouPage(window.location.href)) {
        fireConversion("purchase");
      }
    };

    window.addEventListener("popstate", function () {
      if (isShopifyThankYouPage(window.location.href)) {
        fireConversion("purchase");
      }
    });
  })();

  // ── 7. Custom event listener ─────────────────────────────────────────
  //
  // Brands can fire this event manually for non-Shopify conversions:
  //   document.dispatchEvent(new CustomEvent("esina-convert", {
  //     detail: { conversion_type: "signup" }
  //   }));

  document.addEventListener("esina-convert", function (e) {
    var conversionType = (e && e.detail && e.detail.conversion_type) || "purchase";
    fireConversion(conversionType);
  });

  // ── 8. Etsy / non-Shopify common patterns ───────────────────────────

  function isGenericThankYouPage(url) {
    return (
      /\/order[_-]?confirmation/.test(url) ||
      /\/order[_-]?complete/.test(url) ||
      /\/purchase[_-]?complete/.test(url) ||
      /\/checkout[_-]?complete/.test(url) ||
      /\/receipt/.test(url) ||
      /[?&]order_complete=1/.test(url)
    );
  }

  if (isGenericThankYouPage(window.location.href)) {
    fireConversion("purchase");
  }

  // Expose a manual trigger for developers
  window.esinaConvert = function (conversionType) {
    fireConversion(conversionType || "purchase");
  };

})();
