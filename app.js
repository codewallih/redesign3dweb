// Import necessary libraries from Skypack
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/DRACOLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

// Setup scene, camera, and renderer
const scene = new THREE.Scene(); // Create a new 3D scene
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000); // Create a camera with a field of view of 75 degrees
camera.position.z = 10; // Place the camera 10 units away along the z-axis

const renderer = new THREE.WebGLRenderer({ alpha: true }); // Create a WebGL renderer with transparency
renderer.setSize(innerWidth, innerHeight); // Set the size of the renderer to match the window dimensions
document.getElementById("container3D").appendChild(renderer.domElement); // Attach the renderer to the DOM

// Lighting setup
scene.add(new THREE.AmbientLight(0xffffff, 1.8)); // Add ambient light to the scene (bright, white)
const dirLight = new THREE.DirectionalLight(0xffffff, 1.8); // Add a directional light (like sunlight)
dirLight.position.set(100, 100, 100); // Set the position of the directional light
scene.add(dirLight); // Add the light to the scene

// DRACO Compression setup (for optimized 3D models)
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.skypack.dev/three@0.129.0/examples/js/libs/draco/'); // Set the path for DRACO decoder files

// GLTFLoader setup with DRACO compression
const loader = new GLTFLoader();
loader.setDRACOLoader(dracoLoader); // Link the DRACO loader to the GLTF loader for compressed models

// Declare variables for models and mixers
let bee, speaker, mixers = []; // `bee` and `speaker` are the models, `mixers` is an array for animation mixing

// Function to animate models (rotation, position, scale)
const animateModel = (model, anims = [], scale = 1, pos = [0, 0, 0]) => {
  model.scale.set(scale, scale, scale); // Scale the model to the specified size
  model.position.set(...pos); // Set the position of the model in 3D space
  scene.add(model); // Add the model to the scene

  // If the model has animations, play them
  if (anims.length) {
    const mixer = new THREE.AnimationMixer(model); // Create an animation mixer for the model
    mixer.clipAction(anims[0]).play(); // Play the first animation of the model
    mixers.push(mixer); // Add the mixer to the `mixers` array
  }

  // Rotate the model continuously using GSAP
  gsap.to(model.rotation, {
    x: "+=6.28", y: "+=6.28", z: "+=6.28", 
    repeat: -1, duration: 6, ease: "none", 
    modifiers: { x: gsap.utils.wrap(0, Math.PI * 2), y: gsap.utils.wrap(0, Math.PI * 2), z: gsap.utils.wrap(0, Math.PI * 2) }
  });

  // Make the model bounce up and down using GSAP
  gsap.to(model.position, {
    y: "+=1", yoyo: true, repeat: -1,
    duration: 1.2, ease: "sine.inOut"
  });
};

// Load the bee model (robot arm) with DRACO compression
loader.load("/industrial_robot_arm.glb", (gltf) => {
  bee = gltf.scene; // Store the loaded model
  animateModel(bee, gltf.animations, 0.08, [-2, -1, -1]); // Animate the bee model
});

// Load the speaker model with DRACO compression
loader.load("/speaker_test.glb", (gltf) => {
  speaker = gltf.scene; // Store the loaded speaker model
  animateModel(speaker, gltf.animations, 6, [0.5, -1, -1]); // Animate the speaker model
});

// Define positions and rotations for different sections of the page
const sectionPositions = {
  banner: { pos: [0, -2, 0], rot: [0, 1.5, 0] },
  intro: { pos: [4, -2, -8], rot: [0.5, -0.5, 0] },
  description: { pos: [-4, -2, -8], rot: [0, 0.5, 0] },
  contact: { pos: [6, -2, 0], rot: [0.3, -0.5, 0] },
};

// Update model position based on scroll position
const updateModelPosition = () => {
  const sections = document.querySelectorAll(".section"); // Get all sections with the class "section"
  let currentId;

  sections.forEach((sec) => {
    if (sec.getBoundingClientRect().top <= innerHeight / 3) {
      currentId = sec.id; // Get the id of the current section in view
    }
  });

  const target = sectionPositions[currentId]; // Get the position and rotation for the section
  if (!target || !bee || !speaker) return; // If no target or models are loaded, do nothing

  // Animate the bee and speaker to their new positions based on the section in view
  gsap.to(bee.position, { ...target.pos, duration: 2.5, ease: "power1.out" });
  gsap.to(bee.rotation, { ...target.rot, duration: 2.5, ease: "power1.out" });

  gsap.to(speaker.position, {
    x: target.pos[0] + 1.5,
    y: target.pos[1],
    z: target.pos[2],
    duration: 2.5,
    ease: "power1.out"
  });
};

// Main animation loop
const animate = () => {
  requestAnimationFrame(animate); // Call animate on the next frame
  renderer.render(scene, camera); // Render the scene from the camera's perspective
  mixers.forEach((m) => m.update(0.02)); // Update all animation mixers
};
animate(); // Start the animation loop

// Event listener for window resize
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; // Update the camera's aspect ratio when the window resizes
  camera.updateProjectionMatrix(); // Recalculate the projection matrix to reflect the new aspect ratio
  renderer.setSize(innerWidth, innerHeight); // Update the renderer size
});

// Event listener for scrolling
addEventListener("scroll", updateModelPosition); // Update the model's position based on scroll events
