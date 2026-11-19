/**
 * Motion system for the public website.
 * GSAP + ScrollTrigger + SplitText for scroll-driven animation, Lenis for smooth scroll.
 * Respects prefers-reduced-motion: everything stays visible and static.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { createMemoryScene, type MemoryScene } from "./memory-scene";

gsap.registerPlugin(ScrollTrigger, SplitText);

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(s));

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let lenis: Lenis | null = null;
let scene: MemoryScene | null = null;

init();

function init() {
  const canvas = $<HTMLCanvasElement>("[data-hero-canvas]");
  if (canvas) scene = createMemoryScene(canvas);

  setupHeader();
  setupMenu();

  if (reduced) {
    document.documentElement.classList.add("no-motion");
    document.body.classList.remove("is-loading");
    scene?.setIntro(1);
    setupAnchors();
    return;
  }

  setupLenis();
  setupAnchors();
  if (finePointer) {
    setupCursor();
    setupMagnetic();
    setupTilt();
  }

  // Wait for fonts so SplitText measures real line breaks.
  const fontsReady = (document as any).fonts?.ready ?? Promise.resolve();
  runPreloader(fontsReady).then(() => {
    setupScrollAnimations();
    ScrollTrigger.refresh();
  });
}

/* ---------------- Smooth scroll ---------------- */
function setupLenis() {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

function setupAnchors() {
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: 0, duration: 1.6 });
      else (target as HTMLElement).scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    });
  });
}

/* ---------------- Header & menu ---------------- */
function setupHeader() {
  const header = $("[data-header]");
  if (!header) return;
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    const hide = y > lastY && y > window.innerHeight * 0.6 && !header.classList.contains("is-open");
    header.classList.toggle("is-hidden", hide);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupMenu() {
  const header = $("[data-header]");
  const burger = $("[data-burger]");
  burger?.addEventListener("click", () => {
    const open = !header?.classList.contains("is-open");
    header?.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    if (open) lenis?.stop();
    else lenis?.start();
  });
}

function closeMenu() {
  const header = $("[data-header]");
  if (!header?.classList.contains("is-open")) return;
  header.classList.remove("is-open");
  $("[data-burger]")?.setAttribute("aria-expanded", "false");
  lenis?.start();
}

/* ---------------- Cursor, magnetic, tilt ---------------- */
function setupCursor() {
  const dot = $("[data-cursor-dot]");
  const ring = $("[data-cursor-ring]");
  const cursor = $("[data-cursor]");
  if (!dot || !ring || !cursor) return;
  const dx = gsap.quickTo(dot, "x", { duration: 0.1 });
  const dy = gsap.quickTo(dot, "y", { duration: 0.1 });
  const rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
  window.addEventListener("pointermove", (e) => {
    dx(e.clientX);
    dy(e.clientY);
    rx(e.clientX);
    ry(e.clientY);
  });
  $$("a, button, [data-hover], summary").forEach((el) => {
    el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
  });
}

function setupMagnetic() {
  $$("[data-magnetic]").forEach((el) => {
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * 0.3);
      y((e.clientY - (r.top + r.height / 2)) * 0.35);
    });
    el.addEventListener("pointerleave", () => {
      x(0);
      y(0);
    });
  });
}

function setupTilt() {
  $$("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, { rotateY: px * 12, rotateX: -py * 12, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
    });
    el.addEventListener("pointerleave", () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
    });
  });
}

