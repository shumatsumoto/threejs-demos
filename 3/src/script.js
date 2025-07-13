import * as THREE from "three";

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ffdd,
  wireframe: true,
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 3;

// Mouse tracking
const mouse = {
  x: 0,
  y: 0,
};

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

// Click color states
let isClicked = false;
const originalColor = { h: 0, s: 1, l: 0.5 };
const clickedColor = { h: 0.9, s: 1, l: 0.3 }; // Purple color

// Add mouse move event listener
window.addEventListener("mousemove", (event) => {
  // Normalize mouse coordinates to -1 to 1 range
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Add click event listener
window.addEventListener("click", (event) => {
  // Update mouse coordinates for raycasting
  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Cast ray from camera through mouse position
  raycaster.setFromCamera(clickMouse, camera);

  // Check for intersections with the sphere
  const intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    // Toggle clicked state
    isClicked = !isClicked;
  }
});

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);

// Animation loop
function animate(time) {
  time *= 0.001; // Convert to seconds

  // Change color based on click state
  if (isClicked) {
    // Use clicked color (purple)
    material.color.setHSL(clickedColor.h, clickedColor.s, clickedColor.l);
  } else {
    // Use time-based color animation
    const hue = (time * 50) % 360; // Cycle through hues
    material.color.setHSL(hue / 360, 1, 0.5);
  }

  // Update sphere rotation
  sphere.rotation.x = time * 0.08; // Slow rotation
  sphere.rotation.y = time * 0.08; // Slow rotation

  // Update camera position based on mouse
  camera.position.x = mouse.x * 2;
  camera.position.y = mouse.y * 2;
  camera.lookAt(sphere.position);

  // Render
  renderer.render(scene, camera);

  // Continue animation
  requestAnimationFrame(animate);
}

// Start animation
animate();
