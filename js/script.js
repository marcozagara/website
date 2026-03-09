const navbar = document.getElementById("navbar");
const path = window.location.pathname.toLowerCase();
const isGalleryPage =
  path.includes("3dart.html") ||
  path.includes("illustrations.html") ||
  path.includes("animations.html");
const isHomePage =
  path.endsWith("/") || path.endsWith("/index.html") || path === "" || path === "/index";
const navScrollThreshold = isGalleryPage ? 5 : 140;
let replayHeroAnimation = null;
let pendingHeroReplay = false;

window.addEventListener("scroll", () => {
  if (window.scrollY > navScrollThreshold) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  if (
    pendingHeroReplay &&
    typeof replayHeroAnimation === "function" &&
    window.scrollY <= 200
  ) {
    pendingHeroReplay = false;
    replayHeroAnimation();
  }
});

const navBrand = document.querySelector(".nav__brand");
if (navBrand && isHomePage) {
  navBrand.addEventListener("click", (event) => {
    event.preventDefault();
    pendingHeroReplay = true;
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}


document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});




document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (
    event.key === "F12" ||
    (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
    (event.ctrlKey && ["u", "s"].includes(key))
  ) {
    event.preventDefault();
  }
});





const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const mobileWorkToggle = document.getElementById("mobileWorkToggle");

