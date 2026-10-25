/* ============================================================
   Adi's Dentalaya — shared behaviour (vanilla JS)
   Navigation · lightbox · accordions · form validation ·
   video facades · GSAP reveals with safe fallbacks
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Mark the current page in navigation */
  document.querySelectorAll("a.nav-root-link[data-navid], a.nav-link-item[data-navid]").forEach(function (link) {
    if (link.dataset.navid === document.body.dataset.page) {
      link.setAttribute("aria-current", "page");
      link.classList.add("is-current");
    }
  });

  /* ---------------- Mobile navigation ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navPanel = document.querySelector(".nav-panel");
  var navOverlay = document.querySelector(".nav-overlay");
  var navClose = navPanel ? navPanel.querySelector(".nav-close") : null;
  var lastFocus = null;
  /* Closed panel is hidden from the tab order (paired with visibility:hidden in CSS) */
  if (navPanel) navPanel.inert = true;

  function openNav() {
    if (!navPanel) return;
    lastFocus = document.activeElement;
    navPanel.classList.add("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "true");
    if (navOverlay) { navOverlay.classList.add("open"); navOverlay.setAttribute("aria-hidden", "false"); }
    navPanel.setAttribute("aria-hidden", "false");
    navPanel.inert = false;
    document.body.classList.add("nav-open");
    if (navClose) navClose.focus();
  }

  function closeNav() {
    if (!navPanel) return;
    navPanel.classList.remove("open");
    if (navToggle) navToggle.setAttribute("aria-expanded", "false");
    if (navOverlay) { navOverlay.classList.remove("open"); navOverlay.setAttribute("aria-hidden", "true"); }
    navPanel.setAttribute("aria-hidden", "true");
    navPanel.inert = true;
    document.body.classList.remove("nav-open");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  if (navToggle) {
    navToggle.addEventListener("click", openNav);
    navToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openNav(); }
    });
    navToggle.setAttribute("aria-expanded", "false");
  }
  if (navClose) navClose.addEventListener("click", closeNav);
  if (navOverlay) navOverlay.addEventListener("click", closeNav);
  if (navPanel) {
    navPanel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeNav); });
    /* Simple focus wrap while the panel is open */
    navPanel.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusables = navPanel.querySelectorAll("button, a[href]");
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (navPanel && navPanel.classList.contains("open")) closeNav();
      var openDrop = document.querySelector("details.nav-drop[open]");
      if (openDrop) {
        openDrop.removeAttribute("open");
        openDrop.querySelector("summary").focus();
      }
    }
  });

  /* Close desktop dropdowns when clicking elsewhere */
  document.querySelectorAll("details.nav-drop").forEach(function (drop) {
    var summary = drop.querySelector("summary");
    drop.addEventListener("click", function (e) {
      if (e.target.closest(".nav-drop-list")) return;
      e.preventDefault();
      drop.toggleAttribute("open");
      if (summary) summary.setAttribute("aria-expanded", drop.hasAttribute("open") ? "true" : "false");
    });
    drop.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        drop.removeAttribute("open");
        if (summary) summary.setAttribute("aria-expanded", "false");
      }
    });
  });
  document.addEventListener("click", function (e) {
    document.querySelectorAll("details.nav-drop[open]").forEach(function (drop) {
      if (!drop.contains(e.target)) drop.removeAttribute("open");
    });
  });

  /* ---------------- Lightbox ---------------- */
  var lightbox = document.querySelector(".lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var lightboxCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(img) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    if (lightboxCaption) lightboxCaption.textContent = img.alt;
    lightbox.classList.add("open");
    document.body.classList.add("nav-open");
    if (lightboxClose) lightboxClose.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.classList.remove("nav-open");
    if (lightbox && lightbox.contains(document.activeElement)) {
      var imageSource = document.querySelector('[data-lightbox-focused="true"]');
      if (imageSource) imageSource.focus();
    }
  }

  document.querySelectorAll(".gallery-item img, [data-lightbox] img").forEach(function (img) {
    img.setAttribute("tabindex", "0");
    img.setAttribute("role", "button");
    var host = img.closest("[data-lightbox]") || img;
    host.addEventListener("click", function () {
      openLightbox(img);
      img.dataset.lightboxFocused = "true";
    });
    img.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLightbox(img); img.dataset.lightboxFocused = "true"; }
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) closeLightbox(); });
    lightbox.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLightbox(); });
  }

  /* ---------------- Appointment form validation ---------------- */
  var form = document.getElementById("appointment-form");
  if (form) {
    var status = form.querySelector(".form-status");
    var honestNotice = form.querySelector(".sample-notice");

    var rules = {
      firstName: {
        required: true, message: "Please enter your first name."
      },
      lastName: {
        required: true, message: "Please enter your last name."
      },
      postalCode: {
        required: true, pattern: /^\d{6}$/,
        message: "Enter a six-digit postal code, for example 560010."
      },
      city: { required: true, message: "Please enter your city." },
      email: {
        required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        message: "Enter a valid e-mail address, for example name@example.com."
      },
      telephone: {
        required: true, pattern: /^[1-9]\d{9}$/,
        message: "Enter a 10-digit number without 91 or 0 in front."
      },
      date: { required: true, dateOnly: true, message: "Choose a valid appointment date (today or later)." },
      hours: { required: true, message: "Please select your preferred appointment time." }
    };

    function fieldError(name, msg) {
      var input = form.querySelector('[name="' + name + '"]');
      var err = form.querySelector('[data-error-for="' + name + '"]');
      if (err) {
        err.textContent = msg || "";
        err.classList.toggle("visible", Boolean(msg));
      }
      if (input) {
        if (msg) { input.setAttribute("aria-invalid", "true"); }
        else { input.removeAttribute("aria-invalid"); }
      }
    }

    function validateField(name) {
      var rule = rules[name];
      if (!rule) return true;
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return true;
      var value = input.value.trim();

      if (rule.required && !value) { fieldError(name, rule.message); return false; }
      if (rule.pattern && value && !rule.pattern.test(value)) { fieldError(name, rule.message); return false; }
      if (rule.dateOnly && value) {
        var chosen = new Date(value + "T00:00:00");
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (isNaN(chosen.getTime()) || chosen < today) { fieldError(name, rule.message); return false; }
      }
      fieldError(name, "");
      return true;
    }

    var dateInput = form.querySelector('[name="date"]');
    if (dateInput && dateInput.type === "date") {
      var t = new Date();
      t.setHours(0, 0, 0, 0);
      dateInput.min = t.toISOString().split("T")[0];
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      input.addEventListener("input", function () { fieldError(name, ""); });
      input.addEventListener("blur", function () { validateField(name); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      var allValid = true;
      Object.keys(rules).forEach(function (name) {
        var ok = validateField(name);
        if (!ok) {
          allValid = false;
          if (!firstInvalid) {
            var el = form.querySelector('[name="' + name + '"]');
            firstInvalid = el;
          }
        }
      });

      if (status) status.classList.remove("show", "error");

      if (!allValid) {
        if (status) {
          status.textContent = "Please correct the highlighted fields and try again. Nothing was sent anywhere.";
          status.classList.add("show", "error");
        }
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      /* Honest sample submission — no booking is sent to the clinic. */
      if (honestNotice) { honestNotice.classList.add("show"); honestNotice.style.display = "grid"; }
      if (status) {
        status.textContent = "Thank you — this sample shows the details you entered. " +
          "This demo form is NOT connected to the clinic's booking system yet, so no request " +
          "has reached Adi's Dentalaya. Please call +91 96114 23678 or use the official booking page to confirm an appointment.";
        status.classList.add("show");
      }
      if (honestNotice) honestNotice.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    });
  }

  /* ---------------- Video facades (privacy-friendly lazy embeds) ---------------- */
  document.querySelectorAll(".video-facade").forEach(function (facade) {
    facade.addEventListener("click", function () {
      var videoId = facade.dataset.videoId;
      if (!videoId) return;
      var iframe = document.createElement("iframe");
      iframe.className = "video-embed-frame";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.title = facade.dataset.title || "Clinic video";
      iframe.src = "https://www.youtube-nocookie.com/embed/" + videoId + "?autoplay=1&rel=0";
      var label = facade.parentElement.querySelector(".video-embed-note");
      facade.replaceWith(iframe);
      if (label) label.textContent = "Video player loaded — playback is provided by YouTube.";
    });
  });

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll(".js-year").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------------- GSAP ScrollTrigger reveals (safe fallbacks) ---------------- */
  function clearInitialHiding() {
    document.querySelectorAll("[data-reveal-initial]").forEach(function (el) {
      el.removeAttribute("data-reveal-initial");
      el.style.opacity = "";
      el.style.transform = "";
    });
  }

  function initAnimations() {
    if (!window.gsap || !window.ScrollTrigger || reduceMotion) { clearInitialHiding(); return; }
    gsap.registerPlugin(ScrollTrigger);

    /* Gentle stagger for grouped items */
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      var items = group.querySelectorAll("[data-reveal-initial]");
      if (!items.length) return;
      gsap.fromTo(items,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out", stagger: 0.09,
          overwrite: "auto",
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
          onStart: function () { items.forEach(function (el) { el.removeAttribute("data-reveal-initial"); }); }
        }
      );
      items.forEach(function (el) { el.style.opacity = "0"; });
    });

    document.querySelectorAll("[data-reveal-initial]").forEach(function (el) {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1, y: 0, duration: 0.75, ease: "power2.out",
          overwrite: "auto",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onStart: function () { el.removeAttribute("data-reveal-initial"); }
        }
      );
      el.style.opacity = "0";
    });

    /* Hero headline word rise (home only, marked in markup) */
    var heroWords = document.querySelector("[data-hero-words]");
    if (heroWords) {
      gsap.from(heroWords.children, {
        autoAlpha: 0, y: 34, duration: 0.85, ease: "power3.out", stagger: 0.08, delay: 0.1,
        onStart: function () { heroWords.removeAttribute("data-reveal-initial"); }
      });
    }
  }

  if (document.readyState === "complete") {
    initAnimations();
  } else {
    window.addEventListener("load", initAnimations);
  }
  /* Failsafe: never leave content hidden if a trigger never fires */
  setTimeout(clearInitialHiding, 4000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") setTimeout(clearInitialHiding, 1500);
  });
})();
