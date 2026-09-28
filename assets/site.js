(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(pointer: fine)');
  const t = (source) => window.forgeI18n?.t(source) ?? source;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('[data-scroll-progress]');
  const year = document.querySelector('[data-year]');

  if (year) year.textContent = new Date().getFullYear();

  let frameRequested = false;

  const updateScrollState = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, scrollTop / scrollRange));

    header?.classList.toggle('is-scrolled', scrollTop > 18);
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    frameRequested = false;
  };

  const onScroll = () => {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(updateScrollState);
  };

  updateScrollState();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealItems = document.querySelectorAll('.reveal:not(.is-visible)');

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' });

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll('[data-spotlight]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (!finePointer.matches) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });

  const heroCanvas = document.querySelector('[data-parallax-root]');
  const heroModeButtons = document.querySelectorAll('[data-hero-mode-button]');

  const setHeroMode = (mode) => {
    if (!heroCanvas || !['scene', 'behavior', 'play'].includes(mode)) return;

    heroCanvas.dataset.heroMode = mode;
    heroModeButtons.forEach((button) => {
      const active = button.dataset.heroModeButton === mode;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  heroModeButtons.forEach((button) => {
    button.addEventListener('click', () => setHeroMode(button.dataset.heroModeButton));
  });

  if (heroCanvas && finePointer.matches && !reduceMotion.matches) {
    heroCanvas.addEventListener('pointermove', (event) => {
      const bounds = heroCanvas.getBoundingClientRect();
      const horizontal = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      const vertical = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));

      heroCanvas.style.setProperty('--art-x', `${(horizontal * 100).toFixed(1)}%`);
      heroCanvas.style.setProperty('--art-y', `${(vertical * 100).toFixed(1)}%`);
      heroCanvas.style.setProperty('--tilt-x', `${((0.5 - vertical) * 1.6).toFixed(2)}deg`);
      heroCanvas.style.setProperty('--tilt-y', `${((horizontal - 0.5) * 2).toFixed(2)}deg`);
    }, { passive: true });

    heroCanvas.addEventListener('pointerleave', () => {
      heroCanvas.style.setProperty('--art-x', '68%');
      heroCanvas.style.setProperty('--art-y', '36%');
      heroCanvas.style.setProperty('--tilt-x', '0deg');
      heroCanvas.style.setProperty('--tilt-y', '0deg');
    }, { passive: true });
  }

  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  if ('IntersectionObserver' in window && sectionLinks.length) {
    const sectionByID = new Map(sectionLinks.map((link) => {
      const id = link.getAttribute('href').slice(1);
      return [id, { link, section: document.getElementById(id) }];
    }));

    const sectionObserver = new IntersectionObserver((entries) => {
      const current = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!current) return;
      sectionByID.forEach(({ link }, id) => {
        const active = id === current.target.id;
        link.classList.toggle('is-current', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.12, 0.45] });

    sectionByID.forEach(({ section }) => {
      if (section) sectionObserver.observe(section);
    });
  }

  const worldContent = {
    '2D': {
      label: 'SPRITEKIT / 2D',
      copy: 'Compose sprite-driven scenes with a visual canvas and camera-aware preview.'
    },
    '3D': {
      label: 'REALITYKIT / 3D',
      copy: 'Stage spatial scenes with transforms, cameras, lighting, and RealityKit preview.'
    },
    'MIXED': {
      label: 'SPRITEKIT + REALITYKIT',
      copy: 'Keep 2D and 3D ideas in one project when the game concept calls for both.'
    }
  };

  const worldButtons = document.querySelectorAll('[data-world]');
  const worldLabel = document.querySelector('[data-world-label]');
  const worldCopy = document.querySelector('[data-world-copy]');
  let currentWorld = document.querySelector('[data-world].is-active')?.dataset.world || '2D';

  const setWorld = (world) => {
    const next = worldContent[world];
    if (!next || !worldLabel || !worldCopy) return;

    currentWorld = world;
    worldButtons.forEach((candidate) => {
      const active = candidate.dataset.world === world;
      candidate.classList.toggle('is-active', active);
      candidate.setAttribute('aria-pressed', String(active));
    });

    worldLabel.textContent = t(next.label);
    worldCopy.textContent = t(next.copy);
  };

  worldButtons.forEach((button) => {
    button.addEventListener('click', () => setWorld(button.dataset.world));
  });

  const tutorialDemo = document.querySelector('[data-tutorial-demo]');

  if (tutorialDemo) {
    const tutorialScreens = {
      editor: {
        index: '01',
        eyebrow: 'AUTHORING VIEW',
        title: 'Build the lesson inside the workspace.',
        copy: 'The scene hierarchy, inspector, and guided steps frame the same Moonwhisk Vale artwork used by the tutorial pack.',
        playLabel: 'Play'
      },
      play: {
        index: '02',
        eyebrow: 'PLAY PREVIEW',
        title: 'Turn the lesson into a playable defense loop.',
        copy: 'Move the rabbit gunner, fire mana bolts, and stop four incoming birds without leaving the project you were shaping.',
        playLabel: 'Stop'
      }
    };

    const screenButtons = tutorialDemo.querySelectorAll('[data-demo-screen]');
    const playToggle = tutorialDemo.querySelector('[data-demo-play-toggle]');
    const playLabel = tutorialDemo.querySelector('[data-demo-play-label]');
    const captionIndex = tutorialDemo.querySelector('[data-demo-index]');
    const captionEyebrow = tutorialDemo.querySelector('[data-demo-eyebrow]');
    const captionTitle = tutorialDemo.querySelector('[data-demo-title]');
    const captionCopy = tutorialDemo.querySelector('[data-demo-copy]');

    const setTutorialScreen = (mode) => {
      const screen = tutorialScreens[mode];
      if (!screen) return;

      tutorialDemo.dataset.mode = mode;
      screenButtons.forEach((button) => {
        const active = button.dataset.demoScreen === mode;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });

      if (playLabel) playLabel.textContent = t(screen.playLabel);
      if (captionIndex) captionIndex.textContent = screen.index;
      if (captionEyebrow) captionEyebrow.textContent = t(screen.eyebrow);
      if (captionTitle) captionTitle.textContent = t(screen.title);
      if (captionCopy) captionCopy.textContent = t(screen.copy);
    };

    screenButtons.forEach((button) => {
      button.addEventListener('click', () => setTutorialScreen(button.dataset.demoScreen));
    });

    playToggle?.addEventListener('click', () => {
      setTutorialScreen(tutorialDemo.dataset.mode === 'play' ? 'editor' : 'play');
    });

    document.addEventListener('forgekit:languagechange', () => {
      setWorld(currentWorld);
      setTutorialScreen(tutorialDemo.dataset.mode || 'editor');
    });
  } else {
    document.addEventListener('forgekit:languagechange', () => setWorld(currentWorld));
  }

  const creatorAppGrid = document.querySelector('[data-creator-app-grid]');
  const creatorAppCount = document.querySelector('[data-creator-app-count]');
  const creatorAppError = document.querySelector('[data-creator-app-error]');
  const creatorPlatformButtons = [...document.querySelectorAll('[data-creator-platform]')];
  let creatorCatalog = null;
  let creatorPlatform = 'mac';

  const localizedCatalogText = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    const locale = window.forgeI18n?.locale || document.documentElement.lang || 'en';
    return value[locale] || value.en || value.ko || Object.values(value)[0] || '';
  };

  const appendCreatorText = (parent, tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value;
    parent.append(element);
    return element;
  };

  const creatorArtworkURL = (entry) => {
    const filename = String(entry.artwork || '').split('/').pop();
    if (!/^[a-z0-9][a-z0-9._-]*\.(?:png|jpe?g)$/i.test(filename || '')) return '';
    return './assets/creator-apps/' + filename;
  };

  const creatorAppURL = (entry) => {
    if (/^https?:\/\//i.test(entry.href || '')) return entry.href;
    if (entry.id === 'forgeplay') return 'https://facta-leopard.github.io/ForgePlay/';
    return '';
  };

  const creatorPlatformLabel = (platform) => ({
    mac: 'Mac',
    ipad: 'iPad',
    iphone: 'iPhone'
  })[platform] || platform;

  const createCreatorAppCard = (entry, index) => {
    const card = document.createElement('article');
    card.className = 'creator-app-card';
    card.dataset.platform = entry.platform;
    card.dataset.cardNumber = String(index + 1).padStart(2, '0');
    if (entry.id === 'forgeplay') card.dataset.featured = 'true';
    card.style.animationDelay = String(Math.min(index, 5) * 45) + 'ms';

    const topLine = document.createElement('div');
    topLine.className = 'creator-app-card-topline';
    appendCreatorText(topLine, 'span', '', creatorPlatformLabel(entry.platform) + ' / ' + t(entry.kind === 'game' ? 'Game' : 'App'));
    appendCreatorText(topLine, 'span', '', 'APP ' + String(index + 1).padStart(2, '0'));
    card.append(topLine);

    const identity = document.createElement('div');
    identity.className = 'creator-app-identity';
    const artwork = document.createElement('img');
    artwork.className = 'creator-app-artwork';
    artwork.src = creatorArtworkURL(entry);
    artwork.width = 136;
    artwork.height = 136;
    artwork.loading = 'lazy';
    artwork.decoding = 'async';
    artwork.alt = '';
    identity.append(artwork);

    const identityCopy = document.createElement('div');
    appendCreatorText(identityCopy, 'h3', '', entry.name);
    const badges = document.createElement('div');
    badges.className = 'creator-app-badges';
    appendCreatorText(badges, 'span', 'creator-app-badge', creatorPlatformLabel(entry.platform));
    appendCreatorText(badges, 'span', 'creator-app-badge', t(entry.kind === 'game' ? 'Game' : 'App'));
    identityCopy.append(badges);
    identity.append(identityCopy);
    card.append(identity);

    appendCreatorText(card, 'p', 'creator-app-summary', localizedCatalogText(entry.summaries));

    const href = creatorAppURL(entry);
    if (href) {
      const link = appendCreatorText(
        card,
        'a',
        'creator-app-link',
        t(entry.appStoreID ? 'View on the App Store' : 'Open homepage')
      );
      link.href = href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.setAttribute('aria-label', link.textContent + ': ' + entry.name);
    }

    return card;
  };

  const renderCreatorApps = () => {
    if (!creatorCatalog || !creatorAppGrid) return;
    const entries = creatorCatalog.apps.filter((entry) => entry.platform === creatorPlatform);
    const fragment = document.createDocumentFragment();
    entries.forEach((entry, index) => fragment.append(createCreatorAppCard(entry, index)));
    creatorAppGrid.replaceChildren(fragment);
    creatorAppGrid.setAttribute('aria-busy', 'false');

    creatorPlatformButtons.forEach((button) => {
      const selected = button.dataset.creatorPlatform === creatorPlatform;
      button.setAttribute('aria-selected', String(selected));
      button.tabIndex = selected ? 0 : -1;
    });

    if (creatorAppCount) {
      const source = entries.length === 1 ? '1 released app' : '{count} released apps';
      creatorAppCount.textContent = t(source).replace('{count}', String(entries.length));
    }
  };

  const selectCreatorPlatform = (platform) => {
    if (!['mac', 'ipad', 'iphone'].includes(platform)) return;
    creatorPlatform = platform;
    renderCreatorApps();
  };

  creatorPlatformButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectCreatorPlatform(button.dataset.creatorPlatform));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextIndex = (index + direction + creatorPlatformButtons.length) % creatorPlatformButtons.length;
      const nextButton = creatorPlatformButtons[nextIndex];
      selectCreatorPlatform(nextButton.dataset.creatorPlatform);
      nextButton.focus();
    });
  });

  if (creatorAppGrid) {
    fetch('./assets/creator-apps.json?v=20260929-2', {
      cache: 'no-store',
      headers: { Accept: 'application/json' }
    })
      .then((response) => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then((catalog) => {
        if (!Array.isArray(catalog.apps)) throw new Error('Invalid creator app catalog');
        creatorCatalog = catalog;
        renderCreatorApps();
      })
      .catch(() => {
        creatorAppGrid.replaceChildren();
        creatorAppGrid.setAttribute('aria-busy', 'false');
        if (creatorAppError) {
          creatorAppError.hidden = false;
          creatorAppError.textContent = t('The app catalog could not be loaded.');
        }
        if (creatorAppCount) creatorAppCount.textContent = t('Catalog unavailable');
      });

    document.addEventListener('forgekit:languagechange', renderCreatorApps);
  }
})();
