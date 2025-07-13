import * as THREE from "three";

const canvas = document.querySelector("canvas.webgl");

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

// Object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({
  color: 0x00ffdd,
  wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.render(scene, camera);

function render(time) {
  time *= 0.001; // Convert time to seconds

  // Update cube rotation
  cube.rotation.x = time;
  cube.rotation.y = time;

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

// //Scene
// const scene = new THREE.Scene();

// //Object
// const geomety = new THREE.BoxGeometry(2, 2, 2);
// const material = new THREE.MeshBasicMaterial({
//   color: 0xff0000,
//   wireframe: true,
// });
// const mesh = new THREE.Mesh(geomety, material);
// scene.add(mesh);

// // Sizes
// const sizes = {
//   width: 800,
//   height: 600,
// };

// //Camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height);
// camera.position.z = 5;
// scene.add(camera);

// const renderer = new THREE.WebGLRenderer({
//   canvas: canvas,
// });
// renderer.setSize(sizes.width, sizes.height);
// renderer.render(scene, camera);
