import { FIT_RADIUS, icosphere, ringBand, RING_STRIDE, sparkSeeds } from "./geometry";
import {
  hexToLinear,
  lookAt,
  multiply,
  normalize,
  perspective,
  rotX,
  rotY,
  scaling,
  unrotate,
  type M4,
  type V3,
} from "./math";
import {
  CORE_FRAG,
  CORE_VERT,
  RING_FRAG,
  RING_VERT,
  SPARK_FRAG,
  SPARK_VERT,
} from "./shaders";

export interface SceneParams {
  time: number;
  /** CSS pixels of the stage. */
  width: number;
  height: number;

  // camera / placement
  spin: number;
  /** Camera elevation in degrees; +90 looks straight down. */
  elevation: number;
  /** Diameter of the core's bounding sphere as a fraction of the short side. */
  size: number;
  /** Where the object lands, in clip space (-1..1, +y up). */
  offsetX: number;
  offsetY: number;
  tiltX: number;
  /** 0..1 entrance: the core swells out of nothing. */
  intro: number;

  // core morph
  rough: number;
  gem: number;
  cube: number;
  grid: number;
  irid: number;
  tint: number;

  // ring
  ringTilt: number;
  ringYaw: number;
  ringScale: number;
  ringScroll: number;

  /** 0 at rest, 1 mid-transformation: sparks surge. */
  burst: number;

  /** Cursor in clip space, for the light and the magnet. */
  pointer: [number, number];
  poke: V3;
  pokeAge: number;
  hover: V3;
  hoverAmt: number;
}

export interface SceneRenderer {
  resize(width: number, height: number, dpr: number): void;
  render(p: SceneParams): void;
  /** Object-space direction under a clip-space point, or null if it misses the core. */
  pick(ndcX: number, ndcY: number): V3 | null;
  setRingTexture(source: HTMLCanvasElement): void;
  setAccent(hex: string): void;
  dispose(): void;
}

const FOV = (30 * Math.PI) / 180;
const CORE_PICK_RADIUS = 1.12;
const SPARKS = 380;

interface Prog {
  id: WebGLProgram;
  u: (name: string) => WebGLUniformLocation | null;
}

function makeProgram(
  gl: WebGL2RenderingContext,
  vs: string,
  fs: string,
  label: string,
): Prog | null {
  const compile = (type: number, src: string) => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error(`[process-scene] ${label} shader:`, gl.getShaderInfoLog(sh));
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  };

  const v = compile(gl.VERTEX_SHADER, vs);
  const f = compile(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return null;

  const id = gl.createProgram();
  if (!id) return null;
  gl.attachShader(id, v);
  gl.attachShader(id, f);
  gl.linkProgram(id);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(id, gl.LINK_STATUS)) {
    console.error(`[process-scene] ${label} link:`, gl.getProgramInfoLog(id));
    gl.deleteProgram(id);
    return null;
  }

  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    id,
    u: (name) => {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(id, name));
      return cache.get(name) ?? null;
    },
  };
}