/* ---------------- Preloader + hero intro ---------------- */
function runPreloader(fontsReady: Promise<unknown>): Promise<void> {
  return new Promise((resolve) => {
    const pre = $("[data-preloader]");
    const count = $("[data-preloader-count]");
    const bar = $("[data-preloader-bar]");
    const counter = { v: 0 };

    const heroTitle = $("[data-split-hero]");
    const split = heroTitle ? SplitText.create(heroTitle, { type: "lines,words", mask: "lines" }) : null;
    if (split) gsap.set(split.words, { yPercent: 115 });
    gsap.set("[data-hero-fade]", { autoAlpha: 0, y: 30 });

    const tl = gsap.timeline({ delay: 0.15 });
    tl.to(counter, {
      v: 100,
      duration: 1.8,
      ease: "power2.inOut",
      onUpdate: () => {
        if (count) count.textContent = String(Math.round(counter.v));
        if (bar) bar.style.width = counter.v + "%";
      },
    });
    tl.add(() => fontsReady as any);
    tl.to(pre, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=0.15");
    tl.add(() => {
      document.body.classList.remove("is-loading");
      lenis?.start();
    }, "<0.4");
    const intro = { p: 0 };
    tl.to(intro, { p: 1, duration: 2.4, ease: "expo.out", onUpdate: () => scene?.setIntro(intro.p) }, "<0.1");
    if (split) tl.to(split.words, { yPercent: 0, duration: 1.3, stagger: 0.05, ease: "expo.out" }, "<0.3");
    tl.to("[data-hero-fade]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12, ease: "expo.out" }, "<0.5");
    tl.add(() => {
      pre?.remove();
      resolve();
    });
  });
}

/* ---------------- Scroll-driven animation ---------------- */
function setupScrollAnimations() {
  heroScroll();
  marquee();
  splitHeadings();
  reveals();

  const mm = gsap.matchMedia();
  mm.add("(min-width: 901px)", () => {
    problemPinned();
    servicesHorizontal();
  });
  mm.add("(max-width: 900px)", () => {
    problemSimple();
  });

  howItWorks();
  portalTilt();
  keyCard();
  plansAndFlow();
  ctaAndFooter();
}

function heroScroll() {
  const hero = $("[data-hero]");
  if (!hero) return;
  ScrollTrigger.create({
    trigger: hero,
    start: "top top",
    end: "+=160%",
    pin: true,
    scrub: true,
    onUpdate: (self) => scene?.setProgress(self.progress),
  });
  gsap.to("[data-hero-content]", {
    autoAlpha: 0,
    y: -80,
    scale: 0.96,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "+=55%", scrub: true },
  });
}

function marquee() {
  const track = $("[data-marquee]");
  if (!track) return;
  const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  let speed = 1;
  ScrollTrigger.create({
    trigger: track,
    start: "top bottom",
    end: "bottom top",
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-6, 6, self.getVelocity() / 250);
      speed = (self.direction === 1 ? 1 : -1) * (1 + Math.abs(v));
      gsap.to(loop, { timeScale: speed, duration: 0.3, overwrite: true });
      gsap.to(loop, { timeScale: self.direction === 1 ? 1 : -1, duration: 1.2, delay: 0.3 });
    },
  });
}

function splitHeadings() {
  $$("[data-split]").forEach((el) => {
    const split = SplitText.create(el, { type: "lines,words", mask: "lines" });
    gsap.from(split.words, {
      yPercent: 115,
      duration: 1.2,
      stagger: 0.04,
      ease: "expo.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
}

function reveals() {
  gsap.set("[data-reveal]", { autoAlpha: 0, y: 50 });
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "expo.out" }),
  });
}

function problemPinned() {
  const pin = $("[data-problem-pin]");
  const lines = $$("[data-problem-line]");
  const tape = $("[data-tape]");
  const noise = $("[data-tape-noise]");
  const glow = $("[data-tape-glow]");
  const status = $("[data-tape-status]");
  const stage = tape?.closest(".stage");
  if (!pin || !tape) return;

  gsap.set(lines, { autoAlpha: 0.12 });
  gsap.set("[data-problem-lead]", { autoAlpha: 0, y: 30 });

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: "+=220%",
      pin: true,
      scrub: 1,
      onUpdate: (self) => {
        const restored = self.progress > 0.72;
        stage?.classList.toggle("is-restored", restored);
        if (status) status.textContent = restored ? "Signal: restored" : "Signal: degrading";
      },
    },
  });

  tl.to(tape, { rotateY: 332, rotateX: 8, ease: "power1.inOut", duration: 2.9 }, 0);
  tl.to("[data-reel]", { rotate: 1080, ease: "none", duration: 4 }, 0);
  lines.forEach((line, i) => {
    tl.to(line, { autoAlpha: 1, duration: 0.4 }, i * 0.9);
    if (i < lines.length - 1) tl.to(line, { autoAlpha: 0.22, duration: 0.4 }, i * 0.9 + 0.8);
  });
  tl.to(noise, { opacity: 0.6, duration: 1.5 }, 0.8);
  tl.to("[data-tape-wrap]", { filter: "grayscale(0) contrast(1) brightness(1)", duration: 0.8 }, 2.8);
  tl.to(noise, { opacity: 0, duration: 0.6 }, 2.8);
  tl.to(glow, { opacity: 1, duration: 0.8 }, 2.9);
  tl.to("[data-problem-lead]", { autoAlpha: 1, y: 0, duration: 0.6 }, 3.2);
}

