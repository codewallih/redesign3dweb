// Import the core THREE.js library from a CDN (Content Delivery Network)
import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';

// Import the GLTFLoader to load 3D models in .glb/.gltf format
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';

// Import GSAP (GreenSock Animation Platform) for additional animation capabilities (not used in current code)
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Create a PerspectiveCamera with field of view 75, proper aspect ratio, near and far clipping planes
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20; // Move the camera backward to view the scene

// Create the scene that holds all objects, lights, and the camera
const scene = new THREE.Scene();

// Declare variables for the models and their animation mixers
let bee, secondModel;
let mixer, secondModelMixer;

// Create a loader instance for loading GLTF models
const loader = new GLTFLoader();

// Load the first GLTF model (a bee)
loader.load('/bee.glb',
    function (gltf) {
        bee = gltf.scene; // Store the loaded scene (model)
        bee.scale.set(25, 25, 25); // Scale the model to a suitable size
        bee.position.set(-1, -1, -1); // Position the model in the scene
        scene.add(bee); // Add the model to the scene

        // Create an animation mixer for the bee and play the first animation
        mixer = new THREE.AnimationMixer(bee);
        mixer.clipAction(gltf.animations[0]).play();
    }
);

// Load the second model (headphones)
loader.load('/headphones.glb',
    function (gltf) {
        secondModel = gltf.scene;
        secondModel.scale.set(9,9,9); // Adjust the scale for the second model
        secondModel.position.set(5, -1, 1); // Position it in a different place from the bee
        scene.add(secondModel);

        // Create an animation mixer and play the first animation if it exists
        secondModelMixer = new THREE.AnimationMixer(secondModel);
        if (gltf.animations.length) {
            secondModelMixer.clipAction(gltf.animations[0]).play();
        }
    }
);

// Create a WebGL renderer and make it transparent (alpha: true)
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size to full window
document.getElementById('container3D').appendChild(renderer.domElement); // Attach it to the DOM

// Add ambient light to illuminate the scene globally
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
scene.add(ambientLight);

// Add directional light to mimic sunlight from the top
const topLight = new THREE.DirectionalLight(0xffffff, 3.0);
topLight.position.set(500, 500, 500); // Position the light above the scene
scene.add(topLight);

// Main animation loop: renders the scene continuously
const reRender3D = () => {
    requestAnimationFrame(reRender3D); // Call this function on every animation frame
    renderer.render(scene, camera); // Render the scene using the current camera view

    // If mixers are available (models are loaded), update their animations
    if (mixer) mixer.update(0.02);
    if (secondModelMixer) secondModelMixer.update(0.02);
};
reRender3D(); // Kick off the animation loop

// Tumble models continuously as the user scrolls the page
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;  // Get current vertical scroll position
    
    // Set how much rotation is applied per scroll amount
    const rotationSpeed = scrollY * 0.001;  // You can tweak this factor for slower/faster spin

    // Apply rotation to the bee model
    if (bee) {
        bee.rotation.x += rotationSpeed;
        bee.rotation.y += rotationSpeed;
        bee.rotation.z += rotationSpeed;
    }
    
    // Apply rotation to the second model (headphones)
    if (secondModel) {
        secondModel.rotation.x += rotationSpeed;
        secondModel.rotation.y += rotationSpeed;
        secondModel.rotation.z += rotationSpeed;
    }
});

// Handle browser window resizing to keep 3D canvas responsive
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight); // Adjust canvas size
    camera.aspect = window.innerWidth / window.innerHeight; // Update aspect ratio
    camera.updateProjectionMatrix(); // Recalculate projection matrix
});
