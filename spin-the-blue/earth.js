/**
 * Earth Module - Handles 3D Earth creation and rendering
 */

import * as THREE from 'three';

export class Earth {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
        this.atmosphere = null;
        this.textureLoader = new THREE.TextureLoader();
    }

    async load() {
        // Load textures
        const [dayTexture, nightTexture, normalTexture] = await Promise.all([
            this.loadTexture('assets/textures/earth_day.jpg'),
            this.loadTexture('assets/textures/earth_night.jpg'),
            this.loadTexture('assets/textures/earth_normal.jpg')
        ]);

        // Configure textures for proper color
        dayTexture.colorSpace = THREE.SRGBColorSpace;
        nightTexture.colorSpace = THREE.SRGBColorSpace;

        // Create Earth geometry
        const geometry = new THREE.SphereGeometry(2, 128, 128);

        // Create custom shader material for day/night blending
        const material = new THREE.MeshPhongMaterial({
            map: dayTexture,
            normalMap: normalTexture,
            normalScale: new THREE.Vector2(0.8, 0.8),
            emissiveMap: nightTexture,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.15,
            shininess: 15,
            specular: new THREE.Color(0x333333)
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = 0.1; // Slight axial tilt
        this.scene.add(this.mesh);

        // Create atmosphere glow
        this.createAtmosphere();

        return this.mesh;
    }

    loadTexture(url) {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(
                url,
                (texture) => resolve(texture),
                undefined,
                (error) => {
                    console.warn(`Texture ${url} not found, using fallback`);
                    // Create fallback procedural texture
                    resolve(this.createFallbackTexture(url));
                }
            );
        });
    }

    createFallbackTexture(url) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (url.includes('day')) {
            // Blue marble fallback
            const gradient = ctx.createRadialGradient(512, 256, 0, 512, 256, 512);
            gradient.addColorStop(0, '#1a4d7a');
            gradient.addColorStop(0.3, '#0d3d6b');
            gradient.addColorStop(0.6, '#155e45');
            gradient.addColorStop(0.8, '#1a5a4a');
            gradient.addColorStop(1, '#0a2540');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, 1024, 512);

            // Add some land masses
            ctx.fillStyle = '#1e5e3d';
            for (let i = 0; i < 20; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1024, Math.random() * 512, 30 + Math.random() * 80, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (url.includes('night')) {
            // Dark with city lights
            ctx.fillStyle = '#000508';
            ctx.fillRect(0, 0, 1024, 512);
            ctx.fillStyle = '#ff9933';
            for (let i = 0; i < 200; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * 1024, Math.random() * 512, 1 + Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Normal map fallback (neutral purple-blue)
            ctx.fillStyle = '#8080ff';
            ctx.fillRect(0, 0, 1024, 512);
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createAtmosphere() {
        const atmosphereGeometry = new THREE.SphereGeometry(2.08, 64, 64);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vNormal;
                void main() {
                    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
                    gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.6;
                }
            `,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
            transparent: true
        });

        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.scene.add(this.atmosphere);
    }

    update(deltaTime) {
        if (this.mesh) {
            // Very slow auto rotation
            this.mesh.rotation.y += deltaTime * 0.02;
        }
        if (this.atmosphere) {
            this.atmosphere.rotation.y = this.mesh.rotation.y;
        }
    }

    getMesh() {
        return this.mesh;
    }

    // Rotate to specific coordinates (latitude, longitude in degrees)
    getPositionFromLatLng(lat, lng, radius = 4) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lng + 180) * (Math.PI / 180);

        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        return new THREE.Vector3(x, y, z);
    }

    // Get rotation to face specific coordinates
    getRotationForLatLng(lat, lng) {
        const targetRotationY = -((lng + 90) * Math.PI / 180);
        return { y: targetRotationY };
    }
}