function problemSimple() {
  const tape = $("[data-tape]");
  $$("[data-problem-line]").forEach((line) => {
    gsap.from(line, { autoAlpha: 0, y: 40, duration: 1, ease: "expo.out", scrollTrigger: { trigger: line, start: "top 88%" } });
  });
  if (tape) {
    gsap.to(tape, {
      rotateY: 180,
      ease: "none",
      scrollTrigger: { trigger: tape, start: "top bottom", end: "bottom top", scrub: true },
    });
  }
}

function servicesHorizontal() {
  const pin = $("[data-services-pin]");
  const track = $("[data-services-track]");
  const bar = $("[data-services-bar]");
  if (!pin || !track) return;
  const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
  gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: pin,
      start: "top top",
      end: () => "+=" + distance(),
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => bar && gsap.set(bar, { scaleX: self.progress }),
    },
  });
}

function howItWorks() {
  const list = $("[data-how-steps]");
  const line = $("[data-how-line]");
  const tracker = $$("[data-tracker] .tracker__step");
  if (!list) return;
  if (line) {
    gsap.to(line, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: list,
        start: "top 70%",
        end: "bottom 60%",
        scrub: true,
        onUpdate: (self) => {
          const active = Math.min(tracker.length - 1, Math.floor(self.progress * tracker.length));
          tracker.forEach((el, i) => {
            el.classList.toggle("is-done", i < active);
            el.classList.toggle("is-current", i === active);
          });
        },
      },
    });
  }
  $$("[data-how-step]").forEach((step) => {
    gsap.from(step, {
      autoAlpha: 0,
      y: 60,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: step, start: "top 80%" },
    });
  });
}

function portalTilt() {
  const frame = $("[data-portal-frame]");
  if (!frame) return;
  gsap.fromTo(
    frame,
    { rotateX: 38, scale: 0.84, y: 80 },
    {
      rotateX: 0,
      scale: 1,
      y: 0,
      ease: "none",
      scrollTrigger: { trigger: frame, start: "top bottom", end: "top 20%", scrub: true },
    },
  );
  gsap.from("[data-tl-item]", {
    autoAlpha: 0,
    y: 40,
    stagger: 0.12,
    duration: 1,
    ease: "expo.out",
    scrollTrigger: { trigger: frame, start: "top 45%" },
  });
}

function keyCard() {
  const key = $("[data-key]");
  const stage = $("[data-ks-stage]");
  if (!key || !stage) return;
  gsap.fromTo(
    key,
    { rotateY: -40, rotateX: 14, rotateZ: -6 },
    {
      rotateY: 220,
      rotateX: -8,
      rotateZ: 4,
      ease: "none",
      scrollTrigger: { trigger: stage, start: "top bottom", end: "bottom top", scrub: 1 },
    },
  );
  gsap.to("[data-key-shine]", {
    xPercent: 120,
    ease: "none",
    scrollTrigger: { trigger: stage, start: "top 80%", end: "center 30%", scrub: true },
  });
  gsap.to(key, { y: -18, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
}

function plansAndFlow() {
  const plans = $$("[data-plan]");
  if (plans.length) {
    gsap.from(plans, {
      autoAlpha: 0,
      y: 120,
      rotateX: 22,
      transformOrigin: "50% 100%",
      stagger: 0.15,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: { trigger: "[data-plans]", start: "top 80%" },
    });
  }
  const steps = $$("[data-flow-step]");
  if (steps.length) {
    gsap.from(steps, {
      autoAlpha: 0,
      x: -40,
      stagger: 0.1,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: "[data-flow]", start: "top 85%" },
    });
  }
}

function ctaAndFooter() {
  const title = $("[data-cta-title]");
  if (title) {
    const split = SplitText.create(title, { type: "chars,words", mask: "chars" });
    gsap.from(split.chars, {
      yPercent: 120,
      rotate: 8,
      stagger: 0.025,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: title, start: "top 80%" },
    });
  }
  const word = $("[data-footer-word]");
  if (word) {
    gsap.fromTo(
      word,
      { xPercent: 6 },
      { xPercent: -6, ease: "none", scrollTrigger: { trigger: word, start: "top bottom", end: "bottom top", scrub: true } },
    );
  }
}
