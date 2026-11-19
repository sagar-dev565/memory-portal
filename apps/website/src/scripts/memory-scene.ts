/**
 * Hero 3D scene — a "tunnel of memories".
 * Polaroid-style cards float in a spiral that disappears into the distance.
 * Scroll progress (0 → 1) flies the camera through the tunnel.
 * Card images are generated on a canvas (warm abstract tones) — swap them for
 * real family photos later by loading textures instead of `makeCardTexture`.
 */
import * as THREE from "three";

const CAPTIONS = [
  "Wedding · 1985", "First steps · 1990", "Diwali · 1993", "Goa trip · 2002",
  "Birthday · 1996", "Graduation · 2010", "Grandpa · 1979", "New home · 1999",
  "School day · 2001", "Holi · 2005", "Anniversary · 2015", "Today · 2026",
];

const PALETTES: [string, string, string][] = [
  ["#d9c3a1", "#a98762", "#5e4630"],
  ["#e3d1b8", "#b99a7b", "#6a5039"],
  ["#c9b79c", "#8f7a5e", "#3f3326"],
  ["#e6d6c0", "#c2a27c", "#7a5b3a"],
  ["#d6b48c", "#9d6f4a", "#4a3122"],
  ["#cdbfa8", "#8e8473", "#3c3832"],
];

function makeCardTexture(index: number, renderer: THREE.WebGLRenderer): THREE.CanvasTexture {
  const w = 512;
  const h = 620;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const rand = mulberry32(index * 9973 + 7);

  // Polaroid frame
  ctx.fillStyle = "#f1e9da";
  roundRect(ctx, 0, 0, w, h, 14);
  ctx.fill();

  // Photo area
  const px = 30, py = 30, pw = w - 60, ph = h - 150;
  const [a, b, d] = PALETTES[index % PALETTES.length];
  const g = ctx.createLinearGradient(px, py, px + pw * 0.4, py + ph);
  g.addColorStop(0, a);
  g.addColorStop(0.6, b);
  g.addColorStop(1, d);
  ctx.fillStyle = g;
  ctx.fillRect(px, py, pw, ph);

  // Soft abstract shapes — suggest a scene without depicting anyone
  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();
  for (let i = 0; i < 6; i++) {
    const r = 40 + rand() * 120;
    const x = px + rand() * pw;
    const y = py + ph * (0.35 + rand() * 0.7);
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = rand() > 0.5;
    rg.addColorStop(0, light ? "rgba(255,244,225,0.55)" : "rgba(40,28,18,0.45)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(px, py, pw, ph);
  }
  // Sun / light leak
  const lx = px + pw * (0.2 + rand() * 0.6);
  const leak = ctx.createRadialGradient(lx, py + 40, 0, lx, py + 40, 260);
  leak.addColorStop(0, "rgba(255,226,170,0.65)");
  leak.addColorStop(1, "rgba(255,226,170,0)");
  ctx.fillStyle = leak;
  ctx.fillRect(px, py, pw, ph);
  // Film grain
  const img = ctx.getImageData(px, py, pw, ph);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (rand() - 0.5) * 26;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, px, py);
  // Vignette
  const v = ctx.createRadialGradient(px + pw / 2, py + ph / 2, ph * 0.2, px + pw / 2, py + ph / 2, ph * 0.8);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(1, "rgba(30,20,10,0.45)");
  ctx.fillStyle = v;
  ctx.fillRect(px, py, pw, ph);
  ctx.restore();

  // Handwritten-style caption
  ctx.fillStyle = "#4a3f33";
  ctx.font = 'italic 34px "Fraunces", Georgia, serif';
  ctx.textAlign = "center";
  ctx.fillText(CAPTIONS[index % CAPTIONS.length], w / 2, h - 55);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  return tex;
}

export interface MemoryScene {
  setProgress(p: number): void;
  setIntro(p: number): void;
  destroy(): void;
}

export function createMemoryScene(canvas: HTMLCanvasElement): MemoryScene | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null; // No WebGL — the CSS gradient background remains.
  }

  const isSmall = window.innerWidth < 768;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0e0c0a, 5, 24);

  const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
  const CAMERA_START = 6;
  const INTRO_OFFSET = 9;
  camera.position.set(0, 0, CAMERA_START + INTRO_OFFSET);

  // Cards
  const COUNT = isSmall ? 18 : 30;
  const SPACING = 1.15;
  const geometry = new THREE.PlaneGeometry(1.45, 1.76);
  const tunnel = new THREE.Group();
  scene.add(tunnel);

  const cards: { mesh: THREE.Mesh; baseY: number; phase: number; spin: number }[] = [];
  const textures: THREE.Texture[] = [];
  for (let i = 0; i < COUNT; i++) {
    const tex = makeCardTexture(i, renderer);
    textures.push(tex);
    const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true });
    const mesh = new THREE.Mesh(geometry, mat);
    const angle = i * 2.35;
    const radius = (isSmall ? 1.7 : 2.5) + ((i * 37) % 10) / 10 * 1.4;
    const y = Math.sin(angle) * radius * 0.62;
    mesh.position.set(Math.cos(angle) * radius, y, 1.5 - i * SPACING);
    mesh.rotation.set(
      (((i * 17) % 10) / 10 - 0.5) * 0.3,
      -Math.cos(angle) * 0.45,
      (((i * 29) % 10) / 10 - 0.5) * 0.35,
    );
    tunnel.add(mesh);
    cards.push({ mesh, baseY: y, phase: i * 0.7, spin: mesh.rotation.z });
  }
  const depth = COUNT * SPACING;

  // Gold dust
  const dustCount = isSmall ? 350 : 800;
  const positions = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = 4 - Math.random() * (depth + 8);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xd4b07a,
    size: 0.035,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // State
  let progress = 0;
  let intro = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let running = true;
  let frame = 0;

  const onPointer = (e: PointerEvent) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  const io = new IntersectionObserver(([entry]) => {
    const visible = entry.isIntersecting;
    if (visible && !running) {
      running = true;
      tick();
    } else if (!visible) {
      running = false;
    }
  });
  io.observe(canvas);

  const startTime = performance.now();
  const tick = () => {
    if (!running) return;
    frame = requestAnimationFrame(tick);
    const t = (performance.now() - startTime) / 1000;

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    const travel = progress * (depth - 4);
    camera.position.z = CAMERA_START + (1 - intro) * INTRO_OFFSET - travel;
    camera.position.x = mouse.x * 0.6;
    camera.position.y = -mouse.y * 0.4;
    camera.lookAt(mouse.x * 0.2, -mouse.y * 0.1, camera.position.z - 10);

    tunnel.rotation.z = t * 0.03 + progress * 1.2;
    for (const c of cards) {
      c.mesh.position.y = c.baseY + Math.sin(t * 0.6 + c.phase) * 0.08;
      c.mesh.rotation.z = c.spin + Math.sin(t * 0.4 + c.phase) * 0.04;
    }
    dust.rotation.z = -t * 0.02;

    renderer.render(scene, camera);
  };
  tick();

  return {
    setProgress(p: number) {
      progress = p;
    },
    setIntro(p: number) {
      intro = p;
    },
    destroy() {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      textures.forEach((t) => t.dispose());
      cards.forEach((c) => (c.mesh.material as THREE.Material).dispose());
      renderer.dispose();
    },
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
