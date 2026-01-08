/**
 * Events Module - Handles event data and interactions
 */

export const events = [
    {
        id: 'solar-eclipse-antarctica',
        title: 'Annual Solar Eclipse',
        location: 'Antarctica',
        coordinates: {
            lat: -82,
            lng: 0
        },
        date: 'December 4, 2026',
        duration: '2m 15s totality',
        bestViewing: 'Antarctic Peninsula',
        description: `Experience the rare total solar eclipse visible from the Antarctic continent. 
            The Moon will completely cover the Sun for approximately 2 minutes and 15 seconds, 
            creating an unforgettable celestial spectacle against the pristine ice landscape.`
    }
];

export class EventManager {
    constructor(earth, camera, controls) {
        this.earth = earth;
        this.camera = camera;
        this.controls = controls;
        this.currentEvent = null;
        this.isAnimating = false;

        this.banner = document.getElementById('event-banner');
        this.popup = document.getElementById('event-popup');
        this.popupClose = document.getElementById('popup-close');

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Banner click
        this.banner.addEventListener('click', () => {
            if (!this.isAnimating) {
                this.flyToEvent(events[0]);
            }
        });

        // Close popup
        this.popupClose.addEventListener('click', () => {
            this.closePopup();
        });

        // Close on backdrop click
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) {
                this.closePopup();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.popup.classList.contains('hidden')) {
                this.closePopup();
            }
        });
    }

    flyToEvent(event) {
        if (this.isAnimating) return;

        this.isAnimating = true;
        this.currentEvent = event;

        const earthMesh = this.earth.getMesh();
        if (!earthMesh) return;

        // Calculate target rotation to show Antarctica
        const targetRotation = this.earth.getRotationForLatLng(event.coordinates.lat, event.coordinates.lng);

        // Calculate camera position to view Antarctica
        const targetCameraPosition = this.earth.getPositionFromLatLng(
            event.coordinates.lat + 20, // Slightly above
            event.coordinates.lng,
            5.5 // Zoom distance
        );

        // Disable controls during animation
        this.controls.enabled = false;

        // Animate Earth rotation
        gsap.to(earthMesh.rotation, {
            y: targetRotation.y,
            duration: 2.5,
            ease: 'power2.inOut'
        });

        // Animate camera position
        gsap.to(this.camera.position, {
            x: targetCameraPosition.x,
            y: targetCameraPosition.y,
            z: targetCameraPosition.z,
            duration: 2.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            },
            onComplete: () => {
                this.showPopup();
                this.isAnimating = false;
            }
        });
    }

    showPopup() {
        this.popup.classList.remove('hidden');
    }

    closePopup() {
        this.popup.classList.add('hidden');

        // Re-enable controls
        this.controls.enabled = true;

        // Smoothly reset camera position
        gsap.to(this.camera.position, {
            x: 0,
            y: 0,
            z: 6,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                this.camera.lookAt(0, 0, 0);
            }
        });
    }
}
