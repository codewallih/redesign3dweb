// Import necessary libraries from Skypack
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
// Create a perspective camera with 75-degree field of view, aspect ratio based on window size, near and far clipping planes
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
// Set camera's initial position along the Z-axis
camera.position.z = 10;

// Initialize the WebGL renderer with transparency enabled
const renderer = new THREE.WebGLRenderer({ alpha: true });
// Set the renderer size to match the window size
renderer.setSize(innerWidth, innerHeight);
// Append the renderer's canvas element to the DOM container
document.getElementById("container3D").appendChild(renderer.domElement);

// Lighting setup for scene
// Ambient light to illuminate the scene evenly
scene.add(new THREE.AmbientLight(0xffffff, 1.8));
// Directional light (like sunlight) to cast strong shadows and light the scene from a specific direction
const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(100, 100, 100); // Position the directional light
scene.add(dirLight);

// Initialize GLTF loader to load 3D models
const loader = new GLTFLoader();
// Declare variables for the models and mixers (for animation)
let bee, speaker, mixers = [];

// Function to animate models (rotation, position, scale)
const animateModel = (model, anims = [], scale = 1, pos = [0, 0, 0]) => {
  // Set model's scale and position
  model.scale.set(scale, scale, scale);
  model.position.set(...pos);
  scene.add(model);

  // If animations are available, play them
  if (anims.length) {
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(anims[0]).play(); // Play the first animation
    mixers.push(mixer); // Store the mixer for updating during the animation loop
  }

  // Add rotation animation using GSAP (smooth continuous rotation around all axes)
  gsap.to(model.rotation, {
    x: "+=6.28", y: "+=6.28", z: "+=6.28", // 360 degrees
    repeat: -1, duration: 6, ease: "none", // Infinite loop of rotation
    modifiers: { x: gsap.utils.wrap(0, Math.PI * 2), y: gsap.utils.wrap(0, Math.PI * 2), z: gsap.utils.wrap(0, Math.PI * 2) }
  });

  // Add floating motion to the model using GSAP (bounce effect)
  gsap.to(model.position, {
    y: "+=1", yoyo: true, repeat: -1, // Move up and down
    duration: 1.2, ease: "sine.inOut" // Smooth easing for a floating effect
  });
};

// Load 3D model of the robot arm (Bee)
loader.load("/industrial_robot_arm.glb", (gltf) => {
  bee = gltf.scene; // Extract the scene from the loaded GLTF
  animateModel(bee, gltf.animations, 0.08, [-2, -1, -1]); // Animate the robot arm with a scale and position
});

// Load 3D model of the speaker
loader.load("/speaker_test.glb", (gltf) => {
  speaker = gltf.scene;
  animateModel(speaker, gltf.animations, 6, [0.5, -1, -1]); // Animate the speaker with a larger scale and position
});

// Define positions and rotations for different sections of the page
const sectionPositions = {
  banner: { pos: [0, -2, 0], rot: [0, 1.5, 0] },
  intro: { pos: [4, -2, -8], rot: [0.5, -0.5, 0] },
  description: { pos: [-4, -2, -8], rot: [0, 0.5, 0] },
  contact: { pos: [6, -2, 0], rot: [0.3, -0.5, 0] },
};

// Function to update model position based on scroll position
const updateModelPosition = () => {
  const sections = document.querySelectorAll(".section");
  let currentId;

  // Loop through each section to determine which section is currently in view
  sections.forEach((sec) => {
    if (sec.getBoundingClientRect().top <= innerHeight / 3) {
      currentId = sec.id; // Set current section ID
    }
  });

  const target = sectionPositions[currentId];
  if (!target || !bee || !speaker) return; // If no target or models, return early

  // Animate the bee's position and rotation
  gsap.to(bee.position, { ...target.pos, duration: 2.5, ease: "power1.out" });
  gsap.to(bee.rotation, { ...target.rot, duration: 2.5, ease: "power1.out" });

  // Animate the speaker's position, keeping it slightly offset
  gsap.to(speaker.position, {
    x: target.pos[0] + 1.5, // Slight offset for visual balance
    y: target.pos[1],
    z: target.pos[2],
    duration: 2.5,
    ease: "power1.out"
  });
};

// Main animation loop to continuously render the scene
const animate = () => {
  requestAnimationFrame(animate); // Request next frame for animation
  renderer.render(scene, camera); // Render the scene from the camera's perspective
  mixers.forEach((m) => m.update(0.02)); // Update animation mixers
};
animate();

// Event listener for window resize to adjust camera and renderer size
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; // Update aspect ratio
  camera.updateProjectionMatrix(); // Recalculate projection matrix
  renderer.setSize(innerWidth, innerHeight); // Adjust renderer size
});

// Event listener for scrolling to update model positions on scroll
addEventListener("scroll", updateModelPosition);
