import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Particle system
const particleCount = 2000; // 500 -> 2000 (4x more particles)
const particles = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const originalPositions = new Float32Array(particleCount * 3);
const particleColors = new Float32Array(particleCount * 3);

// Generate sphere points for particles
for (let i = 0; i < particleCount; i++) {
  const phi = Math.acos(-1 + (2 * i) / particleCount);
  const theta = Math.sqrt(particleCount * Math.PI) * phi;

  const x = Math.cos(theta) * Math.sin(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(phi);

  originalPositions[i * 3] = x;
  originalPositions[i * 3 + 1] = y;
  originalPositions[i * 3 + 2] = z;

  particlePositions[i * 3] = x;
  particlePositions[i * 3 + 1] = y;
  particlePositions[i * 3 + 2] = z;

  // Initial color (cyan)
  particleColors[i * 3] = 0;
  particleColors[i * 3 + 1] = 1;
  particleColors[i * 3 + 2] = 0.8;
}

particles.setAttribute(
  "position",
  new THREE.BufferAttribute(particlePositions, 3)
);
particles.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.01, // 0.05 -> 0.02 (much smaller particles)
  vertexColors: true,
});

const particleSystem = new THREE.Points(particles, particleMaterial);
particleSystem.visible = false; // Start hidden
scene.add(particleSystem);

// Object (initially visible)
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ffdd,
  wireframe: true,
});
const sphere = new THREE.Mesh(geometry, material);
sphere.visible = true; // Start as sphere
scene.add(sphere);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

// Animation state
let animationState = "delay"; // 'particles', 'exploding', 'reforming', 'sphere', 'delay'
let animationTime = 0;
const delayDuration = 0.3; // Delay before explosion starts
const explosionDuration = 0.2; // 2.0 -> 0.2 (10x faster)
const reformDuration = 0.3; // 3.0 -> 0.3 (10x faster)

// Mouse tracking
const mouse = {
  x: 0,
  y: 0,
};

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

// Add mouse move event listener
window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Add click event listener
window.addEventListener("click", (event) => {
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(clickMouse, camera);

  if (animationState === "sphere") {
    // Check intersection with sphere
    const intersects = raycaster.intersectObject(sphere);
    if (intersects.length > 0) {
      animationState = "delay";
      animationTime = 0;
      // Keep sphere visible during delay
    }
  } else if (animationState === "particles") {
    // Check intersection with particle system
    const intersects = raycaster.intersectObject(particleSystem);
    if (intersects.length > 0) {
      animationState = "delay";
      animationTime = 0;
      // Switch to sphere during delay
      sphere.visible = true;
      particleSystem.visible = false;
    }
  }
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Animation loop
function animate(time) {
  time *= 0.001;
  animationTime += 0.016; // ~60fps

  // Update camera position based on mouse
  camera.position.x = mouse.x * 2;
  camera.position.y = mouse.y * 2;
  camera.lookAt(0, 0, 0);

  if (animationState === "delay") {
    // Wait before starting explosion
    const progress = Math.min(animationTime / delayDuration, 1);

    // Optional: Add subtle effect during delay (like pulsing)
    const pulse = 1 + Math.sin(animationTime * 20) * 0.05; // Gentle pulsing
    sphere.scale.set(pulse, pulse, pulse);

    if (progress >= 1) {
      animationState = "exploding";
      animationTime = 0;
      sphere.visible = false;
      particleSystem.visible = true;
      sphere.scale.set(1, 1, 1); // Reset scale
    }
  } else if (animationState === "exploding") {
    // Explode particles outward
    const progress = Math.min(animationTime / explosionDuration, 1);
    const positions = particles.attributes.position.array;
    const colors = particles.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Explosive movement
      const explosionForce = 1; // 3 -> 1 (smaller spread)
      positions[i3] = originalPositions[i3] * (1 + progress * explosionForce);
      positions[i3 + 1] =
        originalPositions[i3 + 1] * (1 + progress * explosionForce);
      positions[i3 + 2] =
        originalPositions[i3 + 2] * (1 + progress * explosionForce);

      // Color change during explosion (red to yellow)
      colors[i3] = 1; // Red component
      colors[i3 + 1] = progress; // Green component (creates yellow)
      colors[i3 + 2] = 0; // Blue component
    }

    particles.attributes.position.needsUpdate = true;
    particles.attributes.color.needsUpdate = true;

    if (progress >= 1) {
      animationState = "reforming";
      animationTime = 0;
    }
  } else if (animationState === "reforming") {
    // Reform into sphere with color change
    const progress = Math.min(animationTime / reformDuration, 1);
    const positions = particles.attributes.position.array;
    const colors = particles.attributes.color.array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      // Smooth return to original positions
      const explosionForce = 1; // 3 -> 1 (match explosion phase)
      const currentX =
        originalPositions[i3] * (1 + (1 - progress) * explosionForce);
      const currentY =
        originalPositions[i3 + 1] * (1 + (1 - progress) * explosionForce);
      const currentZ =
        originalPositions[i3 + 2] * (1 + (1 - progress) * explosionForce);

      positions[i3] = currentX;
      positions[i3 + 1] = currentY;
      positions[i3 + 2] = currentZ;

      // Color transition (yellow to purple to cyan)
      const hue = (progress * 240 + 60) % 360; // 60° (yellow) to 300° (purple) to 180° (cyan)
      const rgb = hslToRgb(hue / 360, 1, 0.5);
      colors[i3] = rgb.r;
      colors[i3 + 1] = rgb.g;
      colors[i3 + 2] = rgb.b;
    }

    particles.attributes.position.needsUpdate = true;
    particles.attributes.color.needsUpdate = true;

    if (progress >= 1) {
      animationState = "sphere";
      sphere.visible = true;
      particleSystem.visible = false;

      // Update sphere color to match final particle color
      const finalHue = 180 / 360; // Cyan
      material.color.setHSL(finalHue, 1, 0.5);
    }
  } else if (animationState === "sphere") {
    // Rotate sphere
    sphere.rotation.x = time * 0.5;
    sphere.rotation.y = time * 0.5;

    // Color animation for sphere
    const hue = (time * 50) % 360;
    material.color.setHSL(hue / 360, 1, 0.5);
  } else if (animationState === "particles") {
    // Gentle rotation of particle sphere
    particleSystem.rotation.x = time * 0.1;
    particleSystem.rotation.y = time * 0.1;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

// Helper function to convert HSL to RGB
function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;

  if (h < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (h < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (h < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (h < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (h < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return { r: r + m, g: g + m, b: b + m };
}

// Start animation
animate();
