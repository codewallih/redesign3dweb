import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 10;

const scene = new THREE.Scene();
let bee, secondModel;
let mixer, secondModelMixer;
const loader = new GLTFLoader();

// Load first model
loader.load("/industrial_robot_arm.glb", function (gltf) {
  bee = gltf.scene;
  bee.scale.set(0.08, 0.08, 0.08);
  bee.position.set(-1, -1, -1);
  scene.add(bee);

  mixer = new THREE.AnimationMixer(bee);
  mixer.clipAction(gltf.animations[0]).play();
  modelMove();

  // 3-axis tumble (infinite loop) for bee
  gsap.to(bee.rotation, {
    x: "+=12.56", // 2 full rotations (2 * Math.PI)
    y: "+=12.56", // 2 full rotations (2 * Math.PI)
    z: "+=12.56", // 2 full rotations (2 * Math.PI)
    repeat: -1, // Repeat indefinitely
    duration: 6, // Duration of the spin
    ease: "none", // No easing, constant speed
    modifiers: {
      x: gsap.utils.wrap(0, Math.PI * 2), // Ensure rotation stays within the range of 0 to 2π
      y: gsap.utils.wrap(0, Math.PI * 2), // Same for y-axis
      z: gsap.utils.wrap(0, Math.PI * 2), // Same for z-axis
    },
  });

  // 🎵 Bobbing / dancing movement for bee
  gsap.to(bee.position, {
    y: "+=1",
    repeat: -1,
    yoyo: true,
    duration: 1.2,
    ease: "sine.inOut",
  });
});

// Load second model
loader.load("/speaker_test.glb", function (gltf) {
  secondModel = gltf.scene;
  secondModel.scale.set(10, 10, 10);
  secondModel.position.set(15, -1, 1);
  scene.add(secondModel);

  secondModelMixer = new THREE.AnimationMixer(secondModel);
  if (gltf.animations.length) {
    secondModelMixer.clipAction(gltf.animations[0]).play();
  }

  // 🌀 3-axis tumble (infinite loop) for secondModel
  gsap.to(secondModel.rotation, {
    x: "+=6.28",
    y: "+=6.28",
    z: "+=6.28",
    repeat: -1,
    duration: 8,
    ease: "none",
    modifiers: {
      x: gsap.utils.wrap(0, Math.PI * 2),
      y: gsap.utils.wrap(0, Math.PI * 2),
      z: gsap.utils.wrap(0, Math.PI * 2),
    },
  });

  // 🎵 Bobbing / dancing movement for secondModel
  gsap.to(secondModel.position, {
    y: "+=1",
    repeat: -1,
    yoyo: true,
    duration: 1.5,
    ease: "sine.inOut",
  });
});

// Renderer setup
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Lighting setup
scene.add(new THREE.AmbientLight(0xffffff, 2.0));
const topLight = new THREE.DirectionalLight(0xffffff, 2.0);
topLight.position.set(100, 100, 100);
scene.add(topLight);

// Animation loop
const reRender3D = () => {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
  if (mixer) mixer.update(0.02);
  if (secondModelMixer) secondModelMixer.update(0.02);
};
reRender3D();

// Predefined positions + rotations for sections
let arrPositionModel = [
  {
    id: "banner",
    position: { x: 0, y: -2, z: 0 },
    rotation: { x: 0, y: 1.5, z: 0 },
  },
  {
    id: "intro",
    position: { x: 4, y: -2, z: -8 },
    rotation: { x: 0.5, y: -0.5, z: 0 },
  },
  {
    id: "description",
    position: { x: -4, y: -2, z: -8 },
    rotation: { x: 0, y: 0.5, z: 0 },
  },
  {
    id: "contact",
    position: { x: 6, y: -2, z: 0 },
    rotation: { x: 0.3, y: -0.5, z: 0 },
  },
];

// Update model positions based on scroll + active section
const modelMove = () => {
  const sections = document.querySelectorAll(".section");
  let currentSection;
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= window.innerHeight / 3) {
      currentSection = section.id;
    }
  });

  let position_active = arrPositionModel.findIndex(
    (val) => val.id == currentSection
  );

  if (position_active >= 0) {
    let new_coordinates = arrPositionModel[position_active];

    // Animate bee movement + rotation
    gsap.to(bee.position, {
      x: new_coordinates.position.x,
      y: new_coordinates.position.y,
      z: new_coordinates.position.z,
      duration: 3,
      ease: "power1.out",
    });
    gsap.to(bee.rotation, {
      x: new_coordinates.rotation.x,
      y: new_coordinates.rotation.y,
      z: new_coordinates.rotation.z,
      duration: 3,
      ease: "power1.out",
    });

    // Animate second model's relative position + rotation
    gsap.to(secondModel.position, {
      x: new_coordinates.position.x + 12,
      y: new_coordinates.position.y,
      z: new_coordinates.position.z,
      duration: 3,
      ease: "power1.out",
    });
    gsap.to(secondModel.rotation, {
      x: new_coordinates.rotation.x,
      y: new_coordinates.rotation.y + 0.5,
      z: new_coordinates.rotation.z,
      duration: 3,
      ease: "power1.out",
    });
  }
};

// Handle scroll-based movement
window.addEventListener("scroll", () => {
  if (bee && secondModel) {
    modelMove();
  }
});

// Responsive resizing
window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});
