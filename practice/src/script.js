import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

init();
async function init() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const geometry = new THREE.TorusGeometry(5, 3, 16, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });

  const cube = new THREE.Mesh(geometry, material);
  const control = new OrbitControls(camera, renderer.domElement);
  control.enableDamping = true;
  scene.add(cube);

  camera.position.z = 15;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    control.update();
  }

  animate();
}
