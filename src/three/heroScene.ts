/**
 * Cena 3D do topo do site: o "R" da Raster Digital extrudado (arte original na face da frente,
 * laterais em metal azul), anéis em órbita, partículas e um chão de pixels ("raster") que acende
 * perto do mouse.
 *
 * Carregada sob demanda (import dinâmico) para não pesar no primeiro carregamento.
 * Coordenadas do "R" vêm de scripts/gerar-r-3d.py.
 */
import {
  AdditiveBlending,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PerspectiveCamera,
  Plane,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  Points,
  PointsMaterial,
  Raycaster,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TextureLoader,
  TorusGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import rShape from "./rShape.json";

export type HeroSceneOptions = {
  canvas: HTMLCanvasElement;
  /** Seção do topo (o canvas ocupa ela inteira). */
  host: HTMLElement;
  /** Caixa onde o "R" deve aparecer (mesmo lugar da arte em CSS). */
  anchor: HTMLElement;
  /** Celular ou aparelho modesto: menos partículas e resolução menor. */
  lite: boolean;
  onReady: () => void;
};

export type HeroScene = { spin: () => void; dispose: () => void };

const CAM_Z = 14;
const DEPTH = 0.14;
const BEVEL = 0.018;
const BLUE = 0x0a7cff;
const CYAN = 0x22c8ff;

function radialTexture(stops: [number, string][], size = 128) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [at, color] of stops) r.addColorStop(at, color);
  g.fillStyle = r;
  g.fillRect(0, 0, size, size);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

