<template>
  <div class="relative w-full h-screen overflow-hidden bg-black">
    <canvas ref="globeCanvas" class="absolute inset-0 w-full h-full"></canvas>
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black"></div>
    <div class="relative z-10 flex flex-col items-center justify-center w-full h-full text-center">
      <transition name="fade-slide" mode="out-in">
        <h1 v-if="countdown > 0" :key="countdown" ref="countdownText" class="text-8xl md:text-9xl lg:text-[12rem] font-extrabold text-white mb-8">
          {{ countdown }}
        </h1>
        <div v-else :key="'newyear'" class="space-y-4">
          <h2 ref="newYearText" class="text-6xl font-bold text-white opacity-0 md:text-8xl lg:text-9xl">
            Bonne Année
          </h2>
          <h3 ref="yearText" class="text-8xl md:text-9xl lg:text-[12rem] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 opacity-0">
            2025
          </h3>
          <p ref="messageText" class="mt-4 text-sm text-white md:text-base lg:text-lg">
            Que cette nouvelle année vous apporte joie, santé et prospérité !
          </p>
        </div>
      </transition>
    </div>
    <canvas ref="confettiCanvas" class="absolute inset-0 w-full h-full pointer-events-none"></canvas>
    <p class="absolute text-xs text-white bottom-2 right-2">
      © {{ new Date().getFullYear() }} Michael Mogolo
    </p>
  </div>
</template>

<script lang="ts" setup>

import { ref, onMounted, onUnmounted } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import gsap from 'gsap';
import confetti from 'canvas-confetti';

const globeCanvas = ref<HTMLCanvasElement | null>(null);
const confettiCanvas = ref<HTMLCanvasElement | null>(null);
const countdownText = ref<HTMLElement | null>(null);
const newYearText = ref<HTMLElement | null>(null);
const yearText = ref<HTMLElement | null>(null);
const countdown = ref<number>(10);

let scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
let globe: THREE.Mesh, stars: THREE.Points, fireworks: THREE.Group;
let confettiInstance: any = null;

onMounted(() => {
  initThreeJS();
  initConfetti();
  animate();
  startCountdown();
});

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize);
});

function initThreeJS() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ canvas: globeCanvas.value!, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = false;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.5;

  // Create globe
  const globeGeometry = new THREE.SphereGeometry(5, 64, 64);
  const globeMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D globeTexture;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec3 diffuse = texture2D(globeTexture, vUv).rgb;
        float intensity = 1.05 - dot(vNormal, vec3(0.0, 0.0, 1.0));
        vec3 atmosphere = vec3(0.3, 0.6, 1.0) * pow(intensity, 1.5);
        gl_FragColor = vec4(diffuse + atmosphere, 1.0);
      }
    `,
    uniforms: {
      globeTexture: { value: new THREE.TextureLoader().load('/placeholder.svg?height=1024&width=2048') }
    }
  });
  globe = new THREE.Mesh(globeGeometry, globeMaterial);
  scene.add(globe);

  // Create stars
  const starGeometry = new THREE.BufferGeometry();
  const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
  const starVertices: number[] = [];
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = -Math.random() * 2000;
    starVertices.push(x, y, z);
  }
  starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
  stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Create fireworks
  fireworks = new THREE.Group();
  scene.add(fireworks);

  camera.position.z = 15;

  window.addEventListener('resize', onWindowResize);
}

function initConfetti() {
  confettiInstance = confetti.create(confettiCanvas.value!, {
    resize: true,
    useWorker: true
  });
}

function animate() {
  requestAnimationFrame(animate);
  globe.rotation.y += 0.002;
  stars.rotation.y += 0.0005;
  animateFireworks();
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function startCountdown() {
  animateCountdown();
  const interval = setInterval(() => {
    if (countdown.value > 1) {
      countdown.value--;
      animateCountdown();
      if (countdown.value <= 5) {
        createFirework();
      }
    } else {
      clearInterval(interval);
      countdown.value = 0;
      setTimeout(() => {
        showNewYearText();
      }, 1000); // Delay to allow for the fade-out of the countdown
    }
  }, 1000);
}

function animateCountdown() {
  gsap.fromTo(countdownText.value,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' }
  );
}

function showNewYearText() {
  gsap.fromTo(newYearText.value,
    { y: 50, opacity: 0 },
    { y: 0, opacity: 1, duration: 1, ease: 'power2.out' }
  );

  gsap.fromTo(yearText.value,
    { y: 50, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 1,
      delay: 0.5,
      ease: 'power2.out',
      onComplete: startConfettiFireworks
    }
  );

  animateBreathing();
}

function animateBreathing() {
  gsap.to([newYearText.value, yearText.value], {
    scale: 1.05,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'power1.inOut',
  });
}

function createFirework() {
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`),
    transparent: true,
    opacity: 1,
  });

  const particles = 1000;
  const positions = new Float32Array(particles * 3);

  for (let i = 0; i < particles; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const r = 5 + Math.random() * 5;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const firework = new THREE.Points(geometry, material);
  firework.position.set(
    (Math.random() - 0.5) * 10,
    Math.random() * 5 + 5,
    (Math.random() - 0.5) * 10
  );
  fireworks.add(firework);

  gsap.to(material, {
    opacity: 0,
    duration: 2,
    ease: 'power2.out',
    onComplete: () => {
      fireworks.remove(firework);
    },
  });
}

function animateFireworks() {
  fireworks.children.forEach((firework) => {
    const points = firework as THREE.Points;
    points.geometry.attributes.position.array.forEach((value, index) => {
      points.geometry.attributes.position.array[index] += (Math.random() - 0.5) * 0.05;
    });
    points.geometry.attributes.position.needsUpdate = true;
  });
}

function startConfettiFireworks() {
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function() {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Since particles fall down, start a bit higher than random
    confettiInstance({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
    });
    confettiInstance({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
    });
  }, 250);
}
</script>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>