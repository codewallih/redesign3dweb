import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { gsap } from "https://cdn.skypack.dev/gsap";

// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(innerWidth, innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 1.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
dirLight.position.set(100, 100, 100);
scene.add(dirLight);

// Loaders and Mixers
const loader = new GLTFLoader();
let bee, speaker;
const mixers = [];

const animateModel = (model, animations = [], scale = 1, position = [0, 0, 0]) => {
  model.scale.setScalar(scale);
  model.position.set(...position);
  scene.add(model);

  if (animations.length) {
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(animations[0]).play();
    mixers.push(mixer);
  }

  gsap.to(model.rotation, {
    x: "+=6.28", y: "+=6.28", z: "+=6.28",
    repeat: -1, duration: 6, ease: "none",
    modifiers: {
      x: gsap.utils.wrap(0, Math.PI * 2),
      y: gsap.utils.wrap(0, Math.PI * 2),
      z: gsap.utils.wrap(0, Math.PI * 2)
    }
  });

  gsap.to(model.position, {
    y: "+=1", yoyo: true, repeat: -1,
    duration: 1.2, ease: "sine.inOut"
  });
};

// Load Models
loader.load("/industrial_robot_arm.glb", ({ scene, animations }) => {
  bee = scene;
  animateModel(bee, animations, 0.08, [-2, -1, -1]);
});

loader.load("/speaker_test.glb", ({ scene, animations }) => {
  speaker = scene;
  animateModel(speaker, animations, 6, [0.5, -1, -1]);
});

// Section Position Targets
const sectionTargets = {
  banner: { pos: [0, -2, 0], rot: [0, 1.5, 0] },
  intro: { pos: [4, -2, -8], rot: [0.5, -0.5, 0] },
  description: { pos: [-4, -2, -8], rot: [0, 0.5, 0] },
  contact: { pos: [6, -2, 0], rot: [0.3, -0.5, 0] },
};

// Scroll-Based Position Update
const updateModelPosition = () => {
  const sections = document.querySelectorAll(".section");
  let activeId = Array.from(sections).find(sec =>
    sec.getBoundingClientRect().top <= innerHeight / 3
  )?.id;

  const target = sectionTargets[activeId];
  if (!target || !bee || !speaker) return;

  gsap.to(bee.position, { x: target.pos[0], y: target.pos[1], z: target.pos[2], duration: 2.5, ease: "power1.out" });
  gsap.to(bee.rotation, { x: target.rot[0], y: target.rot[1], z: target.rot[2], duration: 2.5, ease: "power1.out" });

  gsap.to(speaker.position, {
    x: target.pos[0] + 1.5,
    y: target.pos[1],
    z: target.pos[2],
    duration: 2.5,
    ease: "power1.out"
  });
};

// Animate Loop
const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  mixers.forEach(m => m.update(delta));
  renderer.render(scene, camera);
};
animate();

// Resize & Scroll Listeners
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
addEventListener("scroll", updateModelPosition);
