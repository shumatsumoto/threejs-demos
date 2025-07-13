import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const loader = new STLLoader();
let mesh;

loader.load("chiikawa.stl", (geometry) => {
  (geometry) => {
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffdd,
    });
    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.set(0.01, 0.01, 0.01);
    mesh.position.set(-1, -0.5, -1);
    scene.add(mesh);
  };
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffdd,
  });
  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(0.01, 0.01, 0.01);
  mesh.position.set(-1, -0.5, 1);
  scene.add(mesh);
});

// マウス操作用
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

const canvas = document.querySelector("canvas.webgl");

canvas.addEventListener("mousedown", (e) => {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("mousemove", (e) => {
  if (!isDragging || !mesh) return;
  const deltaMove = {
    x: e.clientX - previousMousePosition.x,
    y: e.clientY - previousMousePosition.y,
  };
  mesh.rotation.y += deltaMove.x * 0.01;
  mesh.rotation.x += deltaMove.y * 0.01;
  previousMousePosition = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
  isDragging = false;
});

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 2;

// Light
const color = 0xffffff;
const intensity = 3;
const light = new THREE.DirectionalLight(color, intensity);
light.position.set(-1, 2, 4);
scene.add(light);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

function render(time) {
  time *= 0.001; // Convert time to seconds

  // Render the scene
  renderer.render(scene, camera);

  // Call render again on the next frame
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

// Handle window resize
window.addEventListener("resize", () => {
  // Update camera aspect ratio
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
