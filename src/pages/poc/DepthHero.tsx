import { useEffect, useRef, useState } from "react";
import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";

const VERTEX = /* glsl */ `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  precision highp float;

  uniform sampler2D uImage;
  uniform sampler2D uDepth;
  uniform vec2 uPointer;
  uniform float uScroll;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  varying vec2 vUv;

  vec2 coverUv(vec2 uv, vec2 res, vec2 img) {
    float screenAspect = res.x / max(res.y, 1.0);
    float imageAspect = img.x / max(img.y, 1.0);
    vec2 scale = screenAspect > imageAspect
      ? vec2(1.0, imageAspect / screenAspect)
      : vec2(screenAspect / imageAspect, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = coverUv(vUv, uResolution, uImageResolution);
    float depth = texture2D(uDepth, clamp(uv, 0.001, 0.999)).r;

    // Near pixels (depth 1.0) move more than far pixels (depth 0.0).
    vec2 offset = uPointer * (depth - 0.5) * 0.032;
    offset.y -= uScroll * (depth - 0.5) * 0.04;

    vec2 sampleUv = clamp(uv + offset, vec2(0.001), vec2(0.999));
    vec3 color = texture2D(uImage, sampleUv).rgb;

    float d = distance(vUv, vec2(0.5));
    float vignette = 1.0 - smoothstep(0.25, 0.95, d);
    color *= mix(1.0, vignette, 0.22);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function buildDepthCanvas(image: HTMLImageElement) {
  const width = 320;
  const sourceWidth = image.naturalWidth || image.width || width;
  const sourceHeight = image.naturalHeight || image.height || width;
  const height = Math.max(1, Math.round((sourceHeight / sourceWidth) * width));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return canvas;

  context.drawImage(image, 0, 0, width, height);
  const source = context.getImageData(0, 0, width, height);
  const depth = context.createImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    const bottomBias = y / height;
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const luma = (
        0.2126 * source.data[index]
        + 0.7152 * source.data[index + 1]
        + 0.0722 * source.data[index + 2]
      ) / 255;
      const value = Math.round(Math.min(1, Math.max(0, (1 - luma) * 0.7 + bottomBias * 0.5)) * 255);
      depth.data[index] = value;
      depth.data[index + 1] = value;
      depth.data[index + 2] = value;
      depth.data[index + 3] = 255;
    }
  }

  context.putImageData(depth, 0, 0);

  const blurred = document.createElement("canvas");
  blurred.width = width;
  blurred.height = height;
  const blurredContext = blurred.getContext("2d");
  if (blurredContext) {
    blurredContext.filter = "blur(5px)";
    blurredContext.drawImage(canvas, 0, 0);
    blurredContext.filter = "none";
    return blurred;
  }

  return canvas;
}

type DepthHeroProps = {
  src: string;
  alt: string;
  disabled?: boolean;
};

/**
 * A single WebGL plane that uses a generated depth map for subtle 2.5D
 * parallax. Falls back to a normal <img> when motion is reduced or WebGL
 * is unavailable.
 */
export function DepthHero({ src, alt, disabled = false }: DepthHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (disabled) setReady(false);
  }, [disabled]);

  useEffect(() => {
    if (disabled) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    if (typeof WebGLRenderingContext === "undefined" && typeof WebGL2RenderingContext === "undefined") return;

    const probe = document.createElement("canvas");
    const webgl2 = probe.getContext("webgl2");
    const webgl1 = webgl2 ? null : probe.getContext("webgl");
    if (!webgl2 && !webgl1) {
      console.info("Depth hero: WebGL is not available in this browser.");
      return;
    }

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let geometry: Triangle | null = null;
    let mesh: Mesh | null = null;
    let observer: IntersectionObserver | null = null;
    let frame = 0;
    let running = true;
    let disposed = false;
    let removeListeners = () => {};

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollTarget = 0;
    let scrollCurrent = 0;

    async function init() {
      const image = new Image();
      image.decoding = "async";

      try {
        await new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () => reject(new Error("Failed to load hero image"));
          image.src = src;
          if (image.complete && image.naturalWidth > 0) resolve();
        });
      } catch (error) {
        console.warn("Depth hero image could not be loaded.", error);
        return;
      }
      if (disposed) return;

      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;

      try {
        renderer = new Renderer({
          canvas,
          width,
          height,
          webgl: 1,
          dpr: Math.min(window.devicePixelRatio || 1, 1.75),
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
        });
      } catch (error) {
        console.warn("Depth hero could not create a WebGL renderer.", error);
        return;
      }

      const gl = renderer.gl;
      gl.clearColor(0.043, 0.043, 0.047, 1);

      const imageTexture = new Texture(gl, {
        generateMipmaps: true,
        minFilter: gl.LINEAR_MIPMAP_LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
        anisotropy: Math.min(8, gl.renderer.parameters.maxAnisotropy || 1),
      });
      imageTexture.image = image;
      imageTexture.needsUpdate = true;

      const depthTexture = new Texture(gl, {
        image: buildDepthCanvas(image),
        generateMipmaps: true,
        minFilter: gl.LINEAR_MIPMAP_LINEAR,
        magFilter: gl.LINEAR,
        wrapS: gl.CLAMP_TO_EDGE,
        wrapT: gl.CLAMP_TO_EDGE,
      });

      geometry = new Triangle(gl);
      const nextProgram = new Program(gl, {
        vertex: VERTEX,
        fragment: FRAGMENT,
        uniforms: {
          uImage: { value: imageTexture },
          uDepth: { value: depthTexture },
          uPointer: { value: new Float32Array([0, 0]) },
          uScroll: { value: 0 },
          uResolution: { value: new Float32Array([width, height]) },
          uImageResolution: { value: new Float32Array([image.naturalWidth || width, image.naturalHeight || height]) },
        },
      });
      if (!nextProgram.uniformLocations) {
        console.warn(
          "Depth hero shader failed to link.",
          gl.getProgramInfoLog(nextProgram.program),
          gl.getShaderInfoLog(nextProgram.vertexShader),
          gl.getShaderInfoLog(nextProgram.fragmentShader),
        );
        geometry.remove();
        return;
      }
      program = nextProgram;
      mesh = new Mesh(gl, { geometry, program });

      const resize = () => {
        if (!renderer || !program) return;
        const nextWidth = container.clientWidth || window.innerWidth;
        const nextHeight = container.clientHeight || window.innerHeight;
        renderer.setSize(nextWidth, nextHeight);
        program.uniforms.uResolution.value[0] = nextWidth;
        program.uniforms.uResolution.value[1] = nextHeight;
      };

      const onPointerMove = (event: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        pointer.targetX = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1;
        pointer.targetY = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 - 1;
      };
      const onPointerLeave = () => {
        pointer.targetX = 0;
        pointer.targetY = 0;
      };
      const onScroll = () => {
        scrollTarget = Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 1)));
      };

      window.addEventListener("resize", resize);
      container.addEventListener("pointermove", onPointerMove, { passive: true });
      container.addEventListener("pointerleave", onPointerLeave);
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();

      if (typeof IntersectionObserver === "function") {
        observer = new IntersectionObserver(([entry]) => {
          running = entry?.isIntersecting ?? true;
          if (running) schedule();
        }, { threshold: 0.01 });
        observer.observe(container);
      }

      function schedule() {
        if (!frame && running && !disposed) {
          frame = window.requestAnimationFrame(render);
        }
      }

      function render() {
        frame = 0;
        if (disposed || !running || !renderer || !program || !mesh) return;
        pointer.x += (pointer.targetX - pointer.x) * 0.075;
        pointer.y += (pointer.targetY - pointer.y) * 0.075;
        scrollCurrent += (scrollTarget - scrollCurrent) * 0.08;
        program.uniforms.uPointer.value[0] = pointer.x;
        program.uniforms.uPointer.value[1] = pointer.y;
        program.uniforms.uScroll.value = scrollCurrent;
        renderer.render({ scene: mesh });
        schedule();
      }

      renderer.render({ scene: mesh });
      if (!disposed) setReady(true);

      removeListeners = () => {
        window.removeEventListener("resize", resize);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerleave", onPointerLeave);
        window.removeEventListener("scroll", onScroll);
      };

      schedule();
    }

    void init();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      removeListeners();
      geometry?.remove();
      program?.remove();
      renderer = null;
      program = null;
      geometry = null;
      mesh = null;
    };
  }, [disabled, src]);

  return (
    <div
      ref={containerRef}
      data-depth-ready={ready ? "true" : "false"}
      data-depth-disabled={disabled ? "true" : "false"}
      className="absolute inset-0 h-full w-full overflow-hidden"
    >
      <img
        src={src}
        alt={alt}
        style={{ opacity: ready ? 0 : 1 }}
        className="absolute inset-0 h-full w-full object-cover"
        decoding="async"
      />
      {!disabled ? (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ opacity: ready ? 1 : 0 }}
          className="absolute inset-0 block h-full w-full"
        />
      ) : null}
    </div>
  );
}
