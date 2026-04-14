/**
 * ESINA Attribution Pixel v1.1
 * ──────────────────────────────────────────────────────────────────────
 * Add to any brand website with one line:
 *   <script src="https://esina.app/esina.js?brand=BRAND_ID"></script>
 *
 * What this does:
 *   1. Injects <link rel="brand-identity"> so AI agents can find the brand.md profile
 *   2. Captures match_token from URL params (set by ESINA when sending a referral)
 *   3. Stores the token in a first-party cookie for the shopping session
 *   4. Detects purchase completions and posts attribution back to ESINA
 *   5. Shows a post-purchase identity fit micro-survey (dismissible, 30-day cooldown)
 * ──────────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  var ESINA_BASE = "https://esina.app";
  var COOKIE_NAME = "esina_token";
  var SURVEY_COOKIE = "esina_survey_done";
  var COOKIE_DAYS = 30;
  var ATTR_ENDPOINT = ESINA_BASE + "/api/attribution/convert";
  var SIGNAL_ENDPOINT = ESINA_BASE + "/api/attribution/signal";

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

    var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ATTR_ENDPOINT, blob);
    } else {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", ATTR_ENDPOINT, false);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
      } catch (e) { /* ignore */ }
    }

    // Show micro-survey after a short delay on purchase
    if ((conversionType || "purchase") === "purchase") {
      setTimeout(showSurvey, 2000);
    }
  }

  // ── 6. Shopify conversion detection ─────────────────────────────────

  function isShopifyThankYouPage(url) {
    return (
      /\/thank_you/.test(url) ||
      /\/orders\/[a-zA-Z0-9]+/.test(url) ||
      /[?&]order_id=/.test(url) ||
      /\/checkouts\/[a-zA-Z0-9]+\/thank_you/.test(url)
    );
  }

  if (isShopifyThankYouPage(window.location.href)) {
    fireConversion("purchase");
  }

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

  window.esinaConvert = function (conversionType) {
    fireConversion(conversionType || "purchase");
  };

  // ── 9. Post-purchase identity fit micro-survey ───────────────────────
  //
  // Slides in from bottom-right 2s after a purchase is detected.
  // Asks "why did this feel right?" — one-tap + optional 1-5 fit score.
  // Stores response to identity_conversion_signals via POST.
  // 30-day cookie prevents re-showing. Opt-out: data-esina-no-survey attr.

  function showSurvey() {
    // Check opt-out flag
    var scripts = document.querySelectorAll("script[src*=\"esina.js\"]");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute("data-esina-no-survey")) return;
    }

    // Check 30-day cooldown cookie
    if (getCookie(SURVEY_COOKIE)) return;

    // Don't double-show
    if (document.getElementById("esina-survey")) return;

    // ── Detect background darkness ──────────────────────────────────────
    // Sample body background to pick card theme
    var bodyBg = window.getComputedStyle(document.body).backgroundColor;
    var isDark = true;
    try {
      var rgb = bodyBg.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        var brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        isDark = brightness < 128;
      }
    } catch (e) { /* default dark */ }

    var BG = isDark ? "rgba(28,28,26,0.97)" : "rgba(248,248,246,0.97)";
    var TEXT_PRIMARY = isDark ? "rgba(255,255,255,0.88)" : "rgba(20,20,18,0.88)";
    var TEXT_SECONDARY = isDark ? "rgba(255,255,255,0.45)" : "rgba(20,20,18,0.45)";
    var BORDER = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
    var PILL_BG = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    var PILL_BG_HOVER = isDark ? "rgba(255,255,255,0.16)" : "rgba(0,0,0,0.12)";
    var PILL_SELECTED_BG = isDark ? "rgba(255,255,255,0.18)" : "rgba(20,20,18,0.18)";
    var PILL_SELECTED_BORDER = isDark ? "rgba(255,255,255,0.45)" : "rgba(20,20,18,0.45)";

    // ── Inject keyframe animation ───────────────────────────────────────
    if (!document.getElementById("esina-survey-styles")) {
      var style = document.createElement("style");
      style.id = "esina-survey-styles";
      style.textContent = [
        "@keyframes esina-slide-up {",
        "  from { transform: translateY(20px); opacity: 0; }",
        "  to   { transform: translateY(0);    opacity: 1; }",
        "}",
        "@keyframes esina-fade-out {",
        "  from { transform: translateY(0);    opacity: 1; }",
        "  to   { transform: translateY(20px); opacity: 0; }",
        "}",
      ].join("\n");
      document.head.appendChild(style);
    }

    // ── Build overlay ───────────────────────────────────────────────────
    var REASONS = [
      { id: "identity", label: "it felt like me" },
      { id: "aesthetic", label: "the aesthetic hit" },
      { id: "values", label: "aligned with my values" },
      { id: "social", label: "a friend or community" },
      { id: "quality", label: "the quality / craft" },
    ];

    var card = document.createElement("div");
    card.id = "esina-survey";
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-label", "Quick question");
    card.style.cssText = [
      "position:fixed",
      "bottom:24px",
      "right:24px",
      "z-index:2147483647",
      "width:300px",
      "padding:20px",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      "font-size:13px",
      "line-height:1.45",
      "background:" + BG,
      "border:1px solid " + BORDER,
      "border-radius:4px",
      "box-shadow:0 8px 32px rgba(0,0,0,0.22)",
      "animation:esina-slide-up 0.35s cubic-bezier(0.16,1,0.3,1) forwards",
      "box-sizing:border-box",
    ].join(";");

    // ── Header row ──────────────────────────────────────────────────────
    var header = document.createElement("div");
    header.style.cssText = "display:flex;align-items:center;justify-content:space-between;margin-bottom:14px";

    var badge = document.createElement("span");
    badge.textContent = "esina";
    badge.style.cssText = [
      "font-size:9px",
      "letter-spacing:0.08em",
      "text-transform:uppercase",
      "color:" + TEXT_SECONDARY,
      "font-weight:500",
    ].join(";");

    var closeBtn = document.createElement("button");
    closeBtn.setAttribute("aria-label", "Dismiss");
    closeBtn.innerHTML = "&#10005;";
    closeBtn.style.cssText = [
      "background:none",
      "border:none",
      "cursor:pointer",
      "color:" + TEXT_SECONDARY,
      "font-size:13px",
      "padding:0",
      "line-height:1",
      "margin-left:auto",
    ].join(";");
    closeBtn.addEventListener("click", dismissSurvey);

    header.appendChild(badge);
    header.appendChild(closeBtn);
    card.appendChild(header);

    // ── Question ────────────────────────────────────────────────────────
    var question = document.createElement("p");
    question.textContent = "why did this feel right?";
    question.style.cssText = [
      "margin:0 0 12px",
      "color:" + TEXT_PRIMARY,
      "font-size:14px",
      "font-weight:500",
    ].join(";");
    card.appendChild(question);

    // ── Reason pills ────────────────────────────────────────────────────
    var pillsWrap = document.createElement("div");
    pillsWrap.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;margin-bottom:14px";

    var selectedReason = null;
    var pillEls = [];

    REASONS.forEach(function (r) {
      var pill = document.createElement("button");
      pill.textContent = r.label;
      pill.style.cssText = [
        "padding:5px 10px",
        "border-radius:2px",
        "border:1px solid " + BORDER,
        "background:" + PILL_BG,
        "color:" + TEXT_SECONDARY,
        "font-size:12px",
        "cursor:pointer",
        "transition:background 0.15s,border-color 0.15s,color 0.15s",
        "font-family:inherit",
        "white-space:nowrap",
      ].join(";");

      pill.addEventListener("mouseenter", function () {
        if (selectedReason !== r.id) {
          pill.style.background = PILL_BG_HOVER;
        }
      });
      pill.addEventListener("mouseleave", function () {
        if (selectedReason !== r.id) {
          pill.style.background = PILL_BG;
        }
      });

      pill.addEventListener("click", function () {
        selectedReason = r.id;
        pillEls.forEach(function (el, idx) {
          var isSelected = REASONS[idx].id === r.id;
          el.style.background = isSelected ? PILL_SELECTED_BG : PILL_BG;
          el.style.borderColor = isSelected ? PILL_SELECTED_BORDER : BORDER;
          el.style.color = isSelected ? TEXT_PRIMARY : TEXT_SECONDARY;
        });
        // Show rating step
        ratingWrap.style.display = "block";
      });

      pillEls.push(pill);
      pillsWrap.appendChild(pill);
    });
    card.appendChild(pillsWrap);

    // ── Rating step (hidden until reason selected) ───────────────────────
    var ratingWrap = document.createElement("div");
    ratingWrap.style.cssText = "display:none";

    var ratingLabel = document.createElement("p");
    ratingLabel.textContent = "how well did it fit?";
    ratingLabel.style.cssText = [
      "margin:0 0 8px",
      "color:" + TEXT_SECONDARY,
      "font-size:12px",
    ].join(";");
    ratingWrap.appendChild(ratingLabel);

    var starsRow = document.createElement("div");
    starsRow.style.cssText = "display:flex;gap:6px;margin-bottom:14px";

    var selectedScore = null;
    var starEls = [];

    for (var s = 1; s <= 5; s++) {
      (function (score) {
        var star = document.createElement("button");
        star.textContent = score.toString();
        star.title = ["", "not really", "a little", "somewhat", "mostly", "perfectly"][score];
        star.style.cssText = [
          "width:36px",
          "height:28px",
          "border-radius:2px",
          "border:1px solid " + BORDER,
          "background:" + PILL_BG,
          "color:" + TEXT_SECONDARY,
          "font-size:12px",
          "font-weight:600",
          "cursor:pointer",
          "transition:background 0.12s,border-color 0.12s,color 0.12s",
          "font-family:inherit",
        ].join(";");

        star.addEventListener("click", function () {
          selectedScore = score;
          starEls.forEach(function (el, idx) {
            var active = idx + 1 <= score;
            el.style.background = active ? PILL_SELECTED_BG : PILL_BG;
            el.style.borderColor = active ? PILL_SELECTED_BORDER : BORDER;
            el.style.color = active ? TEXT_PRIMARY : TEXT_SECONDARY;
          });
          submitSurvey();
        });

        starEls.push(star);
        starsRow.appendChild(star);
      })(s);
    }
    ratingWrap.appendChild(starsRow);
    card.appendChild(ratingWrap);

    // ── Submit ───────────────────────────────────────────────────────────
    function submitSurvey() {
      if (!selectedReason) return;

      var payload = {
        brand_id: brandId,
        match_token: matchToken || null,
        customer_perception_response: selectedReason,
        identity_fit_score: selectedScore || null,
      };

      try {
        var blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        if (navigator.sendBeacon) {
          navigator.sendBeacon(SIGNAL_ENDPOINT, blob);
        } else {
          var xhr = new XMLHttpRequest();
          xhr.open("POST", SIGNAL_ENDPOINT, true);
          xhr.setRequestHeader("Content-Type", "application/json");
          xhr.send(JSON.stringify(payload));
        }
      } catch (e) { /* ignore */ }

      // Show thank you state
      card.innerHTML = "";
      card.style.padding = "20px";

      var thanks = document.createElement("div");
      thanks.style.cssText = "text-align:center;padding:8px 0";

      var thanksText = document.createElement("p");
      thanksText.textContent = "thanks — this helps us understand you better.";
      thanksText.style.cssText = [
        "margin:0",
        "color:" + TEXT_SECONDARY,
        "font-size:12px",
        "line-height:1.5",
      ].join(";");

      thanks.appendChild(thanksText);
      card.appendChild(thanks);

      setCookie(SURVEY_COOKIE, "1", COOKIE_DAYS);

      setTimeout(function () {
        card.style.animation = "esina-fade-out 0.3s ease forwards";
        setTimeout(function () {
          if (card.parentNode) card.parentNode.removeChild(card);
        }, 350);
      }, 2200);
    }

    // ── Dismiss ──────────────────────────────────────────────────────────
    function dismissSurvey() {
      setCookie(SURVEY_COOKIE, "dismissed", COOKIE_DAYS);
      card.style.animation = "esina-fade-out 0.25s ease forwards";
      setTimeout(function () {
        if (card.parentNode) card.parentNode.removeChild(card);
      }, 280);
    }

    // ── Append to body ───────────────────────────────────────────────────
    document.body.appendChild(card);
  }

})();