if (navToggle && navMenu && navbar) {
  const closeWorkSubmenu = () => {
    navbar.classList.remove("nav--work-open");
    if (mobileWorkToggle) {
      mobileWorkToggle.setAttribute("aria-expanded", "false");
    }
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navbar.classList.contains("nav--open");
    if (isOpen) {
      navbar.classList.remove("nav--open");
      closeWorkSubmenu();
    } else {
      navbar.classList.add("nav--open");
    }

    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
  });

  if (mobileWorkToggle) {
    mobileWorkToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = navbar.classList.toggle("nav--work-open");
      mobileWorkToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navbar.classList.remove("nav--open");
      closeWorkSubmenu();
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const heroTitle = document.querySelector(".hero__title");
const heroSubtitle = document.querySelector(".hero__subtitle");

if (heroTitle && heroSubtitle) {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+-<>?";
  const prefersReducedMotion = false;

  const randomChar = () => charset[Math.floor(Math.random() * charset.length)];

  const scrambleElement = (element, config) => {
    const original = element.textContent || "";
    element.setAttribute("aria-label", original);
    element.textContent = "";

    const chars = Array.from(original);
    const states = chars.map((char, index) => {
      const span = document.createElement("span");
      span.setAttribute("aria-hidden", "true");
      span.style.display = "inline-block";

      const isSpace = char === " ";
      span.textContent = isSpace ? "\u00A0" : randomChar();
      element.appendChild(span);

      return {
        span,
        finalChar: isSpace ? "\u00A0" : char,
        isSpace,
        delay: (index * config.stagger) * (0.55 + Math.random() * 0.9),
        duration: config.baseDuration * (0.75 + Math.random() * 0.65)
      };
    });

    if (prefersReducedMotion) {
      states.forEach((state) => {
        state.span.textContent = state.finalChar;
      });
      return;
    }

    const startTime = performance.now();

    const step = (now) => {
      let completed = true;

      states.forEach((state) => {
        if (state.isSpace) return;

        const elapsed = now - startTime - state.delay;
        if (elapsed <= 0) {
          completed = false;
          return;
        }

        const progress = Math.min(1, elapsed / state.duration);
        if (progress >= 1) {
          state.span.textContent = state.finalChar;
          return;
        }

        completed = false;
        if (progress > 0.82 && Math.random() < 0.45) {
          state.span.textContent = state.finalChar;
        } else {
          state.span.textContent = randomChar();
        }
      });

      if (!completed) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  replayHeroAnimation = () => {
    scrambleElement(heroTitle, { baseDuration: 640, stagger: 26 });
    scrambleElement(heroSubtitle, { baseDuration: 560, stagger: 20 });
  };

  replayHeroAnimation();
}

const animationVideos = document.querySelectorAll(".animations-grid video");
if (animationVideos.length) {
  const stopOtherVideos = (activeVideo) => {
    animationVideos.forEach((otherVideo) => {
      if (otherVideo === activeVideo) return;
      otherVideo.pause();
      try {
        otherVideo.currentTime = 0;
      } catch (_) {
        // Ignore transient seek errors while media is not ready.
      }
    });
  };

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = String(total % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const isAnimationsCollectionPage = path.includes("animations.html");

  const attachCustomVideoControls = (video, options = {}) => {
    if (!video.parentElement) return null;
    if (video.dataset.customControlsBound === "true") return null;
    video.dataset.customControlsBound = "true";

    video.controls = false;
    video.removeAttribute("controls");
    video.muted = true;
    video.setAttribute("muted", "");

    const controls = document.createElement("div");
    controls.className = "anim-controls";
    if (options.isLightbox) {
      controls.classList.add("anim-controls--lightbox");
    }

    const playButton = document.createElement("button");
    playButton.className = "anim-controls__play";
    playButton.type = "button";
    playButton.textContent = "PLAY";

    const loadingLabel = document.createElement("div");
    loadingLabel.className = "anim-controls__loading";
    loadingLabel.textContent = "LOADING";

    const timeLabel = document.createElement("div");
    timeLabel.className = "anim-controls__time";
    timeLabel.textContent = "0:00 / 0:00";

    const bar = document.createElement("div");
    bar.className = "anim-controls__bar";

    const buffered = document.createElement("div");
    buffered.className = "anim-controls__buffered";

    const progress = document.createElement("div");
    progress.className = "anim-controls__progress";

    bar.appendChild(buffered);
    bar.appendChild(progress);
    controls.appendChild(playButton);
    controls.appendChild(loadingLabel);
    controls.appendChild(timeLabel);
    controls.appendChild(bar);
    video.parentElement.appendChild(controls);

    const setLoading = (isLoading) => {
      controls.classList.toggle("is-loading", isLoading);
    };

    const updateTime = () => {
      const current = formatTime(video.currentTime);
      const total = formatTime(video.duration);
      timeLabel.textContent = `${current} / ${total}`;
    };

    const updateProgress = () => {
      const ratio =
        video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0;
      progress.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
    };

    const updateBuffered = () => {
      if (!video.buffered || video.buffered.length === 0 || video.duration <= 0) {
        buffered.style.width = "0%";
        return;
      }
      const end = video.buffered.end(video.buffered.length - 1);
      const ratio = (end / video.duration) * 100;
      buffered.style.width = `${Math.max(0, Math.min(100, ratio))}%`;
    };

    const syncPlayState = () => {
      playButton.textContent = video.paused ? "PLAY" : "PAUSE";
    };

    const togglePlay = () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    };

    playButton.addEventListener("click", (event) => {
      event.stopPropagation();
      togglePlay();
    });

    if (typeof options.onVideoClick === "function") {
      video.addEventListener("click", (event) => {
        options.onVideoClick(event, togglePlay);
      });
    }

    bar.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!video.duration) return;
      const rect = bar.getBoundingClientRect();
      const ratio = (event.clientX - rect.left) / rect.width;
      const nextTime = Math.max(0, Math.min(1, ratio)) * video.duration;
      video.currentTime = nextTime;
    });

    video.addEventListener("loadedmetadata", () => {
      updateTime();
      updateProgress();
      updateBuffered();
      syncPlayState();
      setLoading(false);
    });

    video.addEventListener("timeupdate", () => {
      updateTime();
      updateProgress();
    });

    video.addEventListener("progress", updateBuffered);
    video.addEventListener("play", syncPlayState);
    if (typeof options.onPlay === "function") {
      video.addEventListener("play", () => options.onPlay(video));
    }
    video.addEventListener("pause", syncPlayState);
    video.addEventListener("waiting", () => setLoading(true));
    video.addEventListener("seeking", () => setLoading(true));
    video.addEventListener("playing", () => setLoading(false));
    video.addEventListener("canplay", () => setLoading(false));

    updateTime();
    syncPlayState();

    return {
      controls
    };
  };

  animationVideos.forEach((video) => {
    attachCustomVideoControls(video, {
      onPlay: () => stopOtherVideos(video),
      onVideoClick: (event, togglePlay) => {
        if (window.matchMedia("(max-width: 768px)").matches) {
          event.stopPropagation();
          togglePlay();
        }
      }
    });
  });

  if (isAnimationsCollectionPage) {
    const stopGridVideos = () => {
      animationVideos.forEach((video) => {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {
          // Ignore transient seek errors.
        }
      });
    };

    const items = Array.from(animationVideos).map((video) => {
      const source = video.querySelector("source");
      return {
        src: source?.getAttribute("src") || video.currentSrc || ""
      };
    });

    let currentIndex = 0;

    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("aria-hidden", "true");

    const prevButton = document.createElement("button");
    prevButton.className = "lightbox__arrow lightbox__arrow--prev";
    prevButton.type = "button";
    prevButton.setAttribute("aria-label", "Previous video");
    prevButton.textContent = "‹";

    const nextButton = document.createElement("button");
    nextButton.className = "lightbox__arrow lightbox__arrow--next";
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", "Next video");
    nextButton.textContent = "›";

    const viewport = document.createElement("div");
    viewport.className = "lightbox__viewport";

    const track = document.createElement("div");
    track.className = "lightbox__track";
    viewport.appendChild(track);

    lightbox.appendChild(prevButton);
    lightbox.appendChild(viewport);
    lightbox.appendChild(nextButton);
    document.body.appendChild(lightbox);

    const slideVideos = items.map((item) => {
      const slide = document.createElement("div");
      slide.className = "lightbox__slide";

      const media = document.createElement("div");
      media.className = "lightbox__media";

      const video = document.createElement("video");
      video.className = "lightbox__video";
      video.src = item.src;
      video.playsInline = true;
      video.preload = "metadata";
      video.muted = true;
      video.setAttribute("muted", "");

      media.appendChild(video);
      slide.appendChild(media);
      track.appendChild(slide);
      return video;
    });

    const updateArrows = () => {
      prevButton.classList.toggle("is-disabled", currentIndex === 0);
      nextButton.classList.toggle("is-disabled", currentIndex === items.length - 1);
    };

    const stopLightboxVideos = () => {
      slideVideos.forEach((video) => {
        video.pause();
        try {
          video.currentTime = 0;
        } catch (_) {
          // Ignore transient seek errors.
        }
      });
    };

    const playCurrentVideo = () => {
      stopLightboxVideos();
      const current = slideVideos[currentIndex];
      current?.play().catch(() => {});
    };

    slideVideos.forEach((video) => {
      attachCustomVideoControls(video, {
        isLightbox: true,
        onPlay: () => {
          slideVideos.forEach((otherVideo) => {
            if (otherVideo === video) return;
            otherVideo.pause();
            try {
              otherVideo.currentTime = 0;
            } catch (_) {
              // Ignore transient seek errors.
            }
          });
        },
        onVideoClick: (event, togglePlay) => {
          event.stopPropagation();
          togglePlay();
        }
      });
    });

    const updateSlide = (animate = true) => {
      track.style.transition = animate ? "transform 0.35s ease" : "none";
      track.style.transform = `translateX(-${currentIndex * viewport.clientWidth}px)`;
      updateArrows();
      playCurrentVideo();
    };

    const openLightbox = (index) => {
      stopGridVideos();
      currentIndex = index;
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      updateSlide(false);
      requestAnimationFrame(() => updateSlide(false));
    };

    const closeLightbox = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      stopLightboxVideos();
    };

    const goPrev = () => {
      if (currentIndex <= 0) return;
      currentIndex -= 1;
      updateSlide();
    };

    const goNext = () => {
      if (currentIndex >= items.length - 1) return;
      currentIndex += 1;
      updateSlide();
    };

    document.querySelectorAll(".animations-grid__item").forEach((item, index) => {
      item.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 768px)").matches) {
          return;
        }
        if (event.target.closest(".anim-controls")) {
          return;
        }
        event.preventDefault();
        openLightbox(index);
      });
    });

    prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      goPrev();
    });

    nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      goNext();
    });

    lightbox.addEventListener("click", (event) => {
      if (
        event.target.closest(".lightbox__video") ||
        event.target.closest(".lightbox__arrow")
      ) {
        return;
      }
      closeLightbox();
    });

    window.addEventListener("resize", () => {
      if (
        lightbox.classList.contains("is-open") &&
        window.matchMedia("(max-width: 768px)").matches
      ) {
        closeLightbox();
        return;
      }
      if (lightbox.classList.contains("is-open")) {
        updateSlide(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    });
  }
}

