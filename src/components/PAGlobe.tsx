import { useEffect, useRef, useState, useMemo } from "react";
import * as THREE from "three";
import { RotateCw, ZoomIn, ZoomOut, Sparkles, Compass, Eye, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PAGlobeTheme {
  id: string;
  name: string;
  oceanColor: string;
  landColor: string;
  gridColor: string;
  glowColor: string;
  pinColor: string;
  pinTextBg: string;
  ambientLight: number;
  dirLight: number;
  previewClass: string;
}

export const GLOBE_THEMES: PAGlobeTheme[] = [
  {
    id: "neon-synth",
    name: "Neon Synth",
    oceanColor: "#0d0221",
    landColor: "#ff2d95",
    gridColor: "#00e5ff",
    glowColor: "#ff2d95",
    pinColor: "#00f0ff",
    pinTextBg: "rgba(13, 2, 33, 0.85)",
    ambientLight: 0xffffff,
    dirLight: 0xff007f,
    previewClass: "from-[#ff2d95] via-[#7a5cff] to-[#00e5ff]",
  },
  {
    id: "realistic-earth",
    name: "Realistic Earth",
    oceanColor: "#0b1d3a",
    landColor: "#2d6a4f",
    gridColor: "#52b788",
    glowColor: "#48cae4",
    pinColor: "#ffd166",
    pinTextBg: "rgba(11, 29, 58, 0.85)",
    ambientLight: 0xffffff,
    dirLight: 0x90e0ef,
    previewClass: "from-[#0b1d3a] via-[#2d6a4f] to-[#52b788]",
  },
  {
    id: "emerald-matrix",
    name: "Emerald Matrix",
    oceanColor: "#031409",
    landColor: "#00ff66",
    gridColor: "#39ff14",
    glowColor: "#00ff66",
    pinColor: "#39ff14",
    pinTextBg: "rgba(3, 20, 9, 0.85)",
    ambientLight: 0x00ff66,
    dirLight: 0x39ff14,
    previewClass: "from-[#031409] via-[#00ff66] to-[#39ff14]",
  },
  {
    id: "cyber-ice",
    name: "Cyber Ice",
    oceanColor: "#030f26",
    landColor: "#00d2ff",
    gridColor: "#80e5ff",
    glowColor: "#00d2ff",
    pinColor: "#ffffff",
    pinTextBg: "rgba(3, 15, 38, 0.85)",
    ambientLight: 0xffffff,
    dirLight: 0x00d2ff,
    previewClass: "from-[#030f26] via-[#00d2ff] to-[#e0f7fa]",
  },
  {
    id: "solar-gold",
    name: "Solar Gold",
    oceanColor: "#1a0f00",
    landColor: "#ffaa00",
    gridColor: "#ffd700",
    glowColor: "#ff9100",
    pinColor: "#ffe600",
    pinTextBg: "rgba(26, 15, 0, 0.85)",
    ambientLight: 0xffe8b3,
    dirLight: 0xffaa00,
    previewClass: "from-[#1a0f00] via-[#ffaa00] to-[#ffd700]",
  },
  {
    id: "vapor-sunset",
    name: "Vapor Sunset",
    oceanColor: "#120024",
    landColor: "#ff5e7e",
    gridColor: "#ff99c8",
    glowColor: "#a06cd5",
    pinColor: "#fcf6bd",
    pinTextBg: "rgba(18, 0, 36, 0.85)",
    ambientLight: 0xffe4e1,
    dirLight: 0xff5e7e,
    previewClass: "from-[#ff5e7e] via-[#a06cd5] to-[#120024]",
  },
  {
    id: "midnight-stealth",
    name: "Midnight Stealth",
    oceanColor: "#08080a",
    landColor: "#d1d5db",
    gridColor: "#6b7280",
    glowColor: "#9ca3af",
    pinColor: "#ffffff",
    pinTextBg: "rgba(8, 8, 10, 0.85)",
    ambientLight: 0xffffff,
    dirLight: 0xd1d5db,
    previewClass: "from-[#08080a] via-[#4b5563] to-[#d1d5db]",
  },
];

// Simplified continent polygon paths in longitude / latitude space [-180..180, -90..90]
const CONTINENT_POLYGONS: [number, number][][] = [
  // North America
  [
    [-165, 65], [-140, 70], [-100, 75], [-60, 80], [-60, 60], [-80, 50],
    [-70, 42], [-75, 35], [-80, 25], [-90, 20], [-100, 20], [-105, 23],
    [-115, 30], [-125, 40], [-125, 50], [-135, 58], [-165, 65]
  ],
  // South America
  [
    [-80, 10], [-60, 12], [-35, -5], [-38, -15], [-50, -30], [-65, -55],
    [-75, -50], [-72, -35], [-77, -15], [-80, 0], [-80, 10]
  ],
  // Europe
  [
    [-10, 36], [0, 44], [5, 48], [10, 55], [25, 70], [35, 65],
    [30, 45], [20, 40], [0, 38], [-10, 36]
  ],
  // Africa
  [
    [-15, 35], [10, 37], [35, 32], [42, 12], [50, 10], [40, -5],
    [30, -30], [20, -35], [15, -30], [10, 0], [-15, 12], [-15, 35]
  ],
  // Asia
  [
    [35, 65], [60, 75], [100, 78], [140, 72], [170, 65], [140, 50],
    [130, 35], [120, 22], [105, 10], [90, 22], [80, 10], [70, 25],
    [50, 30], [35, 40], [35, 65]
  ],
  // Australia
  [
    [115, -22], [130, -12], [145, -15], [150, -25], [140, -38],
    [115, -35], [115, -22]
  ],
  // Japan / Islands
  [
    [130, 32], [135, 35], [142, 44], [140, 38], [130, 32]
  ],
  // UK
  [
    [-5, 50], [0, 52], [0, 58], [-5, 58], [-5, 50]
  ],
  // Greenland
  [
    [-50, 60], [-20, 70], [-25, 82], [-55, 80], [-50, 60]
  ],
  // Antarctica
  [
    [-180, -70], [180, -70], [180, -90], [-180, -90], [-180, -70]
  ]
];

// Helper: draw procedural world texture with high detail
function createEarthTexture(theme: PAGlobeTheme): THREE.CanvasTexture {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 1. Ocean background
  ctx.fillStyle = theme.oceanColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle ocean grid / scanlines
  ctx.strokeStyle = theme.gridColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.15;

  // Latitudes
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  // Longitudes
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = ((lon + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 3. Draw Continents
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = theme.landColor;
  ctx.strokeStyle = theme.gridColor;
  ctx.lineWidth = 3;

  CONTINENT_POLYGONS.forEach(poly => {
    ctx.beginPath();
    poly.forEach(([lon, lat], idx) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 4. City lights / Data nodes on landmasses
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = theme.gridColor;
  const nodeSeeds = [
    [-74, 40], [-118, 34], [-0.1, 51.5], [2.3, 48.8], [139.7, 35.6],
    [121.4, 31.2], [114.1, 22.3], [77.2, 28.6], [151.2, -33.8], [-43.1, -22.9],
    [37.6, 55.7], [126.9, 37.5], [103.8, 1.3], [-3.7, 40.4], [12.5, 41.9],
    [-79.3, 43.6], [100.5, 13.7], [31.2, 30.0], [28.0, -26.2], [-99.1, 19.4]
  ];

  nodeSeeds.forEach(([lon, lat]) => {
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pulse ring
    ctx.strokeStyle = theme.glowColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.stroke();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  return texture;
}

// Convert Lat/Lon to 3D Cartesian coordinates on sphere radius R
function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Standard hub coordinates for popular terms or deterministic hash for dynamic terms
function getTermCoordinates(term: string): { lat: number; lon: number } {
  const lower = term.toLowerCase().trim();
  if (lower.includes("anime") || lower.includes("manga") || lower.includes("vtuber")) {
    return { lat: 35.6762, lon: 139.6503 }; // Tokyo
  }
  if (lower.includes("game") || lower.includes("gaming") || lower.includes("esport") || lower.includes("speedrun")) {
    return { lat: 37.7749, lon: -122.4194 }; // San Francisco / Silicon Valley
  }
  if (lower.includes("poli") || lower.includes("news") || lower.includes("break")) {
    return { lat: 38.9072, lon: -77.0369 }; // Washington D.C.
  }
  if (lower.includes("music") || lower.includes("vibe") || lower.includes("art")) {
    return { lat: 51.5074, lon: -0.1278 }; // London
  }
  if (lower.includes("retro") || lower.includes("tech") || lower.includes("cyber")) {
    return { lat: 37.5665, lon: 126.9780 }; // Seoul
  }
  if (lower.includes("lore") || lower.includes("meme") || lower.includes("cosplay")) {
    return { lat: 48.8566, lon: 2.3522 }; // Paris
  }
  if (lower.includes("crypto") || lower.includes("ai")) {
    return { lat: 47.3769, lon: 8.5417 }; // Zurich
  }

  // Deterministic distributed hash for any other custom term
  let hash = 0;
  for (let i = 0; i < term.length; i++) {
    hash = (hash << 5) - hash + term.charCodeAt(i);
    hash |= 0;
  }
  const lat = ((Math.abs(hash) % 120) - 60); // -60 to +60
  const lon = ((Math.abs(hash >> 3) % 360) - 180); // -180 to +180
  return { lat, lon };
}

interface PAGlobeProps {
  terms: string[];
  activeTerm: string | null;
  onSelectTerm: (term: string | null) => void;
}

export default function PAGlobe({ terms, activeTerm, onSelectTerm }: PAGlobeProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [currentThemeId, setCurrentThemeId] = useState<string>("neon-synth");
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [termCoords, setTermCoords] = useState<{ name: string; lat: number; lon: number; screenX: number; screenY: number; visible: boolean }[]>([]);
  const [showThemePicker, setShowThemePicker] = useState(false);

  // Active theme object
  const activeTheme = useMemo(() => {
    return GLOBE_THEMES.find(t => t.id === currentThemeId) || GLOBE_THEMES[0];
  }, [currentThemeId]);

  // Combined terms: Ensure user terms + default PoliAniGames terms exist
  const effectiveTerms = useMemo(() => {
    const list = [...terms];
    const defaults = ["ANIME", "GAMING", "POLITICS", "MEMES", "ESPORTS", "RETRO", "LORE", "TECH"];
    defaults.forEach(d => {
      if (!list.some(t => t.toLowerCase() === d.toLowerCase())) {
        list.push(d);
      }
    });
    return list;
  }, [terms]);

  // Three.js instances refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const globeMeshRef = useRef<THREE.Mesh | null>(null);
  const atmosphereRef = useRef<THREE.Mesh | null>(null);
  const pinsGroupRef = useRef<THREE.Group | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambLightRef = useRef<THREE.AmbientLight | null>(null);

  // Interaction tracking refs
  const isDraggingRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.2, y: 0 });
  const zoomLevelRef = useRef(4.3);
  const touchDistanceRef = useRef<number | null>(null);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 360;
    const height = container.clientHeight || 340;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = zoomLevelRef.current;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Lights
    const ambLight = new THREE.AmbientLight(activeTheme.ambientLight, 1.2);
    scene.add(ambLight);
    ambLightRef.current = ambLight;

    const dirLight = new THREE.DirectionalLight(activeTheme.dirLight, 2.0);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    const backLight = new THREE.DirectionalLight(0xffffff, 0.6);
    backLight.position.set(-5, -2, -5);
    scene.add(backLight);

    // Main Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // 1. Earth Sphere
    const globeRadius = 1.7;
    const globeGeometry = new THREE.SphereGeometry(globeRadius, 64, 64);
    const globeTexture = createEarthTexture(activeTheme);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: globeTexture,
      roughness: 0.6,
      metalness: 0.2,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);
    globeMeshRef.current = globeMesh;

    // 2. Atmosphere / Glow Halo
    const atmosGeometry = new THREE.SphereGeometry(globeRadius * 1.15, 64, 64);
    const atmosMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        uniform vec3 uColor;
        void main() {
          float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
          gl_FragColor = vec4(uColor, 1.0) * intensity * 0.9;
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(activeTheme.glowColor) }
      },
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosGeometry, atmosMaterial);
    scene.add(atmosphereMesh);
    atmosphereRef.current = atmosphereMesh;

    // 3. Orbital Celestial Rings
    const ringsGroup = new THREE.Group();
    const ringGeo = new THREE.RingGeometry(globeRadius * 1.35, globeRadius * 1.37, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(activeTheme.gridColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2.3;
    ringsGroup.add(ringMesh);

    const ringGeo2 = new THREE.RingGeometry(globeRadius * 1.55, globeRadius * 1.56, 64);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: new THREE.Color(activeTheme.glowColor),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.2,
    });
    const ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    ringMesh2.rotation.x = Math.PI / 1.7;
    ringsGroup.add(ringMesh2);

    scene.add(ringsGroup);
    ringsGroupRef.current = ringsGroup;

    // 4. Pins Group attached to globe
    const pinsGroup = new THREE.Group();
    globeGroup.add(pinsGroup);
    pinsGroupRef.current = pinsGroup;

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Auto-rotation when not dragging
      if (autoRotateRef.current && !isDraggingRef.current) {
        targetRotationRef.current.y += 0.003;
      }

      // Smooth damping interpolation
      if (globeGroupRef.current) {
        globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.1;
        globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.1;

        // Clamp pitch so globe doesn't flip upside down
        targetRotationRef.current.x = Math.max(-1.2, Math.min(1.2, targetRotationRef.current.x));
      }

      // Rotate celestial rings slowly opposite direction
      if (ringsGroupRef.current) {
        ringsGroupRef.current.rotation.z += 0.001;
      }

      // Smooth zoom interpolation
      if (cameraRef.current) {
        cameraRef.current.position.z += (zoomLevelRef.current - cameraRef.current.position.z) * 0.1;
      }

      // Calculate 2D screen positions of term markers for interactive overlay
      if (cameraRef.current && globeGroupRef.current && container) {
        const cWidth = container.clientWidth;
        const cHeight = container.clientHeight;
        const pinUpdates: typeof termCoords = [];

        effectiveTerms.forEach((term) => {
          const { lat, lon } = getTermCoordinates(term);
          const v3 = latLonToVector3(lat, lon, globeRadius + 0.05);

          // Apply globe transformation
          v3.applyEuler(globeGroupRef.current!.rotation);

          // Check if point is facing the camera (z > 0 in view space)
          const isFacingCamera = v3.z > -0.2;

          // Project to 2D screen space
          const projected = v3.clone().project(cameraRef.current!);
          const screenX = (projected.x * 0.5 + 0.5) * cWidth;
          const screenY = (-(projected.y * 0.5) + 0.5) * cHeight;

          pinUpdates.push({
            name: term,
            lat,
            lon,
            screenX,
            screenY,
            visible: isFacingCamera && screenX >= 0 && screenX <= cWidth && screenY >= 0 && screenY <= cHeight,
          });
        });

        setTermCoords(pinUpdates);
      }

      // Animate pin beacons in 3D
      if (pinsGroupRef.current) {
        pinsGroupRef.current.children.forEach((child) => {
          if (child.name === "beaconPulse") {
            const scale = 1 + (Math.sin(elapsedTime * 4 + (child.userData.seed || 0)) * 0.3);
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || !entries[0]) return;
      const { width: newW, height: newH } = entries[0].contentRect;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeGeometry.dispose();
      globeMaterial.dispose();
      globeTexture.dispose();
    };
  }, []); // Run once on mount

  // Update theme in real-time when currentThemeId changes
  useEffect(() => {
    if (!globeMeshRef.current || !atmosphereRef.current) return;

    // Generate new procedural texture
    const newTexture = createEarthTexture(activeTheme);
    const globeMat = globeMeshRef.current.material as THREE.MeshStandardMaterial;
    if (globeMat.map) globeMat.map.dispose();
    globeMat.map = newTexture;
    globeMat.needsUpdate = true;

    // Update lights
    if (dirLightRef.current) {
      dirLightRef.current.color.set(activeTheme.dirLight);
    }
    if (ambLightRef.current) {
      ambLightRef.current.color.set(activeTheme.ambientLight);
    }

    // Update atmosphere uniform
    const atmosMat = atmosphereRef.current.material as THREE.ShaderMaterial;
    if (atmosMat.uniforms?.uColor) {
      atmosMat.uniforms.uColor.value.set(activeTheme.glowColor);
    }

    // Update rings color
    if (ringsGroupRef.current) {
      ringsGroupRef.current.children.forEach((r, idx) => {
        const mat = (r as THREE.Mesh).material as THREE.MeshBasicMaterial;
        mat.color.set(idx === 0 ? activeTheme.gridColor : activeTheme.glowColor);
      });
    }
  }, [activeTheme]);

  // Update 3D Pins when effectiveTerms or activeTheme changes
  useEffect(() => {
    if (!pinsGroupRef.current) return;
    const pinsGroup = pinsGroupRef.current;

    // Clear previous pins
    while (pinsGroup.children.length > 0) {
      const child = pinsGroup.children[0];
      pinsGroup.remove(child);
      if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
    }

    const globeRadius = 1.7;

    effectiveTerms.forEach((term, idx) => {
      const { lat, lon } = getTermCoordinates(term);
      const pos = latLonToVector3(lat, lon, globeRadius);

      // Pin base beacon
      const pinGeo = new THREE.SphereGeometry(0.04, 16, 16);
      const isSelected = activeTerm?.toLowerCase() === term.toLowerCase();
      const pinMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(isSelected ? "#ffffff" : activeTheme.pinColor),
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinsGroup.add(pinMesh);

      // Pulsing Ring Beacon
      const pulseGeo = new THREE.RingGeometry(0.05, 0.08, 16);
      const pulseMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(activeTheme.glowColor),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8,
      });
      const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
      pulseMesh.name = "beaconPulse";
      pulseMesh.userData = { seed: idx };
      pulseMesh.position.copy(pos);
      pulseMesh.lookAt(0, 0, 0); // Orient flat on sphere surface
      pinsGroup.add(pulseMesh);
    });
  }, [effectiveTerms, activeTerm, activeTheme]);

  // Pointer & Touch Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - previousPointerPositionRef.current.x;
    const deltaY = e.clientY - previousPointerPositionRef.current.y;

    rotationVelocityRef.current = { x: deltaY * 0.005, y: deltaX * 0.005 };
    targetRotationRef.current.y += deltaX * 0.006;
    targetRotationRef.current.x += deltaY * 0.006;

    previousPointerPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomDelta = e.deltaY * 0.0025;
    zoomLevelRef.current = Math.max(2.8, Math.min(6.5, zoomLevelRef.current + zoomDelta));
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
      if (touchDistanceRef.current !== null) {
        const delta = (touchDistanceRef.current - dist) * 0.01;
        zoomLevelRef.current = Math.max(2.8, Math.min(6.5, zoomLevelRef.current + delta));
      }
      touchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = () => {
    touchDistanceRef.current = null;
  };

  // Focus globe on a specific term
  const focusOnTerm = (term: string) => {
    const { lat, lon } = getTermCoordinates(term);
    // Convert lat/lon to target globe rotation
    const targetY = -((lon + 90) * (Math.PI / 180));
    const targetX = (lat) * (Math.PI / 180) * 0.8;
    targetRotationRef.current = { x: targetX, y: targetY };
    zoomLevelRef.current = 3.6; // zoom in on focus
    onSelectTerm(activeTerm === term ? null : term);
  };

  const zoomIn = () => {
    zoomLevelRef.current = Math.max(2.8, zoomLevelRef.current - 0.6);
  };

  const zoomOut = () => {
    zoomLevelRef.current = Math.min(6.5, zoomLevelRef.current + 0.6);
  };

  const resetView = () => {
    targetRotationRef.current = { x: 0.2, y: 0 };
    zoomLevelRef.current = 4.3;
  };

  return (
    <div className="pag-panel rounded-sm p-3 relative overflow-hidden select-none border border-white/20">
      {/* Header & Quick Info */}
      <div className="flex items-center justify-between gap-2 pb-2 mb-1 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <h2 className="text-sm font-extrabold tracking-wider text-rainbow-neon uppercase">PAGlobe</h2>
          <span className="text-[10px] text-white/50 font-mono hidden sm:inline">[3D_EARTH // INTERACTIVE]</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Theme Selector Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="h-7 px-2 text-[11px] border border-white/20 text-rainbow-neon hover:bg-white/10"
            title="Select Globe Color Theme"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            <span className="max-w-[85px] truncate">{activeTheme.name}</span>
          </Button>

          {/* Auto-Rotation Toggle */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`h-7 px-2 text-[11px] border ${autoRotate ? "border-cyan-400/80 text-cyan-300 bg-cyan-950/30" : "border-white/20 text-white/60"}`}
            title={autoRotate ? "Pause Auto-Rotation" : "Resume Auto-Rotation"}
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1 ${autoRotate ? "animate-spin" : ""}`} style={{ animationDuration: "8s" }} />
            {autoRotate ? "ROTATE:ON" : "ROTATE:OFF"}
          </Button>
        </div>
      </div>

      {/* Theme Picker Drawer / Dropdown */}
      {showThemePicker && (
        <div className="mb-3 p-2 bg-black/80 border border-white/20 rounded-sm space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between text-[11px] text-white/80 pb-1 border-b border-white/10 font-mono">
            <span>SELECT GLOBE THEME:</span>
            <span className="text-cyan-400">{GLOBE_THEMES.length} THEMES</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
            {GLOBE_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  setCurrentThemeId(theme.id);
                  setShowThemePicker(false);
                }}
                className={`flex items-center gap-2 p-1.5 rounded-sm border text-left text-[11px] transition-all ${
                  currentThemeId === theme.id
                    ? "border-cyan-400 bg-white/10 text-white font-bold"
                    : "border-white/15 bg-black/40 text-white/70 hover:border-white/40 hover:text-white"
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${theme.previewClass} shrink-0 shadow-sm`} />
                <span className="truncate flex-1">{theme.name}</span>
                {currentThemeId === theme.id && <Check className="w-3 h-3 text-cyan-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas Container */}
      <div
        className="relative w-full h-[320px] sm:h-[380px] rounded-sm bg-black/60 overflow-hidden cursor-grab active:cursor-grabbing touch-none flex items-center justify-center"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Three.js canvas attachment point */}
        <div ref={mountRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Screen-Space Term Marker Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {termCoords.map((item) => {
            if (!item.visible) return null;
            const isSelected = activeTerm?.toLowerCase() === item.name.toLowerCase();
            const isHovered = hoveredTerm?.toLowerCase() === item.name.toLowerCase();

            return (
              <div
                key={item.name}
                className="absolute pointer-events-auto transition-transform duration-75"
                style={{
                  left: `${item.screenX}px`,
                  top: `${item.screenY}px`,
                  transform: "translate(-50%, -100%)",
                }}
                onMouseEnter={() => setHoveredTerm(item.name)}
                onMouseLeave={() => setHoveredTerm(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  focusOnTerm(item.name);
                }}
              >
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-wider cursor-pointer shadow-lg backdrop-blur-md transition-all ${
                    isSelected
                      ? "border-2 border-white bg-white text-black font-extrabold scale-110 shadow-cyan-500/50"
                      : isHovered
                      ? "border border-cyan-400 bg-cyan-950/90 text-cyan-300 scale-105"
                      : "border border-white/30 text-white/90 bg-black/70 hover:border-white"
                  }`}
                  style={{
                    backgroundColor: isSelected ? "#ffffff" : isHovered ? activeTheme.pinTextBg : "rgba(10, 5, 20, 0.75)",
                    borderColor: isSelected ? "#ffffff" : activeTheme.pinColor,
                    color: isSelected ? "#000000" : activeTheme.pinColor,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? "#000000" : activeTheme.pinColor }} />
                  <span>{item.name}</span>
                </div>
                {/* Pointer Arrow */}
                <div
                  className="w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-4"
                  style={{ borderTopColor: isSelected ? "#ffffff" : activeTheme.pinColor }}
                />
              </div>
            );
          })}
        </div>

        {/* Viewport Floating HUD Controls */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-auto">
          <div className="px-2 py-1 bg-black/70 border border-white/20 rounded-sm text-[10px] font-mono text-white/70 backdrop-blur-sm">
            <span className="text-cyan-400">TERMS ON GLOBE:</span> {effectiveTerms.length}
          </div>
          {activeTerm && (
            <div className="px-2 py-1 bg-cyan-950/80 border border-cyan-400/80 rounded-sm text-[10px] font-mono text-cyan-300 backdrop-blur-sm flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-cyan-400" />
              <span>ACTIVE: [{activeTerm.toUpperCase()}]</span>
            </div>
          )}
        </div>

        {/* Zoom & Reset Controls */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-auto">
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            className="w-7 h-7 p-0 bg-black/70 border border-white/20 text-white hover:bg-white/20 hover:text-white rounded-sm"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            className="w-7 h-7 p-0 bg-black/70 border border-white/20 text-white hover:bg-white/20 hover:text-white rounded-sm"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetView}
            className="h-7 px-2 bg-black/70 border border-white/20 text-[11px] text-white hover:bg-white/20 hover:text-white rounded-sm"
            title="Reset Globe View"
          >
            <Compass className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            RESET
          </Button>
        </div>

        {/* Drag / Touch Hint */}
        <div className="absolute bottom-2 left-2 pointer-events-none text-[9px] text-white/40 font-mono hidden sm:block">
          DRAG TO ROTATE · PINCH/WHEEL TO ZOOM
        </div>
      </div>

      {/* Interactive PoliAniGames Term Ribbon on Globe */}
      <div className="mt-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between gap-1 text-[11px] font-mono mb-1.5">
          <span className="text-white/60">PAGLOBE TERMS & PIN LOCATIONS:</span>
          {activeTerm && (
            <button
              onClick={() => onSelectTerm(null)}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              [CLEAR FILTER]
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-[11px]">
          {effectiveTerms.map((t) => {
            const isSelected = activeTerm?.toLowerCase() === t.toLowerCase();
            return (
              <button
                key={t}
                onClick={() => focusOnTerm(t)}
                className={`px-2.5 py-1 rounded-sm border uppercase font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? "border-cyan-400 bg-cyan-950/60 text-cyan-300 font-bold shadow-sm"
                    : "border-white/20 text-white/70 bg-black/40 hover:border-white/50 hover:text-white"
                }`}
              >
                ● {t}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
