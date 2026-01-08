/**
 * Main Application - Spin the Blue
 * 3D Interactive Earth Experience
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Earth } from './earth.js';
import { EventManager } from './events.js';

class SpinTheBlue {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.loadingScreen = document.getElementById('loading-screen');

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.earth = null;
        this.eventManager = null;
        this.stars = [];
        this.clock = new THREE.Clock();

        this.init();
    }

    async init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupLighting();
        this.createStarfield();

        // Load Earth
        this.earth = new Earth(this.scene);
        await this.earth.load();

        // Setup event manager
        this.eventManager = new EventManager(this.earth, this.camera, this.controls);

        // Hide loading screen
        this.hideLoading();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Start render loop
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000005);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 0, 6);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.container.appendChild(this.renderer.domElement);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.enablePan = false;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 15;
        this.controls.rotateSpeed = 0.5;
        this.controls.zoomSpeed = 0.8;
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404060, 0.3);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);

        // Soft fill light from opposite side
        const fillLight = new THREE.DirectionalLight(0x4466aa, 0.3);
        fillLight.position.set(-5, -2, -5);
        this.scene.add(fillLight);

        // Rim light for atmosphere highlight
        const rimLight = new THREE.DirectionalLight(0x88aaff, 0.2);
        rimLight.position.set(0, 5, -5);
        this.scene.add(rimLight);
    }

    createStarfield() {
        const starCount = 3000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        const velocities = [];

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;

            // Distribute stars in a sphere
            const radius = 50 + Math.random() * 100;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            sizes[i] = Math.random() * 2 + 0.5;

            // Slow parallax velocity
            velocities.push({
                x: (Math.random() - 0.5) * 0.002,
                y: (Math.random() - 0.5) * 0.002,
                z: (Math.random() - 0.5) * 0.002
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Custom shader for stars with twinkling
        const starMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: this.renderer.getPixelRatio() }
            },
            vertexShader: `
                attribute float size;
                uniform float pixelRatio;
                varying float vOpacity;
                
                void main() {
                    vOpacity = 0.4 + 0.6 * fract(size * 123.456);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * pixelRatio * (100.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform float time;
                varying float vOpacity;
                
                void main() {
                    float d = length(gl_PointCoord - vec2(0.5));
                    if (d > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, d);
                    float twinkle = 0.7 + 0.3 * sin(time * 2.0 + vOpacity * 100.0);
                    
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha * vOpacity * twinkle);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const stars = new THREE.Points(geometry, starMaterial);
        this.scene.add(stars);

        this.stars.push({ mesh: stars, velocities, positions });
    }

    updateStarfield(deltaTime) {
        this.stars.forEach(starSystem => {
            const positions = starSystem.mesh.geometry.attributes.position.array;
            const velocities = starSystem.velocities;

            for (let i = 0; i < velocities.length; i++) {
                const i3 = i * 3;
                positions[i3] += velocities[i].x;
                positions[i3 + 1] += velocities[i].y;
                positions[i3 + 2] += velocities[i].z;
            }

            starSystem.mesh.geometry.attributes.position.needsUpdate = true;
            starSystem.mesh.material.uniforms.time.value += deltaTime;
        });
    }

    hideLoading() {
        this.loadingScreen.classList.add('hidden');
        setTimeout(() => {
            this.loadingScreen.style.display = 'none';
        }, 600);
    }

    onResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const deltaTime = this.clock.getDelta();

        // Update controls
        this.controls.update();

        // Update Earth rotation
        if (this.earth) {
            this.earth.update(deltaTime);
        }

        // Update starfield parallax
        this.updateStarfield(deltaTime);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize application
new SpinTheBlue();