/** Brilho da estrela: núcleo branco + raios horizontal e vertical. */
function flareTexture() {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  g.globalCompositeOperation = "lighter";
  const blob = (sx: number, sy: number, inner: string, outer: string) => {
    g.save();
    g.translate(s / 2, s / 2);
    g.scale(sx, sy);
    const r = g.createRadialGradient(0, 0, 0, 0, 0, s / 2);
    r.addColorStop(0, inner);
    r.addColorStop(1, outer);
    g.fillStyle = r;
    g.beginPath();
    g.arc(0, 0, s / 2, 0, Math.PI * 2);
    g.fill();
    g.restore();
  };
  blob(1, 1, "rgba(120,200,255,0.55)", "rgba(10,124,255,0)");
  blob(1, 0.035, "rgba(230,248,255,1)", "rgba(34,200,255,0)");
  blob(0.035, 0.7, "rgba(230,248,255,0.95)", "rgba(34,200,255,0)");
  blob(0.12, 0.12, "rgba(255,255,255,1)", "rgba(180,235,255,0)");
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const floorVertex = /* glsl */ `
  varying vec3 vW;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const floorFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseOn;
  uniform vec3 uC1;
  uniform vec3 uC2;
  varying vec3 vW;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    float scroll = uTime * 0.45;
    vec2 p = vec2(vW.x, vW.z + scroll) * 0.85;
    vec2 cell = floor(p);
    vec2 f = abs(fract(p) - 0.5);
    vec2 w = fwidth(p);
    vec2 l = smoothstep(vec2(0.5) - w * 1.6, vec2(0.5), f);
    float line = max(l.x, l.y);

    // "pixels" que piscam sozinhos
    float h = hash(cell);
    float blink = step(0.88, h) * pow(0.5 + 0.5 * sin(uTime * 1.4 + h * 50.0), 8.0);

    // pixels acesos ao redor do mouse
    vec2 mp = vec2(uMouse.x, uMouse.y + scroll) * 0.85;
    float dm = length(cell + 0.5 - mp);
    float near = smoothstep(3.2, 0.2, dm) * uMouseOn;

    // pixel interno (quadrado menor dentro da célula)
    float inner = 1.0 - smoothstep(0.36, 0.40, max(f.x, f.y));
    float fill = inner * (blink * 0.9 + near * (0.55 + 0.45 * hash(cell + 7.0)));

    float d = -vW.z + 2.0;
    float fade = smoothstep(34.0, 6.0, d) * smoothstep(-2.0, 4.0, d);
    vec3 col = mix(uC1, uC2, clamp(near + blink, 0.0, 1.0));
    float intensity = line * 0.24 + fill * 0.8;
    gl_FragColor = vec4(col * intensity, fade);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export function createHeroScene(o: HeroSceneOptions): HeroScene {
  const renderer = new WebGLRenderer({ canvas: o.canvas, antialias: !o.lite, alpha: true, powerPreference: "high-performance" });
  let dpr = Math.min(window.devicePixelRatio || 1, o.lite ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 140);
  camera.position.set(0, 0, CAM_Z);

  const pmrem = new PMREMGenerator(renderer);
  const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envTarget.texture;
  pmrem.dispose();

  const disposables: { dispose: () => void }[] = [envTarget];
  const track = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

  // ---------- "R" ----------
  const W = rShape.width;
  const H = rShape.height;
  const toV = ([x, y]: number[]) => new Vector2((x - W / 2) / H, (H / 2 - y) / H);
  const shapes = rShape.shapes.map((pts) => new Shape(pts.map(toV)));

  const rig = new Group(); // posição/escala alinhadas à caixa do HTML
  const rGroup = new Group(); // rotação (mouse, balanço, giro)
  rig.add(rGroup);
  scene.add(rig);

  const body = track(new ExtrudeGeometry(shapes, { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 0.012, bevelSegments: 4, curveSegments: 1 }));
  body.translate(0, 0, -DEPTH / 2);
  const capMat = track(new MeshPhysicalMaterial({ color: 0x062062, metalness: 1, roughness: 0.32, envMapIntensity: 0.9 }));
  const sideMat = track(new MeshPhysicalMaterial({ color: 0x1257e6, metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.5 }));
  rGroup.add(new Mesh(body, [capMat, sideMat]));

  const face = track(new ShapeGeometry(shapes));
  const fp = face.attributes.position;
  const fuv = face.attributes.uv;
  for (let i = 0; i < fp.count; i++) fuv.setXY(i, (fp.getX(i) * H) / W + 0.5, fp.getY(i) + 0.5);
  face.translate(0, 0, DEPTH / 2 + BEVEL + 0.002);
  const faceMat = track(new MeshPhysicalMaterial({ metalness: 0.25, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.55, emissive: 0xffffff, emissiveIntensity: 0.62 }));
  const faceMesh = new Mesh(face, faceMat);
  faceMesh.visible = false;
  rGroup.add(faceMesh);

  const flare = new Sprite(track(new SpriteMaterial({ map: track(flareTexture()), blending: AdditiveBlending, depthWrite: false, transparent: true })));
  const [sx, sy] = rShape.star;
  flare.position.set((sx - W / 2) / H, (H / 2 - sy) / H, DEPTH / 2 + BEVEL + 0.03);
  flare.scale.setScalar(0.62);
  rGroup.add(flare);

  const glowTex = track(radialTexture([[0, "rgba(10,124,255,0.55)"], [0.35, "rgba(10,124,255,0.18)"], [1, "rgba(10,124,255,0)"]]));
  const glow = new Sprite(track(new SpriteMaterial({ map: glowTex, blending: AdditiveBlending, depthWrite: false, transparent: true })));
  glow.scale.set(3.6, 3.2, 1);
  glow.position.z = -0.6;
  rig.add(glow);

  // ---------- Anéis em órbita ----------
  const dotTex = track(radialTexture([[0, "rgba(255,255,255,1)"], [0.25, "rgba(160,225,255,0.9)"], [1, "rgba(34,200,255,0)"]], 64));
  const rings: { spinner: Group; speed: number }[] = [];
  const ringDefs = [
    { r: 0.98, tx: 1.22, ty: 0.28, speed: 0.55, color: CYAN, op: 0.6 },
    { r: 1.16, tx: 1.38, ty: -0.42, speed: -0.38, color: BLUE, op: 0.5 },
    { r: 1.34, tx: 1.08, ty: 0.62, speed: 0.26, color: 0x6fb8ff, op: 0.32 },
  ];
  for (const d of ringDefs) {
    const pivot = new Group();
    pivot.rotation.set(d.tx, d.ty, 0);
    const ring = new Mesh(track(new TorusGeometry(d.r, 0.0045, 6, 240)), track(new MeshBasicMaterial({ color: d.color, transparent: true, opacity: d.op, blending: AdditiveBlending, depthWrite: false })));
    pivot.add(ring);
    const spinner = new Group();
    const sat = new Sprite(track(new SpriteMaterial({ map: dotTex, color: d.color, blending: AdditiveBlending, depthWrite: false, transparent: true })));
    sat.position.set(d.r, 0, 0);
    sat.scale.setScalar(0.09);
    spinner.add(sat);
    spinner.rotation.z = Math.random() * Math.PI * 2;
    pivot.add(spinner);
    rig.add(pivot);
    rings.push({ spinner, speed: d.speed });
  }

  // ---------- Luzes ----------
  scene.add(new AmbientLight(0x7fb0ff, 0.4));
  const key = new DirectionalLight(0xffffff, 1.4);
  key.position.set(-3, 4, 8);
  scene.add(key);
  const l1 = new PointLight(CYAN, 5, 0, 1.6);
  const l2 = new PointLight(BLUE, 7, 0, 1.6);
  rig.add(l1, l2);

  // ---------- Partículas ----------
  const N = o.lite ? 420 : 1300;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const speed = new Float32Array(N);
  const palette = [new Color(BLUE), new Color(CYAN), new Color(0xbfe6ff)];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
    pos[i * 3 + 2] = -18 + Math.random() * 20;
    const c = palette[Math.random() < 0.15 ? 2 : Math.random() < 0.5 ? 1 : 0];
    col.set([c.r, c.g, c.b], i * 3);
    speed[i] = 0.08 + Math.random() * 0.25;
  }
  const pGeo = track(new BufferGeometry());
  pGeo.setAttribute("position", new BufferAttribute(pos, 3));
  pGeo.setAttribute("color", new BufferAttribute(col, 3));
  const particles = new Points(pGeo, track(new PointsMaterial({ size: 0.075, map: dotTex, vertexColors: true, transparent: true, opacity: 0.8, depthWrite: false, blending: AdditiveBlending })));
  const field = new Group();
  field.add(particles);
  scene.add(field);

  // ---------- Chão de pixels ----------
  const floorMat = track(
    new ShaderMaterial({
      vertexShader: floorVertex,
      fragmentShader: floorFragment,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(0, 0) },
        uMouseOn: { value: 0 },
        uC1: { value: new Color(BLUE) },
        uC2: { value: new Color(CYAN) },
      },
    })
  );
  const floor = new Mesh(track(new PlaneGeometry(110, 60)), floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const floorPlane = new Plane(new Vector3(0, 1, 0), 0);
  const horizon = new Sprite(track(new SpriteMaterial({ map: glowTex, blending: AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })));
  scene.add(horizon);

  // ---------- Layout: alinha o "R" à caixa do HTML ----------
  let vw = 1;
  let vh = 1;
  function layout() {
    const w = o.host.clientWidth;
    const h = o.host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    vh = 2 * Math.tan((camera.fov * Math.PI) / 360) * CAM_Z;
    vw = vh * camera.aspect;
    const hr = o.host.getBoundingClientRect();
    const ar = o.anchor.getBoundingClientRect();
    const cx = ar.left + ar.width / 2 - hr.left;
    const cy = ar.top + ar.height / 2 - hr.top;
    rig.position.set((cx / w - 0.5) * vw, -(cy / h - 0.5) * vh, 0);
    rig.scale.setScalar(((ar.width / h) * vh) * 0.46);
    const floorY = -vh / 2 + vh * 0.08;
    floor.position.set(0, floorY, -26);
    floorPlane.constant = -floorY;
    horizon.position.set(0, floorY + 0.4, -40);
    horizon.scale.set(vw * 3.2, 7, 1);
  }
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(o.host);

  // ---------- Interação ----------
  const pointer = new Vector2();
  let pointerActive = false;
  let mouseTarget = 0;
  const ray = new Raycaster();
  const hit = new Vector3();
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    pointerActive = true;
    const r = o.canvas.getBoundingClientRect();
    const ndc = new Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(floorPlane, hit) && hit.z < 6) {
      floorMat.uniforms.uMouse.value.set(hit.x, hit.z);
      mouseTarget = 1;
    } else mouseTarget = 0;
  };
  const onLeave = () => {
    pointerActive = false;
    mouseTarget = 0;
  };
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  let spinTarget = 0;
  let spinNow = 0;

  // ---------- Loop ----------
  let visible = true;
  let raf = 0;
  let last = performance.now();
  let t = 0;
  let rotX = 0;
  let rotY = 0;
  let slowFrames = 0;
  let frames = 0;
  let readySent = false;

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) loop();
  });
  io.observe(o.host);
  const onVis = () => {
    if (!document.hidden && visible && !raf) {
      last = performance.now();
      loop();
    }
  };
  document.addEventListener("visibilitychange", onVis);

  function loop() {
    raf = 0;
    if (!visible || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    t += dt;

    // qualidade adaptativa: se estiver lento, reduz a resolução
    frames++;
    if (dt > 0.03) slowFrames++;
    if (frames === 120) {
      if (slowFrames > 50 && dpr > 1) {
        dpr = 1;
        renderer.setPixelRatio(1);
        layout();
      }
      frames = slowFrames = 0;
    }

    const hr = o.host.getBoundingClientRect();
    const progress = Math.min(Math.max(-hr.top / Math.max(hr.height, 1), 0), 1);

    const k = 1 - Math.exp(-dt * 4);
    const tx = (pointerActive ? pointer.y * 0.28 : 0) + Math.sin(t * 0.45) * 0.06 + progress * 0.5;
    const ty = (pointerActive ? pointer.x * 0.5 : 0) + Math.sin(t * 0.6) * 0.32;
    rotX += (tx - rotX) * k;
    rotY += (ty - rotY) * k;
    spinNow += (spinTarget - spinNow) * (1 - Math.exp(-dt * 3));
    rGroup.rotation.set(rotX, rotY + spinNow, Math.sin(t * 0.5) * 0.03);
    rGroup.position.y = Math.sin(t * 0.9) * 0.04;
    rig.position.z = -progress * 3;

    for (const r of rings) r.spinner.rotation.z += r.speed * dt;
    l1.position.set(Math.cos(t * 0.8) * 1.5, Math.sin(t * 0.6) * 0.9, 1.1);
    l2.position.set(Math.cos(t * 0.5 + 2.5) * 1.6, Math.sin(t * 0.7 + 1) * 1.0, 0.9);
    flare.material.opacity = 0.8 + Math.sin(t * 2.2) * 0.2;
    flare.scale.setScalar(0.62 * (1 + Math.sin(t * 2.2) * 0.12));

    for (let i = 0; i < N; i++) {
      let y = pos[i * 3 + 1] + speed[i] * dt;
      if (y > 8) y = -8;
      pos[i * 3 + 1] = y;
    }
    pGeo.attributes.position.needsUpdate = true;
    field.position.x += ((pointerActive ? -pointer.x * 0.5 : 0) - field.position.x) * k;
    field.position.y += ((pointerActive ? pointer.y * 0.3 : 0) - field.position.y) * k;
    field.rotation.y = t * 0.01;

    floorMat.uniforms.uTime.value = t;
    const mo = floorMat.uniforms.uMouseOn;
    mo.value += (mouseTarget - mo.value) * k;

    renderer.render(scene, camera);
    if (!readySent && faceMesh.visible) {
      readySent = true;
      o.onReady();
    }
  }

  // A face só aparece com a textura carregada (sem "R" vazio).
  let faceTex: Texture | null = null;
  new TextureLoader().load("/img/r-mark.webp", (tex) => {
    tex.colorSpace = SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    faceTex = tex;
    faceMat.map = tex;
    faceMat.emissiveMap = tex;
    faceMat.needsUpdate = true;
    faceMesh.visible = true;
  });
  loop();

  return {
    spin() {
      spinTarget += Math.PI * 2;
    },
    dispose() {
      cancelAnimationFrame(raf);
      raf = 0;
      visible = false;
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      faceTex?.dispose();
      for (const d of disposables) d.dispose();
      scene.traverse((obj) => {
        const m = (obj as Mesh).material as Material | Material[] | undefined;
        if (Array.isArray(m)) m.forEach((x) => x.dispose());
        else m?.dispose();
      });
      renderer.dispose();
    },
  };
}
