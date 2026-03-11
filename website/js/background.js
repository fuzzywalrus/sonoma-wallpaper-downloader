/**
 * Scene-based WebGL background with layered flow, luminous ribbons, and
 * scroll-reactive flow distortion to mimic a slow ambient screensaver.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  var gl = canvas.getContext('webgl', { alpha: false, antialias: false }) ||
           canvas.getContext('experimental-webgl', { alpha: false, antialias: false });
  if (!gl) {
    document.body.classList.add('webgl-fallback');
    return;
  }

  var vertexSource = [
    'attribute vec2 a_position;',
    'varying vec2 v_uv;',
    'void main() {',
    '  v_uv = a_position * 0.5 + 0.5;',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var fragmentSource = [
    'precision mediump float;',
    'varying vec2 v_uv;',
    'uniform float u_time;',
    'uniform vec2 u_resolution;',
    'uniform float u_sceneMix;',
    'uniform float u_motion;',
    'uniform float u_quality;',
    'uniform vec2 u_scrollOffset;',
    'uniform float u_scrollInfluence;',
    'uniform vec3 u_prev0;',
    'uniform vec3 u_prev1;',
    'uniform vec3 u_prev2;',
    'uniform vec3 u_prev3;',
    'uniform vec3 u_next0;',
    'uniform vec3 u_next1;',
    'uniform vec3 u_next2;',
    'uniform vec3 u_next3;',
    '',
    'float hash(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);',
    '}',
    '',
    'float noise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  float a = hash(i);',
    '  float b = hash(i + vec2(1.0, 0.0));',
    '  float c = hash(i + vec2(0.0, 1.0));',
    '  float d = hash(i + vec2(1.0, 1.0));',
    '  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);',
    '}',
    '',
    // Reduced from 5 to 4 octaves — 5th contributes < 4% of signal, not worth the cost
    'float fbm(vec2 p) {',
    '  float value = 0.0;',
    '  float amp = 0.5;',
    '  for (int i = 0; i < 4; i++) {',
    '    value += amp * noise(p);',
    '    p = p * 2.02 + vec2(12.3, 4.7);',
    '    amp *= 0.5;',
    '  }',
    '  return value;',
    '}',
    '',
    // Branchless palette — eliminates GPU warp divergence from if-branches
    'vec3 palette(float t, vec3 c0, vec3 c1, vec3 c2, vec3 c3) {',
    '  vec3 ab = mix(c0, c1, clamp(t * 3.030, 0.0, 1.0));',
    '  vec3 bc = mix(c1, c2, clamp((t - 0.33) * 3.030, 0.0, 1.0));',
    '  vec3 cd = mix(c2, c3, clamp((t - 0.66) * 2.941, 0.0, 1.0));',
    '  return mix(mix(ab, bc, step(0.33, t)), cd, step(0.66, t));',
    '}',
    '',
    'float ribbonMask(vec2 p, float center, float width) {',
    '  float d = abs(p.y - center);',
    '  return 1.0 - smoothstep(width * 0.35, width, d);',
    '}',
    '',
    'void main() {',
    '  vec2 uv = v_uv;',
    '  vec2 p = uv * 2.0 - 1.0;',
    '  float aspect = max(u_resolution.x / max(u_resolution.y, 1.0), 0.0001);',
    '  p.x *= aspect;',
    '  p += vec2(u_scrollOffset.x * aspect, u_scrollOffset.y);',
    '  p.x += sin((p.y + u_scrollOffset.y) * 2.2 + u_time * 0.22) * u_scrollInfluence * 0.12;',
    '',
    '  float t = u_time;',
    '  float motion = max(u_motion, 0.01);',
    '  vec2 drift = vec2(sin(t * 0.07), cos(t * 0.05)) * (0.08 + 0.04 * u_quality) * motion;',
    '  p += drift;',
    '',
    '  vec2 warp = vec2(',
    '    fbm(p * 0.75 + u_scrollOffset * 1.6 + vec2(t * 0.03, -t * 0.04)),',
    '    fbm(p * 0.90 + u_scrollOffset * 1.2 + vec2(-t * 0.035, t * 0.028))',
    '  );',
    '  p += (warp - 0.5) * (0.65 * motion + u_scrollInfluence * 0.35);',
    '',
    '  vec3 c0 = mix(u_prev0, u_next0, u_sceneMix);',
    '  vec3 c1 = mix(u_prev1, u_next1, u_sceneMix);',
    '  vec3 c2 = mix(u_prev2, u_next2, u_sceneMix);',
    '  vec3 c3 = mix(u_prev3, u_next3, u_sceneMix);',
    '',
    '  float gradientT = clamp(',
    '    0.5 + p.y * 0.35 + u_scrollOffset.y * 0.16 + (fbm(p * 0.9 + vec2(0.0, t * 0.015)) - 0.5) * 0.24,',
    '    0.0,',
    '    1.0',
    '  );',
    '  vec3 base = palette(gradientT, c0, c1, c2, c3);',
    '',
    '  float flow = fbm(p * 1.4 + vec2(t * 0.04, -t * 0.03));',
    '  base += vec3(0.06, 0.07, 0.06) * (flow - 0.5);',
    '',
    '  float r1Center = sin(p.x * 1.5 + t * 0.11) * 0.25 + (fbm(p * 1.6 + u_scrollOffset + vec2(t * 0.06, 0.0)) - 0.5) * 0.18 - 0.18 + u_scrollOffset.y * 0.25;',
    '  float r2Center = sin(p.x * 0.9 - t * 0.09) * 0.22 + (fbm(p * 1.2 + u_scrollOffset * 1.3 + vec2(-t * 0.05, 0.0)) - 0.5) * 0.16 + 0.12 - u_scrollOffset.y * 0.18;',
    '  float r3Center = sin((p.x + p.y * 0.6) * 1.1 + t * 0.13) * 0.18 - 0.38 + u_scrollOffset.y * 0.10;',
    '',
    '  float r1 = ribbonMask(p, r1Center, 0.22);',
    '  float r2 = ribbonMask(p, r2Center, 0.16);',
    '  float r3 = ribbonMask(p, r3Center, 0.14);',
    '',
    '  vec3 highlight = vec3(0.96, 0.95, 0.90);',
    '  vec3 ribbonColor1 = mix(c1, highlight, 0.45);',
    '  vec3 ribbonColor2 = mix(c2, highlight, 0.30);',
    '  vec3 ribbonColor3 = mix(c0, c2, 0.55);',
    '',
    '  base = mix(base, ribbonColor1, r1 * 0.58);',
    '  base = mix(base, ribbonColor2, r2 * 0.44);',
    '  base = mix(base, ribbonColor3, r3 * 0.30);',
    '',
    // x*x instead of pow(x, 2.0) — many GLSL compilers (especially Firefox) don't optimize pow for integer exponents
    '  base += ribbonColor1 * (r1 * r1) * 0.25;',
    '  base += ribbonColor2 * (r2 * r2) * 0.15;',
    '  base += (ribbonColor1 - ribbonColor3) * u_scrollInfluence * 0.06;',
    '',
    '  float hazeSample = max(fbm(p * 2.4 + vec2(t * 0.05, t * 0.02)) - 0.55, 0.0);',
    '  base += mix(c0, c2, 0.5) * (hazeSample * hazeSample) * (0.08 + 0.14 * u_quality);',
    '',
    '  float starField = hash(floor((p + drift * 2.0) * vec2(120.0, 80.0)));',
    '  float spark = smoothstep(0.992, 1.0, starField);',
    '  float twinkle = 0.5 + 0.5 * sin(t * 1.2 + starField * 30.0);',
    '  base += vec3(0.95, 0.96, 1.0) * spark * twinkle * (0.07 + 0.04 * u_scrollInfluence) * u_quality;',
    '',
    '  float vignette = 1.0 - smoothstep(0.55, 1.35, length(p * vec2(0.95, 1.15)));',
    '  base *= 0.82 + 0.18 * vignette;',
    '',
    '  float grain = hash(uv * u_resolution + vec2(fract(t * 60.0), fract(t * 37.0))) - 0.5;',
    '  base += grain * (0.018 + 0.012 * u_quality);',
    '',
    '  gl_FragColor = vec4(clamp(base, 0.0, 1.0), 1.0);',
    '}'
  ].join('\n');

  function nowMs() {
    return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  }

  function compileShader(glContext, source, type) {
    var shader = glContext.createShader(type);
    glContext.shaderSource(shader, source);
    glContext.compileShader(shader);
    if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
      glContext.deleteShader(shader);
      return null;
    }
    return shader;
  }

  function linkProgram(glContext, vs, fs) {
    var program = glContext.createProgram();
    glContext.attachShader(program, vs);
    glContext.attachShader(program, fs);
    glContext.linkProgram(program);
    if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
      glContext.deleteProgram(program);
      return null;
    }
    return program;
  }

  var vertexShader = compileShader(gl, vertexSource, gl.VERTEX_SHADER);
  var fragmentShader = compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER);
  if (!vertexShader || !fragmentShader) {
    document.body.classList.add('webgl-fallback');
    return;
  }

  var program = linkProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    document.body.classList.add('webgl-fallback');
    return;
  }
  gl.useProgram(program);

  var locations = {
    position: gl.getAttribLocation(program, 'a_position'),
    time: gl.getUniformLocation(program, 'u_time'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    sceneMix: gl.getUniformLocation(program, 'u_sceneMix'),
    motion: gl.getUniformLocation(program, 'u_motion'),
    quality: gl.getUniformLocation(program, 'u_quality'),
    scrollOffset: gl.getUniformLocation(program, 'u_scrollOffset'),
    scrollInfluence: gl.getUniformLocation(program, 'u_scrollInfluence'),
    prev: [
      gl.getUniformLocation(program, 'u_prev0'),
      gl.getUniformLocation(program, 'u_prev1'),
      gl.getUniformLocation(program, 'u_prev2'),
      gl.getUniformLocation(program, 'u_prev3')
    ],
    next: [
      gl.getUniformLocation(program, 'u_next0'),
      gl.getUniformLocation(program, 'u_next1'),
      gl.getUniformLocation(program, 'u_next2'),
      gl.getUniformLocation(program, 'u_next3')
    ]
  };

  var hasColorUniforms = true;
  for (var u = 0; u < 4; u++) {
    hasColorUniforms = hasColorUniforms && !!locations.prev[u] && !!locations.next[u];
  }

  if (locations.position < 0 || !locations.time || !locations.resolution || !locations.sceneMix || !locations.motion || !locations.quality || !locations.scrollOffset || !locations.scrollInfluence || !hasColorUniforms) {
    document.body.classList.add('webgl-fallback');
    return;
  }

  var presets = [
    {
      colors: [[0.14, 0.33, 0.37], [0.30, 0.49, 0.45], [0.63, 0.72, 0.50], [0.23, 0.32, 0.28]],
      motion: 0.90
    },
    {
      colors: [[0.05, 0.16, 0.30], [0.11, 0.28, 0.49], [0.36, 0.57, 0.67], [0.56, 0.73, 0.68]],
      motion: 1.05
    },
    {
      colors: [[0.19, 0.12, 0.19], [0.37, 0.20, 0.28], [0.63, 0.42, 0.34], [0.78, 0.63, 0.46]],
      motion: 0.82
    },
    {
      colors: [[0.04, 0.14, 0.16], [0.07, 0.29, 0.27], [0.38, 0.55, 0.41], [0.66, 0.77, 0.55]],
      motion: 0.76
    },
    {
      colors: [[0.10, 0.11, 0.18], [0.24, 0.20, 0.35], [0.43, 0.33, 0.49], [0.70, 0.61, 0.72]],
      motion: 0.68
    },
    {
      colors: [[0.09, 0.15, 0.23], [0.21, 0.37, 0.40], [0.44, 0.56, 0.47], [0.74, 0.78, 0.60]],
      motion: 0.98
    }
  ];

  var qualityTier = getQualityTier();
  var qualityScalar = getQualityScalar();
  var reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduceMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

  var scrollState = {
    target: 0,
    current: 0,
    previous: 0,
    maxScroll: 1
  };
  var basePreset = presets[Math.floor(Math.random() * presets.length)];

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
  ]), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(locations.position);
  gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);

  var canvasWidth = 0;
  var canvasHeight = 0;
  var startTime = nowMs();
  var pausedMs = 0;
  var hiddenAt = 0;
  var rafId = 0;

  function getQualityTier() {
    var cores = navigator.hardwareConcurrency || 4;
    var shortEdge = Math.min(window.innerWidth || 0, window.innerHeight || 0);
    if (cores <= 4 || shortEdge < 600) return 'low';
    if (cores <= 8 || shortEdge < 900) return 'medium';
    return 'high';
  }

  function getQualityScalar() {
    if (qualityTier === 'low') return 0.5;
    if (qualityTier === 'medium') return 0.75;
    return 1.0;
  }

  function getDevicePixelRatioCap() {
    if (reduceMotion) return 1.25;
    if (qualityTier === 'low') return 1.0;
    if (qualityTier === 'medium') return 1.5;
    return 2.0;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function getScrollTop() {
    if (typeof window.scrollY === 'number') return Math.max(window.scrollY, 0);
    var doc = document.documentElement;
    var body = document.body;
    return Math.max((doc && doc.scrollTop) || (body && body.scrollTop) || 0, 0);
  }

  function getScrollRatio() {
    return clamp(getScrollTop() / scrollState.maxScroll, 0, 1);
  }

  function updateScrollMetrics() {
    var doc = document.documentElement;
    var body = document.body;
    var scrollHeight = Math.max((doc && doc.scrollHeight) || 0, (body && body.scrollHeight) || 0);
    scrollState.maxScroll = Math.max(scrollHeight - window.innerHeight, 1);
    scrollState.target = getScrollRatio();
  }

  function handleScroll() {
    scrollState.target = getScrollRatio();
  }

  function setPaletteUniforms(palette, targets) {
    for (var i = 0; i < 4; i++) {
      var c = palette.colors[i];
      gl.uniform3f(targets[i], c[0], c[1], c[2]);
    }
  }

  // resize() is now event-driven only — calling it every frame caused layout
  // thrashing (60 DOM reads/sec) that was especially severe in Firefox.
  function resize() {
    qualityTier = getQualityTier();
    qualityScalar = getQualityScalar();
    var dpr = Math.min(window.devicePixelRatio || 1, getDevicePixelRatioCap());
    var w = Math.floor(window.innerWidth * dpr);
    var h = Math.floor(window.innerHeight * dpr);
    if (w !== canvasWidth || h !== canvasHeight) {
      canvasWidth = w;
      canvasHeight = h;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      gl.viewport(0, 0, w, h);
    }
    updateScrollMetrics();
  }

  function draw(frameNow) {
    var activeNow = frameNow - pausedMs;
    var elapsed = Math.max(activeNow - startTime, 0);
    var smoothing = reduceMotion ? 0.05 : 0.10;
    scrollState.current += (scrollState.target - scrollState.current) * smoothing;
    if (Math.abs(scrollState.current - scrollState.target) < 0.0005) {
      scrollState.current = scrollState.target;
    }

    var scrollEnergy = Math.abs(scrollState.target - scrollState.current);
    var scrollVelocity = Math.abs(scrollState.current - scrollState.previous);
    var scrollProgress = scrollState.current * 2 - 1;
    var flowX = scrollProgress * 0.22;
    var flowY = scrollProgress * -0.28;
    var flowInfluence = Math.min(Math.abs(scrollProgress) * 0.75 + (scrollEnergy + scrollVelocity) * 8.0, 1.0);
    if (reduceMotion) {
      flowX *= 0.45;
      flowY *= 0.45;
      flowInfluence *= 0.45;
    }

    var baseMotion = basePreset.motion;
    var motionBoost = reduceMotion ? 0 : Math.min(scrollEnergy * 6, 0.25);
    var motion = Math.min(baseMotion * (reduceMotion ? 0.35 : 1.0) + motionBoost, 1.5);

    setPaletteUniforms(basePreset, locations.prev);
    setPaletteUniforms(basePreset, locations.next);
    gl.uniform1f(locations.time, elapsed * 0.001);
    gl.uniform2f(locations.resolution, canvasWidth, canvasHeight);
    gl.uniform1f(locations.sceneMix, 0);
    gl.uniform1f(locations.motion, motion);
    gl.uniform1f(locations.quality, qualityScalar);
    gl.uniform2f(locations.scrollOffset, flowX, flowY);
    gl.uniform1f(locations.scrollInfluence, flowInfluence);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    scrollState.previous = scrollState.current;
  }

  function loop(frameNow) {
    draw(typeof frameNow === 'number' ? frameNow : nowMs());
    rafId = requestAnimationFrame(loop);
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      hiddenAt = nowMs();
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
      return;
    }
    if (hiddenAt) {
      pausedMs += nowMs() - hiddenAt;
      hiddenAt = 0;
    }
    if (!rafId) {
      rafId = requestAnimationFrame(loop);
    }
  }

  function handleReducedMotionChange() {
    reduceMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;
    resize();
  }

  resize();
  handleScroll();
  scrollState.current = scrollState.target;
  rafId = requestAnimationFrame(loop);

  window.addEventListener('resize', resize);
  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('visibilitychange', handleVisibilityChange);

  if (reducedMotionQuery) {
    if (typeof reducedMotionQuery.addEventListener === 'function') {
      reducedMotionQuery.addEventListener('change', handleReducedMotionChange);
    } else if (typeof reducedMotionQuery.addListener === 'function') {
      reducedMotionQuery.addListener(handleReducedMotionChange);
    }
  }
})();
