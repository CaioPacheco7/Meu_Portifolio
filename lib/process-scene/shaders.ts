import { normalize, type V3 } from "./math";

/**
 * Face normals of an icosahedron (the vertices of its dual dodecahedron).
 * The "gem" form is the intersection of these 20 half-spaces.
 */
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_NORMALS: V3[] = (() => {
  const out: V3[] = [];
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) out.push([x, y, z]);
  for (const a of [-1, 1]) {
    for (const b of [-1, 1]) {
      out.push([0, a / PHI, b * PHI], [a / PHI, b * PHI, 0], [a * PHI, 0, b / PHI]);
    }
  }
  return out.map(normalize);
})();

const f = (n: number) => n.toFixed(6);
const ICO_GLSL =
  "const vec3 ICO[20] = vec3[20](" +
  ICO_NORMALS.map((v) => `vec3(${f(v[0])},${f(v[1])},${f(v[2])})`).join(",") +
  ");";

const HEAD = "#version 300 es\nprecision highp float;\nprecision highp int;\n";

// -- shared: hashing, noise, the lighting studio ---------------------------

const NOISE = /* glsl */ `
float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x),
        mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x),
        mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y),
    f.z) * 2.0 - 1.0;
}
float fbm(vec3 p) {
  const mat3 m = mat3(0.00, 0.80, 0.60, -0.80, 0.36, -0.48, -0.60, -0.48, 0.64);
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 2; i++) {
    s += a * vnoise(p);
    p = m * p * 2.02;
    a *= 0.5;
  }
  return s;
}
`;

// A dark photo studio seen in a mirror: a few rectangular softboxes, a horizon
// line, and a hot spot that follows the cursor. Everything is tinted by the
// site accent so the metal reads as part of the page.
const LIGHTING = /* glsl */ `
uniform vec3 u_eye;
uniform vec3 u_accent;
uniform vec3 u_key;
uniform float u_time;
uniform float u_tint;

float softbox(vec3 r, vec3 dir, vec3 upHint, vec2 size, float soft) {
  float fw = dot(r, dir);
  if (fw <= 0.0) return 0.0;
  vec3 right = normalize(cross(upHint, dir));
  vec3 up = cross(dir, right);
  vec2 q = vec2(dot(r, right), dot(r, up)) / fw;
  vec2 d = abs(q) - size;
  float sd = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  return 1.0 - smoothstep(-soft, soft, sd);
}

vec3 studio(vec3 r) {
  // a silver-blue sky that falls away to a black floor, so flat facets find mid-tones
  float up = r.y * 0.5 + 0.5;
  vec3 col = mix(vec3(0.002, 0.002, 0.004), vec3(0.085, 0.09, 0.13), smoothstep(0.25, 1.0, up));
  col += u_accent * 0.10 * exp(-abs(r.y + 0.04) * 16.0);
  col += vec3(1.0, 0.98, 1.0) * 2.6 *
    softbox(r, normalize(vec3(-0.35, 0.92, 0.22)), vec3(0.0, 0.0, 1.0), vec2(0.85, 0.5), 0.10);
  col += mix(vec3(1.0), u_accent * 1.4, 0.75) * 3.6 *
    softbox(r, normalize(vec3(0.96, 0.08, 0.22)), vec3(0.0, 1.0, 0.0), vec2(0.16, 1.3), 0.06);
  col += vec3(0.85, 0.92, 1.0) * 2.2 *
    softbox(r, normalize(vec3(-0.30, 0.30, -0.90)), vec3(0.0, 1.0, 0.0), vec2(1.5, 0.05), 0.03);
  col += vec3(1.0) * 1.8 * pow(max(dot(r, u_key), 0.0), 70.0);
  return col;
}

vec3 chrome(vec3 n, vec3 v, float irid) {
  float ndv = clamp(dot(n, v), 0.0, 1.0);
  vec3 r = reflect(-v, n);
  float fres = pow(1.0 - ndv, 4.0);
  vec3 f0 = mix(vec3(0.90, 0.91, 0.96), u_accent * 0.4 + 0.6, u_tint);
  vec3 F = f0 + (1.0 - f0) * fres;
  vec3 col = studio(r) * F;
  col += u_accent * fres * 0.4;
  vec3 film = 0.5 + 0.5 * cos(6.28318 * (vec3(0.0, 0.33, 0.67) + ndv * 1.25 + 0.12 * sin(u_time * 0.25)));
  col = mix(col, col * (0.55 + 1.3 * film), irid * 0.7);
  return col;
}

vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 finish(vec3 col, vec2 frag) {
  col = pow(aces(col), vec3(1.0 / 2.2));
  col += (hash13(vec3(frag, u_time)) - 0.5) / 255.0;
  return col;
}
`;

