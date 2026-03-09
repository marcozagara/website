(() => {
  const gallery = document.getElementById("artGallery");
  if (!gallery) return;

  const sourceNodes = Array.from(gallery.querySelectorAll(".art-gallery__source"));
  if (!sourceNodes.length) return;

  const columns = 3;
  let currentIndex = 0;
  let dragActive = false;
  let startX = 0;
  let deltaX = 0;
  let activePointerId = null;

  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-hidden", "true");

  const prevButton = document.createElement("button");
  prevButton.className = "lightbox__arrow lightbox__arrow--prev";
  prevButton.type = "button";
  prevButton.setAttribute("aria-label", "Previous image");
  prevButton.textContent = "‹";

  const nextButton = document.createElement("button");
  nextButton.className = "lightbox__arrow lightbox__arrow--next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Next image");
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

  const readGap = () => {
    const value = parseFloat(
      getComputedStyle(gallery).getPropertyValue("--gallery-gap")
    );
    return Number.isFinite(value) ? value : 24;
  };

  const items = sourceNodes.map((node) => {
    const image = node.querySelector("img");
    const href = node.getAttribute("href") || "";
    const src = image?.getAttribute("src") || href;
    const alt = image?.getAttribute("alt") || "";

    const w = Number(node.dataset.w);
    const h = Number(node.dataset.h);
    const ratio = w > 0 && h > 0 ? w / h : 1;

    return { href, src, alt, ratio };
  });

  const updateArrows = () => {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === items.length - 1;
    prevButton.classList.toggle("is-disabled", isFirst);
    nextButton.classList.toggle("is-disabled", isLast);
  };

  const syncLightboxGap = () => {
    track.style.gap = `${readGap()}px`;
  };

  const getSlideStep = () => {
    const width = viewport.clientWidth || 1;
    return width + readGap();
  };

  const updateSlide = () => {
    track.style.transition = "transform 0.35s ease";
    track.style.transform = `translateX(-${currentIndex * getSlideStep()}px)`;
    updateArrows();
  };

  const openLightbox = (index) => {
    currentIndex = index;
    syncLightboxGap();
    updateSlide();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
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

  const applyDragTransform = (pixelOffset) => {
    const slideOffset = (-currentIndex * getSlideStep()) + pixelOffset;
    track.style.transform = `translateX(${slideOffset}px)`;
  };

  const startDrag = (event) => {
    if (!lightbox.classList.contains("is-open")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragActive = true;
    activePointerId = event.pointerId;
    startX = event.clientX;
    deltaX = 0;
    track.style.transition = "none";
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event) => {
    if (!dragActive) return;
    deltaX = event.clientX - startX;
    applyDragTransform(deltaX);
  };

  const endDrag = () => {
    if (!dragActive) return;
    dragActive = false;
    viewport.classList.remove("is-dragging");
    if (activePointerId !== null && viewport.hasPointerCapture(activePointerId)) {
      viewport.releasePointerCapture(activePointerId);
    }
    activePointerId = null;

    const width = viewport.clientWidth || 1;
    const threshold = Math.min(120, width * 0.2);

    if (deltaX <= -threshold && currentIndex < items.length - 1) {
      currentIndex += 1;
    } else if (deltaX >= threshold && currentIndex > 0) {
      currentIndex -= 1;
    }

    deltaX = 0;
    updateSlide();
  };

  items.forEach((item) => {
    const slide = document.createElement("div");
    slide.className = "lightbox__slide";

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.draggable = false;

    slide.appendChild(img);
    track.appendChild(slide);
  });

  const buildRows = () => {
    const width = gallery.clientWidth;
    if (!width) return;

    gallery.querySelectorAll(".art-gallery__row").forEach((row) => row.remove());

    const gap = readGap();
    const completeRowHeights = [];

    for (let i = 0; i < items.length; i += columns) {
      const rowItems = items.slice(i, i + columns);
      if (rowItems.length !== columns) continue;
      const ratiosSum = rowItems.reduce((sum, item) => sum + item.ratio, 0) || 1;
      const rowHeight = (width - gap * (columns - 1)) / ratiosSum;
      completeRowHeights.push(rowHeight);
    }

    const baseRowHeight = completeRowHeights.length
      ? completeRowHeights.reduce((sum, value) => sum + value, 0) / completeRowHeights.length
      : null;

    for (let i = 0; i < items.length; i += columns) {
      const rowItems = items.slice(i, i + columns);
      const ratiosSum = rowItems.reduce((sum, item) => sum + item.ratio, 0) || 1;
      const rowHeight = rowItems.length === columns || baseRowHeight === null
        ? (width - gap * (rowItems.length - 1)) / ratiosSum
        : baseRowHeight;

      const row = document.createElement("div");
      row.className = "art-gallery__row";
      row.style.height = `${rowHeight}px`;

      rowItems.forEach((item, offset) => {
        const itemIndex = i + offset;
        const link = document.createElement("a");
        link.className = "art-gallery__item";
        link.href = item.href;
        link.style.width = `${item.ratio * rowHeight}px`;
        link.dataset.index = String(itemIndex);

        const img = document.createElement("img");
        img.src = item.src;
        img.alt = item.alt;
        img.loading = "lazy";

        link.appendChild(img);
        row.appendChild(link);
      });

      gallery.appendChild(row);
    }
  };

  let frameId = 0;
  const scheduleBuild = () => {
    cancelAnimationFrame(frameId);
    frameId = requestAnimationFrame(() => {
      buildRows();
      syncLightboxGap();
      if (lightbox.classList.contains("is-open")) {
        updateSlide();
      }
    });
  };

  gallery.addEventListener("click", (event) => {
    const link = event.target.closest(".art-gallery__item");
    if (!link) return;
    event.preventDefault();
    openLightbox(Number(link.dataset.index));
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
      event.target.closest(".lightbox__viewport") ||
      event.target.closest(".lightbox__arrow")
    ) {
      return;
    }
    closeLightbox();
  });

  viewport.addEventListener("pointerdown", startDrag);
  viewport.addEventListener("pointermove", moveDrag);
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);
  viewport.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") {
      endDrag();
    }
  });

  window.addEventListener("resize", scheduleBuild);
  window.addEventListener("load", scheduleBuild, { once: true });
  syncLightboxGap();
  buildRows();
})();