export function createRenderer(
  canvas: HTMLCanvasElement,
  options: { accent: string; detail?: 5 | 6 },
): SceneRenderer | null {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: true,
    powerPreference: "high-performance",
  });
  if (!gl) return null;

  const core = makeProgram(gl, CORE_VERT, CORE_FRAG, "core");
  const ring = makeProgram(gl, RING_VERT, RING_FRAG, "ring");
  const sparks = makeProgram(gl, SPARK_VERT, SPARK_FRAG, "sparks");
  if (!core || !ring || !sparks) return null;

  const buffers: WebGLBuffer[] = [];
  const buffer = (target: number, data: ArrayBufferView) => {
    const b = gl.createBuffer();
    if (!b) throw new Error("process-scene: buffer allocation failed");
    buffers.push(b);
    gl.bindBuffer(target, b);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return b;
  };
  const attribute = (
    prog: Prog,
    name: string,
    size: number,
    stride: number,
    offset: number,
  ) => {
    const loc = gl.getAttribLocation(prog.id, name);
    if (loc < 0) return;
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, offset * 4);
  };

  // core mesh
  const sphere = icosphere(options.detail ?? 6);
  const coreVao = gl.createVertexArray();
  gl.bindVertexArray(coreVao);
  buffer(gl.ARRAY_BUFFER, sphere.positions);
  attribute(core, "a_dir", 3, 0, 0);
  buffer(gl.ELEMENT_ARRAY_BUFFER, sphere.indices);
  const coreCount = sphere.indices.length;

  // ring mesh
  const band = ringBand();
  const ringVao = gl.createVertexArray();
  gl.bindVertexArray(ringVao);
  buffer(gl.ARRAY_BUFFER, band.data);
  attribute(ring, "a_pos", 3, RING_STRIDE, 0);
  attribute(ring, "a_nrm", 3, RING_STRIDE, 3);
  attribute(ring, "a_prof", 3, RING_STRIDE, 6);
  buffer(gl.ELEMENT_ARRAY_BUFFER, band.indices);
  const ringCount = band.indices.length;

  // sparks
  const sparkVao = gl.createVertexArray();
  gl.bindVertexArray(sparkVao);
  buffer(gl.ARRAY_BUFFER, sparkSeeds(SPARKS));
  attribute(sparks, "a_seed", 4, 0, 0);
  gl.bindVertexArray(null);

  let accent = hexToLinear(options.accent);
  let texture: WebGLTexture | null = null;
  let texel: [number, number] = [1 / 4096, 1 / 160];
  let hasText = 0;

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 0);

  // Latest camera, kept so the cursor can be turned into a point on the core.
  const cam = {
    eye: [0, 0, 5] as V3,
    right: [1, 0, 0] as V3,
    up: [0, 1, 0] as V3,
    forward: [0, 0, -1] as V3,
    aspect: 1,
    model: new Float32Array(16) as M4,
    offset: [0, 0] as [number, number],
  };

  const resize = (width: number, height: number, dpr: number) => {
    const w = Math.max(1, Math.round(width * dpr));
    const h = Math.max(1, Math.round(height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const render = (p: SceneParams) => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const minDim = Math.min(p.width, p.height);
    const dist = (FIT_RADIUS * p.height) / (p.size * minDim * Math.tan(FOV / 2));
    const el = (Math.max(-88, Math.min(88, p.elevation)) * Math.PI) / 180;
    const eye: V3 = [0, Math.sin(el) * dist, Math.cos(el) * dist];
    const camera = lookAt(eye, [0, 0, 0]);
    const aspect = p.width / p.height;
    const vp = multiply(
      perspective(FOV, aspect, Math.max(0.05, dist - 7), dist + 9),
      camera.view,
    );
    const model = multiply(rotY(p.spin), rotX(p.tiltX));
    const ringModel = multiply(
      model,
      multiply(rotY(p.ringYaw), multiply(rotX(p.ringTilt), scaling(p.ringScale))),
    );

    cam.eye = eye;
    cam.right = camera.right;
    cam.up = camera.up;
    cam.forward = camera.forward;
    cam.aspect = aspect;
    cam.model = model;
    cam.offset = [p.offsetX, p.offsetY];

    const key = normalize([p.pointer[0] * 0.9 - 0.25, 0.55 + p.pointer[1] * 0.6, 0.85]);
    const grow = 1 - Math.pow(1 - p.intro, 3);

    const shared = (prog: Prog) => {
      gl.uniformMatrix4fv(prog.u("u_vp"), false, vp);
      gl.uniform2f(prog.u("u_offset"), p.offsetX, p.offsetY);
      gl.uniform1f(prog.u("u_time"), p.time);
    };
    const lighting = (prog: Prog) => {
      gl.uniform3f(prog.u("u_eye"), eye[0], eye[1], eye[2]);
      gl.uniform3f(prog.u("u_accent"), accent[0] * 1.5, accent[1] * 1.5, accent[2] * 1.5);
      gl.uniform3f(prog.u("u_key"), key[0], key[1], key[2]);
      gl.uniform1f(prog.u("u_tint"), p.tint);
      gl.uniform1f(prog.u("u_irid"), p.irid);
    };

    // core
    gl.useProgram(core.id);
    shared(core);
    lighting(core);
    gl.uniformMatrix4fv(core.u("u_model"), false, model);
    gl.uniform1f(core.u("u_rough"), p.rough);
    gl.uniform1f(core.u("u_gem"), p.gem);
    gl.uniform1f(core.u("u_cube"), p.cube);
    gl.uniform1f(core.u("u_grid"), p.grid);
    gl.uniform1f(core.u("u_scale"), 0.05 + 0.95 * grow);
    gl.uniform3f(core.u("u_poke"), p.poke[0], p.poke[1], p.poke[2]);
    gl.uniform1f(core.u("u_pokeAge"), p.pokeAge);
    gl.uniform3f(core.u("u_hover"), p.hover[0], p.hover[1], p.hover[2]);
    gl.uniform1f(core.u("u_hoverAmt"), p.hoverAmt);
    gl.bindVertexArray(coreVao);
    gl.drawElements(gl.TRIANGLES, coreCount, gl.UNSIGNED_SHORT, 0);

    // ring
    if (p.ringScale > 0.01) {
      gl.useProgram(ring.id);
      shared(ring);
      lighting(ring);
      gl.uniformMatrix4fv(ring.u("u_model"), false, ringModel);
      gl.uniform1f(ring.u("u_scroll"), p.ringScroll);
      gl.uniform1f(ring.u("u_hasText"), hasText);
      gl.uniform2f(ring.u("u_texel"), texel[0], texel[1]);
      if (texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(ring.u("u_text"), 0);
      }
      gl.bindVertexArray(ringVao);
      gl.drawElements(gl.TRIANGLES, ringCount, gl.UNSIGNED_SHORT, 0);
    }

    // sparks
    gl.useProgram(sparks.id);
    shared(sparks);
    gl.uniform3f(sparks.u("u_accent"), accent[0] * 1.5, accent[1] * 1.5, accent[2] * 1.5);
    gl.uniform1f(sparks.u("u_burst"), p.burst);
    gl.uniform1f(sparks.u("u_px"), canvas.width / p.width);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.depthMask(false);
    gl.bindVertexArray(sparkVao);
    gl.drawArrays(gl.POINTS, 0, SPARKS);
    gl.depthMask(true);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  };

  const pick = (ndcX: number, ndcY: number): V3 | null => {
    const tan = Math.tan(FOV / 2);
    const nx = (ndcX - cam.offset[0]) * tan * cam.aspect;
    const ny = (ndcY - cam.offset[1]) * tan;
    const dir = normalize([
      cam.forward[0] + cam.right[0] * nx + cam.up[0] * ny,
      cam.forward[1] + cam.right[1] * nx + cam.up[1] * ny,
      cam.forward[2] + cam.right[2] * nx + cam.up[2] * ny,
    ]);
    const b = cam.eye[0] * dir[0] + cam.eye[1] * dir[1] + cam.eye[2] * dir[2];
    const c = cam.eye[0] ** 2 + cam.eye[1] ** 2 + cam.eye[2] ** 2 - CORE_PICK_RADIUS ** 2;
    const disc = b * b - c;
    if (disc < 0) return null;
    const t = -b - Math.sqrt(disc);
    const hit: V3 = [cam.eye[0] + dir[0] * t, cam.eye[1] + dir[1] * t, cam.eye[2] + dir[2] * t];
    return normalize(unrotate(cam.model, hit));
  };

  const setRingTexture = (source: HTMLCanvasElement) => {
    if (!texture) texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic");
    if (aniso) {
      const max = gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number;
      gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, max));
    }
    texel = [1 / source.width, 1 / source.height];
    hasText = 1;
  };

  const dispose = () => {
    for (const b of buffers) gl.deleteBuffer(b);
    gl.deleteVertexArray(coreVao);
    gl.deleteVertexArray(ringVao);
    gl.deleteVertexArray(sparkVao);
    if (texture) gl.deleteTexture(texture);
    gl.deleteProgram(core.id);
    gl.deleteProgram(ring.id);
    gl.deleteProgram(sparks.id);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  return {
    resize,
    render,
    pick,
    setRingTexture,
    setAccent: (hex) => {
      accent = hexToLinear(hex);
    },
    dispose,
  };
}
