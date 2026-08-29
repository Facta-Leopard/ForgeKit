(() => {
  'use strict';

  const STORAGE_KEY = 'ForgeKit.siteLanguage.v1';
  const SUPPORTED_LOCALES = Object.freeze({
    en: 'English',
    ko: '한국어',
    ja: '日本語',
    'zh-Hans': '简体中文',
    'zh-Hant': '繁體中文',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch'
  });

  const localePacks = window.ForgeKitLocalePacks || {};
  const messages = {
    en: {
      'ForgeKit — From first scene to playable game': 'ForgeKit — From your first scene to a playable game',
      'Shape 2D, 3D, and mixed games visually, test them in Play Preview, then hand off an Xcode project. Beta release planned.': 'Design 2D, 3D, and mixed games visually, test them in Play Preview, then continue in Xcode. Beta release planned.',
      'ForgeKit rabbit world-builder with the headline From first scene to playable game.': 'The ForgeKit rabbit building a game world beside the headline “From your first scene to a playable game.”',
      'See how it flows': 'See the workflow',
      'Xcode handoff': 'Continue in Xcode',
      'Beta in progress': 'Beta release planned',
      'Scroll to forge': 'Explore the workflow',
      'XCODE HANDOFF': 'CONTINUE IN XCODE',
      'One creative loop': 'A complete visual workflow',
      'ForgeKit keeps the creative loop visible. The editor owns the world-building work; Xcode remains the final release boundary.': 'Build and preview your game in ForgeKit, then export an Xcode project for signing and release.',
      'Shape the scene': 'Build your scene',
      'Arrange entities, components, assets, and cameras in visual 2D, 3D, or mixed workspaces.': 'Arrange entities, components, assets, and cameras in a visual 2D, 3D, or mixed workspace.',
      'Play while it is fresh': 'Test as you build',
      'Use behavior-driven Play Preview to check the loop while the idea is still easy to reshape.': 'Use Play Preview to test behavior while your idea is still easy to change.',
      'Hand off with context': 'Continue in Xcode',
      'Export a structured Xcode project for signing, archiving, distribution, and platform release work.': 'Export a structured Xcode project for signing, archiving, distribution, and release.',
      'Built from the Moonwhisk Vale tutorial pack': 'Built with the Moonwhisk Vale tutorial pack',
      'This homepage preview uses the bundled tutorial artwork to stage the SwiftUI workspace and the game loop side by side. Switch the screen to see the same project move from authoring to Play Preview.': 'This preview uses the bundled tutorial artwork to show the SwiftUI workspace beside the playable result. Switch views to follow the same project from editing to Play Preview.',
      'Build the lesson inside the workspace.': 'Build the tutorial in the workspace.',
      'The scene hierarchy, inspector, and guided steps frame the same Moonwhisk Vale artwork used by the tutorial pack.': 'The hierarchy, inspector, and guided steps use the same Moonwhisk Vale artwork as the tutorial pack.',
      'Turn the lesson into a playable defense loop.': 'Turn the tutorial into a playable defense scene.',
      'Move the rabbit gunner, fire mana bolts, and stop four incoming birds without leaving the project you were shaping.': 'Move the rabbit gunner, fire mana bolts, and stop four incoming birds in the project you just edited.',
      'A workshop, not a black box': 'A clear, inspectable workspace',
      'Stay close to the feel.': 'Test the game, not just the scene.',
      'Move from editing to a running preview without losing the scene you were shaping.': 'Move from editing to a running preview without losing your place.',
      'Release work stays explicit.': 'Finish the release in Xcode.',
      'ForgeKit prepares the project handoff. Signing, archive, and distribution remain visible in Xcode.': 'ForgeKit prepares the project. Signing, archiving, and distribution stay in Xcode.',
      'A maker at the center': 'The idea behind the icon',
      'Part engineer, part worldsmith: the ForgeKit rabbit turns small systems into living spaces. The goggles, stylus, and glowing voxel world become a visual shorthand for a tool that is curious, precise, and hands-on.': 'The ForgeKit rabbit brings small systems together into playable worlds. Its goggles, stylus, and glowing voxel scene reflect a tool built for curiosity, precision, and hands-on creation.',
      'The workshop is still being forged.': 'ForgeKit is still in development.',
      'A ForgeKit beta release is planned. Until it is ready, follow development on GitHub and preview the direction here.': 'A ForgeKit beta release is planned. Follow development on GitHub and preview what we are building here.',
      'Designed around the ForgeKit app icon.': 'Inspired by the ForgeKit app icon.'
    },
    ko: localePacks.ko?.messages || {},
    ja: localePacks.ja?.messages || {},
    'zh-Hans': localePacks['zh-Hans']?.messages || {},
    'zh-Hant': localePacks['zh-Hant']?.messages || {},
    es: localePacks.es?.messages || {},
    fr: localePacks.fr?.messages || {},
    de: localePacks.de?.messages || {}
  };

  const templates = {
    en: {
      'hero-title': 'Build playable games. <span class="gradient-text">Visually.</span>',
      'hero-lead': 'Design <strong>2D, 3D, and mixed games</strong> in a native macOS workspace. Test ideas in Play Preview, then continue with a structured Xcode project.',
      'workflow-title': 'Build. Preview. Refine. <span>Export.</span>',
      'tutorial-title': 'Learn in the editor.<br><span>Play it right away.</span>',
      'toolkit-title': 'Scenes, logic, previews, and exports.<br><span>All in one place.</span>',
      'character-title': 'The rabbit represents <span>ForgeKit’s hands-on approach.</span>'
    },
    ko: localePacks.ko?.templates || {},
    ja: localePacks.ja?.templates || {},
    'zh-Hans': localePacks['zh-Hans']?.templates || {},
    'zh-Hant': localePacks['zh-Hant']?.templates || {},
    es: localePacks.es?.templates || {},
    fr: localePacks.fr?.templates || {},
    de: localePacks.de?.templates || {}
  };

  const textOriginals = new WeakMap();
  const attributeOriginals = new WeakMap();
  const templateOriginals = new WeakMap();
  let selectionMode = readStoredLocale() || 'auto';
  let currentLocale = selectionMode === 'auto' ? detectBrowserLocale() : selectionMode;

  function normalizeLocale(value) {
    if (!value) return null;

    const candidate = String(value).replaceAll('_', '-');
    if (Object.hasOwn(SUPPORTED_LOCALES, candidate)) return candidate;

    const lower = candidate.toLowerCase();
    if (lower.startsWith('zh')) {
      if (lower.includes('hant') || /-(tw|hk|mo)(-|$)/.test(lower)) return 'zh-Hant';
      return 'zh-Hans';
    }

    const base = lower.split('-')[0];
    return Object.keys(SUPPORTED_LOCALES).find((locale) => locale.toLowerCase() === base) || null;
  }

  function detectBrowserLocale() {
    const preferences = Array.isArray(navigator.languages) && navigator.languages.length
      ? navigator.languages
      : [navigator.language];

    for (const preference of preferences) {
      const locale = normalizeLocale(preference);
      if (locale) return locale;
    }

    return 'en';
  }

  function readStoredLocale() {
    try {
      return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
    } catch {
      return null;
    }
  }

  function writeStoredLocale(locale) {
    try {
      if (locale === 'auto') {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, locale);
      }
    } catch {
      // The page still switches language when storage is unavailable.
    }
  }

  function translate(source, locale = currentLocale) {
    if (!source) return source;
    return messages[locale]?.[source] ?? source;
  }

  function shouldSkipTextNode(node) {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest('script, style, noscript, [data-i18n-static], [data-i18n-template]'));
  }

  function applyTextTranslations() {
    const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();

    while (node) {
      if (!shouldSkipTextNode(node)) {
        if (!textOriginals.has(node)) textOriginals.set(node, node.nodeValue);
        const original = textOriginals.get(node);
        const source = original.trim();

        if (source) node.nodeValue = original.replace(source, translate(source));
      }

      node = walker.nextNode();
    }
  }

  function applyAttributeTranslation(element, attribute) {
    let originals = attributeOriginals.get(element);
    if (!originals) {
      originals = new Map();
      attributeOriginals.set(element, originals);
    }

    if (!originals.has(attribute)) originals.set(attribute, element.getAttribute(attribute));
    const source = originals.get(attribute);
    if (source) element.setAttribute(attribute, translate(source));
  }

  function applyAttributeTranslations() {
    document.querySelectorAll('[aria-label]').forEach((element) => {
      applyAttributeTranslation(element, 'aria-label');
    });

    document.querySelectorAll('img[alt]').forEach((element) => {
      if (element.getAttribute('alt')) applyAttributeTranslation(element, 'alt');
    });

    document.querySelectorAll('meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[property="og:image:alt"], meta[name="twitter:title"], meta[name="twitter:description"], meta[name="twitter:image:alt"]').forEach((element) => {
      applyAttributeTranslation(element, 'content');
    });
  }

  function applyTemplates() {
    document.querySelectorAll('[data-i18n-template]').forEach((element) => {
      const key = element.dataset.i18nTemplate;
      if (!templateOriginals.has(element)) templateOriginals.set(element, element.innerHTML);
      element.innerHTML = templates[currentLocale]?.[key] ?? templateOriginals.get(element);
    });
  }

  function applyTranslations({ announce = true } = {}) {
    document.documentElement.lang = currentLocale;
    applyTemplates();
    applyTextTranslations();
    applyAttributeTranslations();

    const selector = document.querySelector('[data-language-select]');
    if (selector) selector.value = selectionMode;

    if (announce) {
      document.dispatchEvent(new CustomEvent('forgekit:languagechange', {
        detail: { locale: currentLocale, selection: selectionMode }
      }));
    }
  }

  function selectLanguage(nextSelection) {
    const normalized = nextSelection === 'auto' ? 'auto' : normalizeLocale(nextSelection);
    if (!normalized) return;

    selectionMode = normalized;
    currentLocale = normalized === 'auto' ? detectBrowserLocale() : normalized;
    writeStoredLocale(normalized);
    applyTranslations();
  }

  function initialize() {
    const selector = document.querySelector('[data-language-select]');
    selector?.addEventListener('change', (event) => selectLanguage(event.currentTarget.value));
    applyTranslations();
  }

  window.forgeI18n = Object.freeze({
    supportedLocales: SUPPORTED_LOCALES,
    t: translate,
    apply: applyTranslations,
    select: selectLanguage,
    get locale() { return currentLocale; },
    get selection() { return selectionMode; }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