// -- core ------------------------------------------------------------------

export const CORE_VERT =
  HEAD +
  NOISE +
  ICO_GLSL +
  /* glsl */ `
in vec3 a_dir;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform vec2 u_offset;
uniform float u_time;
uniform float u_rough;
uniform float u_gem;
uniform float u_cube;
uniform float u_scale;
uniform vec3 u_poke;
uniform float u_pokeAge;
uniform vec3 u_hover;
uniform float u_hoverAmt;
out vec3 v_n;
out vec3 v_w;
out vec3 v_o;

vec3 shape(vec3 d) {
  float r = 1.0;

  if (u_gem > 0.001) {
    float m = 0.0;
    for (int i = 0; i < 20; i++) m += pow(max(dot(d, ICO[i]), 0.0), 40.0);
    m = pow(m, 1.0 / 40.0);
    r = mix(r, 0.91 / max(m, 0.0001), u_gem);
  }

  if (u_cube > 0.001) {
    float p = mix(2.0, 11.0, u_cube);
    vec3 a = pow(abs(d), vec3(p));
    float rc = mix(1.0, 0.83, u_cube) / pow(a.x + a.y + a.z, 1.0 / p);
    r = mix(r, rc, u_cube);
  }

  // liquid metal: slow domain-warped lumps
  vec3 q = d * 1.15 + vec3(0.0, u_time * 0.10, u_time * 0.04);
  float lump = fbm(q + 0.35 * vec3(vnoise(q * 1.7 + u_time * 0.08)));
  r *= 1.0 + u_rough * (0.40 * lump) + 0.012 * sin(u_time * 1.3);

  float c = dot(d, u_poke);
  float q2 = 1.0 - c;
  float ang = sqrt(2.0 * q2 + 0.004);
  r += 0.075 * sin(ang * 15.0 - u_pokeAge * 11.0) * exp(-u_pokeAge * 1.7) * exp(-ang * 1.5);

  r += u_hoverAmt * 0.085 * exp(-(1.0 - dot(d, u_hover)) * 9.0);

  return d * r * u_scale;
}

void main() {
  vec3 d = normalize(a_dir);
  vec3 t = normalize(cross(d, abs(d.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 b = cross(d, t);
  const float e = 0.011;
  vec3 p0 = shape(d);
  vec3 p1 = shape(normalize(d + t * e));
  vec3 p2 = shape(normalize(d + b * e));
  vec3 n = normalize(cross(p1 - p0, p2 - p0));

  vec4 w = u_model * vec4(p0, 1.0);
  v_w = w.xyz;
  v_o = p0;
  v_n = mat3(u_model) * n;
  gl_Position = u_vp * w;
  gl_Position.xy += u_offset * gl_Position.w;
}
`;

export const CORE_FRAG =
  HEAD +
  NOISE +
  LIGHTING +
  /* glsl */ `
in vec3 v_n;
in vec3 v_w;
in vec3 v_o;
uniform float u_irid;
uniform float u_grid;
out vec4 outColor;

void main() {
  vec3 n = normalize(v_n);
  vec3 v = normalize(u_eye - v_w);
  if (dot(n, v) < 0.0) n = -n;
  vec3 col = chrome(n, v, u_irid);

  if (u_grid > 0.001) {
    // blueprint lattice sliced through the volume, plus a scan line that sweeps it
    vec3 gp = v_o * 3.4;
    vec3 fw = fwidth(gp) * 1.4;
    vec3 ln = 1.0 - smoothstep(vec3(0.0), fw + 0.012, abs(fract(gp - 0.5) - 0.5));
    float lines = max(ln.x, max(ln.y, ln.z));
    float scan = exp(-pow((v_o.y - (fract(u_time * 0.16) * 2.6 - 1.3)) * 5.0, 2.0));
    col += u_accent * 2.6 * lines * u_grid * (0.35 + 0.65 * scan * 2.0 + 0.3);
    col += vec3(0.75, 0.8, 1.0) * scan * 0.28 * u_grid;
  }

  outColor = vec4(finish(col, gl_FragCoord.xy), 1.0);
}
`;

// -- ring ------------------------------------------------------------------

