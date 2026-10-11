"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import AuroraBackground from "./AuroraBackground";

// ============================================================================
// SIMPLEX 3D NOISE SHADER (Liquid wave gradient inspired by ShaderGradient)
// ============================================================================
const vertexShader = `
  uniform float uTime;
  uniform float uSpeed;
  uniform float uStrength;
  uniform float uFrequency;
  
  varying vec2 vUv;
  varying float vElevation;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    
    float t = uTime * uSpeed;
    float noise1 = snoise(vec3(pos.x * uFrequency, pos.y * uFrequency, t));
    float noise2 = snoise(vec3(pos.x * uFrequency * 2.2 + 8.0, pos.y * uFrequency * 2.2, t * 1.25)) * 0.45;
    
    float elevation = (noise1 + noise2) * uStrength;
    pos.z += elevation;
    vElevation = elevation;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec3 uColorBg;
  uniform float uDark;
  
  varying vec2 vUv;
  varying float vElevation;

  void main() {
    float mixVal1 = smoothstep(-0.8, 0.6, vElevation + (vUv.x * 0.5 - vUv.y * 0.3));
    float mixVal2 = smoothstep(-0.2, 0.9, vElevation * 1.0 + vUv.y * 0.5);

    vec3 color = mix(uColor1, uColor2, mixVal1);
    color = mix(color, uColor3, mixVal2 * 0.75);

    float crest = smoothstep(0.25, 0.9, vElevation);
    color += vec3(crest * 0.10);

    float distFromCenter = distance(vUv, vec2(0.5, 0.5));
    float alpha = smoothstep(1.3, 0.15, distFromCenter);

    if (uDark > 0.5) {
      color = mix(color, uColorBg, 0.2);
    }

    gl_FragColor = vec4(color, alpha * 0.92);
  }
`;

function checkWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

export default function ThreeGradientBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const [supportsWebGL, setSupportsWebGL] = useState(false);

  useEffect(() => {
    setMounted(true);

    // En pantallas móviles (< 768px), usar exclusivamente AuroraBackground (CSS nativo) para garantizar 60-120fps y cero lag
    if (window.innerWidth < 768) {
      setSupportsWebGL(false);
      return;
    }

    const hasGL = checkWebGL();
    setSupportsWebGL(hasGL);

    if (!hasGL || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let renderer: THREE.WebGLRenderer;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      setSupportsWebGL(false);
      return;
    }

    const isDark = document.documentElement.classList.contains("dark");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.PlaneGeometry(18, 18, 80, 80);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 0.35 },
        uStrength: { value: 1.15 },
        uFrequency: { value: 0.4 },
        uColor1: {
          value: new THREE.Color(isDark ? "#FF451A" : "#FF451A"),
        },
        uColor2: {
          value: new THREE.Color(isDark ? "#C4300E" : "#FF5E2C"),
        },
        uColor3: {
          value: new THREE.Color(isDark ? "#090D16" : "#FFFFFF"),
        },
        uColorBg: {
          value: new THREE.Color(isDark ? "#090D16" : "#FFFFFF"),
        },
        uDark: { value: isDark ? 1.0 : 0.0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.set(-Math.PI / 3.4, 0, Math.PI / 5);
    mesh.position.set(0.2, -0.4, -0.8);
    mesh.scale.set(1.8, 1.8, 1.8);
    scene.add(mesh);

    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      material.uniforms.uTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    const observer = new MutationObserver(() => {
      const darkNow = document.documentElement.classList.contains("dark");
      material.uniforms.uDark.value = darkNow ? 1.0 : 0.0;
      if (darkNow) {
        material.uniforms.uColor1.value.set("#FF4F2B");
        material.uniforms.uColor2.value.set("#B02E10");
        material.uniforms.uColor3.value.set("#090D16");
        material.uniforms.uColorBg.value.set("#090D16");
      } else {
        material.uniforms.uColor1.value.set("#FF4F2B");
        material.uniforms.uColor2.value.set("#FF6B4A");
        material.uniforms.uColor3.value.set("#FFFFFF");
        material.uniforms.uColorBg.value.set("#FFFFFF");
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <>
      {/* Fallback de gradiente Aurora siempre activo como base estable con tonos naranja vivos */}
      <AuroraBackground />

      {/* Capa WebGL de Three.js animada por encima con tono naranja claramente perceptible */}
      {mounted && supportsWebGL && (
        <div
          ref={containerRef}
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 w-full h-full mix-blend-normal transition-opacity duration-700 opacity-60 dark:opacity-45"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div className="absolute inset-0 backdrop-blur-[3px] pointer-events-none mix-blend-normal opacity-20 dark:opacity-20" />
        </div>
      )}
    </>
  );
}
