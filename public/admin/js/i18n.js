/* ═══════════════════════════════════════════════════════════════════════════
   i18n.js — Internationalization engine for the admin dashboard
   - Stores language in localStorage (instant)
   - Syncs to MySQL via /api/admin/language (persistent)
   - Translates all [data-i18n] elements in the DOM
   - Provides t() helper for JS string translation
   - Handles RTL / LTR switching
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  var LANG_KEY = 'admin_lang';
  var currentLang = localStorage.getItem(LANG_KEY) || 'fr';

  /* ── helpers ──────────────────────────────────────────────────────────── */

  function isValidLang(l) { return l === 'fr' || l === 'ar'; }

  function getTranslations(lang) {
    return (TRANSLATIONS && TRANSLATIONS[lang]) || TRANSLATIONS.fr;
  }

  /* ── public API ───────────────────────────────────────────────────────── */

  window.I18n = {

    /** Return current language code */
    getLang: function () { return currentLang; },

    /** Is the current direction RTL? */
    isRTL: function () { return currentLang === 'ar'; },

    /** Translate a single key → string */
    t: function (key) {
      var dict = getTranslations(currentLang);
      return dict[key] !== undefined ? dict[key] : key;
    },

    /** Set language, update DOM, persist */
    setLang: function (lang, skipSync) {
      if (!isValidLang(lang)) return;
      currentLang = lang;
      localStorage.setItem(LANG_KEY, lang);
      applyDir(lang);
      translatePage();
      syncToServer(lang, skipSync);
    },

    /** Format a date using the current locale */
    formatDate: function (d) {
      if (!d) return '-';
      var dt = new Date(d);
      return dt.toLocaleDateString(I18n.t('date_locale'), { day: '2-digit', month: 'short', year: 'numeric' });
    },

    /** Public alias so admin.js can call it after building the DOM */
    translatePage: translatePage,

    /** Month label from 1-12 */
    monthLabel: function (m) {
      var keys = ['','month_jan','month_feb','month_mar','month_apr','month_mai','month_jun',
                   'month_jul','month_aug','month_sep','month_oct','month_nov','month_dec'];
      return I18n.t(keys[m] || 'month_jan');
    }
  };

  /* ── DOM translation ──────────────────────────────────────────────────── */

  function translatePage() {
    var dict = getTranslations(currentLang);
    var elems = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elems.length; i++) {
      var el = elems[i];
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.textContent = dict[key];
      }
    }
    /* placeholders */
    var phElems = document.querySelectorAll('[data-i18n-ph]');
    for (var j = 0; j < phElems.length; j++) {
      var phKey = phElems[j].getAttribute('data-i18n-ph');
      if (dict[phKey] !== undefined) {
        phElems[j].placeholder = dict[phKey];
      }
    }
    /* titles */
    var titleElems = document.querySelectorAll('[data-i18n-title]');
    for (var k = 0; k < titleElems.length; k++) {
      var tKey = titleElems[k].getAttribute('data-i18n-title');
      if (dict[tKey] !== undefined) {
        titleElems[k].setAttribute('title', dict[tKey]);
      }
    }
    /* hints */
    var hintElems = document.querySelectorAll('[data-i18n-hint]');
    for (var h = 0; h < hintElems.length; h++) {
      var hKey = hintElems[h].getAttribute('data-i18n-hint');
      if (dict[hKey] !== undefined) {
        hintElems[h].textContent = dict[hKey];
      }
    }
    /* document title */
    var pageKey = document.body.getAttribute('data-i18n-page');
    if (pageKey && dict[pageKey]) {
      document.title = dict[pageKey];
    }
    /* html lang + dir */
    document.documentElement.lang = currentLang === 'ar' ? 'ar' : 'fr';
  }

  /* ── RTL / LTR ────────────────────────────────────────────────────────── */

  function applyDir(lang) {
    var dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang === 'ar' ? 'ar' : 'fr');
    document.body.classList.toggle('rtl', lang === 'ar');
    document.body.classList.toggle('ltr', lang !== 'ar');
  }

  /* ── server sync ──────────────────────────────────────────────────────── */

  function syncToServer(lang, skip) {
    if (skip) return;
    try {
      var token = localStorage.getItem('admin_token');
      if (!token) return;
      fetch('/api/admin/language', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify({ language: lang })
      }).catch(function () {});
    } catch (e) { /* ignore */ }
  }

  /** Load language from server on first visit (called at login / page load) */
  window.I18n.loadFromServer = function (cb) {
    try {
      var token = localStorage.getItem('admin_token');
      if (!token) { if (cb) cb(); return; }
      fetch('/api/admin/language', {
        headers: { 'Authorization': 'Bearer ' + token }
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if (data && data.language && isValidLang(data.language)) {
          var saved = data.language;
          var stored = localStorage.getItem(LANG_KEY);
          /* server takes precedence over localStorage (cross-device) */
          if (saved !== stored) {
            currentLang = saved;
            localStorage.setItem(LANG_KEY, saved);
          }
        }
        applyDir(currentLang);
        translatePage();
        if (cb) cb();
      }).catch(function () {
        applyDir(currentLang);
        translatePage();
        if (cb) cb();
      });
    } catch (e) {
      applyDir(currentLang);
      translatePage();
      if (cb) cb();
    }
  };

  /* ── boot ─────────────────────────────────────────────────────────────── */

  /* Immediate apply (before server responds) */
  applyDir(currentLang);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePage);
  } else {
    translatePage();
  }
})();