export const RING_VERT =
  HEAD +
  /* glsl */ `
in vec3 a_pos;
in vec3 a_nrm;
in vec3 a_prof;
uniform mat4 u_vp;
uniform mat4 u_model;
uniform vec2 u_offset;
out vec3 v_n;
out vec3 v_w;
out vec3 v_prof;
out vec3 v_t;
out vec3 v_r;

void main() {
  vec4 w = u_model * vec4(a_pos, 1.0);
  v_w = w.xyz;
  v_n = mat3(u_model) * a_nrm;
  v_prof = a_prof;
  vec3 radial = normalize(vec3(a_pos.x, 0.0, a_pos.z));
  v_r = mat3(u_model) * radial;
  v_t = mat3(u_model) * vec3(-radial.z, 0.0, radial.x);
  gl_Position = u_vp * w;
  gl_Position.xy += u_offset * gl_Position.w;
}
`;

export const RING_FRAG =
  HEAD +
  NOISE +
  LIGHTING +
  /* glsl */ `
in vec3 v_n;
in vec3 v_w;
in vec3 v_prof;
in vec3 v_t;
in vec3 v_r;
uniform sampler2D u_text;
uniform vec2 u_texel;
uniform float u_scroll;
uniform float u_hasText;
uniform float u_irid;
out vec4 outColor;

void main() {
  vec3 n = normalize(v_n);
  vec3 v = normalize(u_eye - v_w);
  if (dot(n, v) < 0.0) n = -n;

  float face = v_prof.z;
  float plane = smoothstep(0.5, 0.95, abs(face));
  float on = plane * u_hasText;
  float ink = 0.0;

  // The flat faces are crowned slightly, so the metal grades across the band
  // instead of flashing flat white when it catches a softbox.
  n = normalize(n + normalize(v_r) * (v_prof.y * 2.0 - 1.0) * 0.55 * plane);

  if (on > 0.0) {
    // The inscription reads correctly from above and, mirrored, from below.
    float side = face >= 0.0 ? 1.0 : -1.0;
    vec2 uv = vec2(v_prof.x * side + u_scroll, v_prof.y);
    float h = texture(u_text, uv).r;
    float hx = texture(u_text, uv + vec2(u_texel.x * 1.5, 0.0)).r;
    float hy = texture(u_text, uv + vec2(0.0, u_texel.y * 1.5)).r;
    vec3 tu = normalize(v_t) * side;
    n = normalize(n - (tu * (hx - h) + normalize(v_r) * (hy - h)) * 5.0 * on);
    ink = h * on;
  }

  vec3 col = chrome(n, v, u_irid * 0.4);
  col = mix(col, col * 0.18, ink * 0.55);
  col += u_accent * ink * 1.5;
  outColor = vec4(finish(col, gl_FragCoord.xy), 1.0);
}
`;

// -- sparks ----------------------------------------------------------------

export const SPARK_VERT =
  HEAD +
  /* glsl */ `
in vec4 a_seed;
uniform mat4 u_vp;
uniform vec2 u_offset;
uniform float u_time;
uniform float u_burst;
uniform float u_px;
out float v_a;

void main() {
  float speed = (0.022 + 0.035 * a_seed.z) * (1.0 + u_burst * 3.2);
  float life = fract(a_seed.w + u_time * speed);
  vec3 p = vec3((a_seed.x - 0.5) * 7.5, (life - 0.5) * 6.4, (a_seed.y - 0.5) * 4.2 - 0.4);
  p.x += sin(u_time * 0.45 + a_seed.z * 40.0 + life * 7.0) * 0.28;
  p.z += cos(u_time * 0.37 + a_seed.x * 30.0) * 0.22;
  v_a = smoothstep(0.0, 0.14, life) * (1.0 - smoothstep(0.55, 1.0, life));
  v_a *= (0.35 + 0.65 * a_seed.z) * (0.55 + 0.45 * u_burst + 0.25);
  gl_Position = u_vp * vec4(p, 1.0);
  gl_Position.xy += u_offset * gl_Position.w;
  gl_PointSize = (1.4 + 3.4 * a_seed.z * a_seed.z) * u_px * (1.0 + u_burst * 0.7);
}
`;

export const SPARK_FRAG =
  HEAD +
  /* glsl */ `
in float v_a;
uniform vec3 u_accent;
out vec4 outColor;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float g = pow(max(1.0 - d, 0.0), 2.2);
  vec3 col = mix(u_accent * 3.0, vec3(1.0), 0.45);
  float a = g * v_a;
  outColor = vec4(col * a, a);
}
`;
