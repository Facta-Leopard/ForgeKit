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
})();
