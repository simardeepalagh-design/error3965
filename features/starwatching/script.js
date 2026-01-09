/**
 * DEEP SPACE STAR EXPLORER
 * Core Engine
 */

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

const radarCanvas = document.getElementById('radar-canvas');
const radarCtx = radarCanvas.getContext('2d');

// --- CONFIGURATION ---
const CONFIG = {
    starCount: 6000,
    depth: 5000, // Z-depth of the universe
    fov: 300,    // Field of View
    zoomSpeed: 0.1,
    panSpeed: 2,
    colors: ['#ffffff', '#cceeff', '#ffddaa', '#99ccff', '#ffeecc', '#00f3ff']
};

// --- STATE ---
const state = {
    width: window.innerWidth,
    height: window.innerHeight,
    stars: [], // Array of star objects
    camera: { x: 0, y: 0, z: 0 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
    hoveredStar: null,
    targetStar: null, // For animation fly-to
    animationId: null,
    isTouring: false
};

// --- REAL STAR NAMES (Sample Data) ---
// We will assign these to random bright stars to simulate real exploration
const STAR_NAMES = [
    "Sirius", "Canopus", "Arcturus", "Vega", "Capella", "Rigel", "Procyon", "Achernar", "Betelgeuse", "Hadar", "Altair", "Acrux", "Aldebaran", "Antares", "Spica", "Pollux", "Fomalhaut", "Deneb", "Mimosa", "Regulus", "Adhara", "Castor", "Gacrux", "Shaula", "Bellatrix", "Elnath", "Miaplacidus", "Alnilam", "Alnair", "Alioth", "Dubhe", "Mirfak", "Wezen", "Sargas", "Menkent", "Polaris"
];

// --- INITIALIZATION ---
function init() {
    resize();
    window.addEventListener('resize', resize);

    // Generate Stars
    for (let i = 0; i < CONFIG.starCount; i++) {
        const isNamed = i < STAR_NAMES.length;
        // Generate a name for EVERY star. Real names for top few, catalog IDs for the rest.
        const name = isNamed ? STAR_NAMES[i] : `HIP-${Math.floor(Math.random() * 100000) + 1000}`;

        state.stars.push({
            x: (Math.random() - 0.5) * CONFIG.depth * 2, // spread wide
            y: (Math.random() - 0.5) * CONFIG.depth * 1.5,
            z: Math.random() * CONFIG.depth + 100, // Push them back a bit
            size: isNamed ? Math.random() * 2 + 1.5 : Math.random() * 1.5 + 0.5,
            color: isNamed ? '#fff' : CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)],
            name: name,
            alpha: Math.random() * 0.5 + 0.5
        });
    }

    // Input Listeners
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel);

    // Search Init
    document.getElementById('search-btn').addEventListener('click', onSearch);
    document.getElementById('star-search').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') onSearch();
    });

    document.getElementById('tour-btn').addEventListener('click', toggleTour);

    // Start Clock
    setInterval(updateClock, 1000);

    // Start Loop
    loop();
}

function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width;
    canvas.height = state.height;
}

// --- CORE RENDER LOOP ---
function loop() {
    // Math checks / Update
    updateCameraTransition();

    // Render
    render();

    // HUD Updates
    updateHUD();

    // Radar
    updateRadar();

    state.animationId = requestAnimationFrame(loop);
}

function render() {
    // 1. Clear + Background
    ctx.fillStyle = "#000000"; // Pure black
    ctx.fillRect(0, 0, state.width, state.height);

    // Background gradient (faint nebula)
    // We can do this with a large radial gradient tied to camera pos for parallax if desired
    // For now simple static center glow
    const grad = ctx.createRadialGradient(state.width / 2, state.height / 2, 0, state.width / 2, state.height / 2, state.width);
    grad.addColorStop(0, "rgba(0, 20, 40, 0.2)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, state.width, state.height);

    // 2. Project and Draw Stars
    // Sort stars by Z-index (fake depth sorting) for proper layering if we had opacity overlap
    // Note: Since we are moving camera x/y, we need to offset star positions relative to camera

    // Optimization: Don't sort every frame if not critical, but for depth effect it's nice.
    // For 5000 stars it's fast enough.

    const cx = state.width / 2;
    const cy = state.height / 2;
    const fov = CONFIG.fov + state.camera.z;

    // Clamp zoom
    if (fov < 50) state.camera.z = 50 - CONFIG.fov;

    // Track closest star for hover
    let closestStar = null;
    let minHoverDist = 20; // Hitbox radius

    for (const star of state.stars) {
        // Relative Position
        const rx = star.x - state.camera.x;
        const ry = star.y - state.camera.y;
        const rz = star.z;

        // 3D Projection
        let scale = fov / rz;

        if (scale < 0) continue; // Behind camera

        const screenX = cx + rx * scale;
        const screenY = cy + ry * scale;

        // Culling
        if (screenX < -10 || screenX > state.width + 10 || screenY < -10 || screenY > state.height + 10) continue;

        // Interaction Check (Mouse Hover)
        const dx = screenX - state.lastMouse.x;
        const dy = screenY - state.lastMouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Draw Star
        let size = star.size * scale;
        if (size < 0.5) size = 0.5; // Min visibility

        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();

        // Glow (only for big stars or close up)
        if (size > 2) {
            ctx.shadowBlur = size * 4;
            ctx.shadowColor = star.color;
            ctx.fill(); // re-fill for glow
            ctx.shadowBlur = 0; // reset
        }

        // Check closest
        if (dist < minHoverDist) {
            minHoverDist = dist;
            closestStar = { star, screenX, screenY, size };
        }
    }

    // Post-Render Layer: Draw Hover Overlay on top of all stars
    if (closestStar) {
        state.hoveredStar = closestStar.star;
        const { screenX, screenY, size } = closestStar;

        // Draw reticle
        ctx.strokeStyle = CONFIG.colors[5]; // Cyan
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size + 8, 0, Math.PI * 2);
        ctx.stroke();

        // Connecting line to label
        ctx.beginPath();
        ctx.moveTo(screenX + size + 8, screenY);
        ctx.lineTo(screenX + size + 25, screenY - 25);
        ctx.lineTo(screenX + size + 100, screenY - 25);
        ctx.stroke();

        // Label Background
        ctx.fillStyle = "rgba(0, 10, 20, 0.8)";
        ctx.fillRect(screenX + size + 25, screenY - 40, 120, 20);

        // Text
        ctx.fillStyle = "#fff";
        ctx.font = "12px Orbitron";
        ctx.fillText(state.hoveredStar.name, screenX + size + 30, screenY - 25);
    } else {
        state.hoveredStar = null;
    }

    // TARGET LOCK VISUAL (Main Screen)
    if (state.targetStar) {
        const star = state.targetStar;
        const rx = star.x - state.camera.x;
        const ry = star.y - state.camera.y;
        const rz = star.z;
        const scale = fov / rz;

        if (scale > 0) { // Screen side
            const screenX = cx + rx * scale;
            const screenY = cy + ry * scale;

            // Don't draw if WAY off screen to avoid confusion
            if (screenX > -100 && screenX < state.width + 100 && screenY > -100 && screenY < state.height + 100) {

                const size = 30 * (1 + 0.2 * Math.sin(Date.now() / 200)); // Pulsing size
                const angle = Date.now() / 1000; // Rotating

                ctx.strokeStyle = "#44ff44"; // Green Lock
                ctx.lineWidth = 2;

                ctx.save();
                ctx.translate(screenX, screenY);
                ctx.rotate(angle);

                // Draw Brackets
                const s = size;
                ctx.beginPath();
                ctx.moveTo(-s, -s / 2); ctx.lineTo(-s, -s); ctx.lineTo(-s / 2, -s); // Top Left
                ctx.moveTo(s, -s / 2); ctx.lineTo(s, -s); ctx.lineTo(s / 2, -s); // Top Right
                ctx.moveTo(-s, s / 2); ctx.lineTo(-s, s); ctx.lineTo(-s / 2, s); // Bottom Left
                ctx.moveTo(s, s / 2); ctx.lineTo(s, s); ctx.lineTo(s / 2, s); // Bottom Right
                ctx.stroke();

                ctx.restore();

                // Label
                ctx.fillStyle = "#44ff44";
                ctx.textAlign = "center";

                // Name
                ctx.font = "bold 14px Orbitron";
                ctx.fillText(star.name, screenX, screenY + size + 20);

                // Status
                ctx.font = "10px Orbitron";
                ctx.fillText("TARGET LOCKED", screenX, screenY + size + 35);

                ctx.textAlign = "start"; // Reset
            }
        }
    }
}

// --- LOGIC HELPER ---
function updateHUD() {
    document.getElementById('coord-x').innerText = state.camera.x.toFixed(2);
    document.getElementById('coord-y').innerText = state.camera.y.toFixed(2);
    document.getElementById('zoom-level').innerText = ((CONFIG.fov + state.camera.z) / CONFIG.fov).toFixed(2) + "x";

    if (state.hoveredStar) {
        document.getElementById('star-info-panel').classList.remove('hidden');
        document.getElementById('info-name').innerText = state.hoveredStar.name || "UNKNOWN OBJ";
        // Fake calculation for type based on color
        document.getElementById('info-type').innerText = "CLASS M";
        // Fake distance
        document.getElementById('info-dist').innerText = Math.floor(state.hoveredStar.z) + " LY";
    } else if (!state.targetStar) {
        document.getElementById('star-info-panel').classList.add('hidden');
    }
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = now.toISOString().split('T')[1].split('.')[0];
}

// --- INPUT HANDLING ---

function onMouseDown(e) {
    stopTour(); // User takes control
    state.isDragging = true;
    state.lastMouse.x = e.clientX;
    state.lastMouse.y = e.clientY;
    canvas.style.cursor = 'grabbing';
}

function onMouseUp() {
    state.isDragging = false;
    canvas.style.cursor = 'default';
}

function onMouseMove(e) {
    // Update raw mouse for hover check
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Dragging Logic
    if (state.isDragging) {
        const dx = e.clientX - state.lastMouse.x;
        const dy = e.clientY - state.lastMouse.y;

        // Adjust camera
        // Pan speed relative to zoom? For now constant
        state.camera.x -= dx * CONFIG.panSpeed;
        state.camera.y -= dy * CONFIG.panSpeed;

    }

    state.lastMouse.x = mx;
    state.lastMouse.y = my;
}

function onWheel(e) {
    stopTour(); // User takes control
    e.preventDefault();
    const zoomDir = Math.sign(e.deltaY);
    // Move Z
    state.camera.z -= zoomDir * 20;
}

// --- SEARCH & NAV ---
function onSearch() {
    const query = document.getElementById('star-search').value.trim().toLowerCase();
    const msg = document.getElementById('search-msg');
    msg.innerText = "SCANNING...";
    msg.style.color = "#00f3ff";

    const found = state.stars.find(s => s.name && s.name.toLowerCase() === query);

    if (found) {
        msg.innerText = "TARGET LOCKED: " + found.name;
        msg.style.color = "#44ff44";
        flyTo(found);
    } else {
        setTimeout(() => {
            msg.innerText = "TARGET NOT FOUND";
            msg.style.color = "#ff3333";
        }, 500);
    }
}

function flyTo(star) {
    state.targetStar = star;
    // Animate camera.x/y to star.x/y
    // We can use a simple lerp in the loop update
}

function updateCameraTransition() {
    if (state.targetStar) {
        const tx = state.targetStar.x;
        const ty = state.targetStar.y;

        // Lerp
        const speed = 0.05;
        state.camera.x += (tx - state.camera.x) * speed;
        state.camera.y += (ty - state.camera.y) * speed;

        // Also Auto Zoom in?
        const tZ = 200; // Target extra zoom
        state.camera.z += (tZ - state.camera.z) * speed;

        // Check completion
        if (Math.abs(tx - state.camera.x) < 1 && Math.abs(ty - state.camera.y) < 1) {
            state.targetStar = null; // Arrived

            // If Touring, wait then go to next
            if (state.isTouring) {
                setTimeout(() => {
                    if (state.isTouring) flyToRandom();
                }, 2000);
            }
        }
    }
}

// --- TOUR MODE ---

function toggleTour() {
    state.isTouring = !state.isTouring;
    const btn = document.getElementById('tour-btn');

    if (state.isTouring) {
        btn.innerText = "AUTOPILOT: ON";
        btn.classList.add('active');
        flyToRandom();
    } else {
        btn.innerText = "AUTOPILOT: OFF";
        btn.classList.remove('active');
        state.targetStar = null; // Stop current flight
    }
}

function stopTour() {
    if (state.isTouring) {
        toggleTour(); // Turn off
    }
}

function flyToRandom() {
    // Pick a random named star if possible, else random
    // Prefer named stars for tour
    const namedStars = state.stars.filter(s => STAR_NAMES.includes(s.name));
    const target = namedStars.length > 0
        ? namedStars[Math.floor(Math.random() * namedStars.length)]
        : state.stars[Math.floor(Math.random() * state.stars.length)];

    flyTo(target);

    // Update msg
    const msg = document.getElementById('search-msg');
    msg.innerText = "AUTOPILOT: " + target.name;
    msg.style.color = "#00f3ff";
}

function updateRadar() {
    const w = radarCanvas.width;
    const h = radarCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const range = 2000; // Radar range in universe units
    const scale = (w / 2) / range;

    // Clear
    radarCtx.clearRect(0, 0, w, h);

    // Draw Grid
    radarCtx.strokeStyle = "rgba(0, 243, 255, 0.2)";
    radarCtx.lineWidth = 1;
    radarCtx.beginPath(); radarCtx.arc(cx, cy, w / 3, 0, Math.PI * 2); radarCtx.stroke();
    radarCtx.beginPath(); radarCtx.arc(cx, cy, w / 6, 0, Math.PI * 2); radarCtx.stroke();

    // Crosshair
    radarCtx.beginPath(); radarCtx.moveTo(cx - 10, cy); radarCtx.lineTo(cx + 10, cy); radarCtx.stroke();
    radarCtx.beginPath(); radarCtx.moveTo(cx, cy - 10); radarCtx.lineTo(cx, cy + 10); radarCtx.stroke();

    // Draw Stars
    for (const star of state.stars) {
        const dx = star.x - state.camera.x;
        const dy = star.y - state.camera.y;

        // Only if within range
        if (Math.abs(dx) < range && Math.abs(dy) < range) {
            const px = cx + dx * scale;
            const py = cy + dy * scale;

            radarCtx.fillStyle = "rgba(255, 255, 255, 0.5)";
            radarCtx.fillRect(px, py, 1.5, 1.5);
        }
    }

    // Hover Highlight
    if (state.hoveredStar) {
        const dx = state.hoveredStar.x - state.camera.x;
        const dy = state.hoveredStar.y - state.camera.y;
        const px = cx + dx * scale;
        const py = cy + dy * scale;

        // Clamp for drawing indicator if off screen? No, just draw if close
        if (Math.sqrt(dx * dx + dy * dy) < range) {
            radarCtx.strokeStyle = "#ffffff";
            radarCtx.strokeRect(px - 3, py - 3, 6, 6);
        }
    }

    // TARGET INDICATOR (Directional)
    if (state.targetStar) {
        const dx = state.targetStar.x - state.camera.x;
        const dy = state.targetStar.y - state.camera.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const angle = Math.atan2(dy, dx);

        // If within range, show crosshair
        radarCtx.fillStyle = "#00f3ff";

        if (dist < range) {
            const px = cx + dx * scale;
            const py = cy + dy * scale;

            // Draw Target Blip
            radarCtx.beginPath(); radarCtx.arc(px, py, 4, 0, Math.PI * 2); radarCtx.fill();

            // Pulse Ring
            const pulse = (Date.now() % 1000) / 50;
            radarCtx.strokeStyle = `rgba(0, 243, 255, ${1 - pulse / 20})`;
            radarCtx.beginPath(); radarCtx.arc(px, py, pulse, 0, Math.PI * 2); radarCtx.stroke();

        } else {
            // Off Radar - Arrow on edge
            const edgeR = w / 2 - 10;
            const ex = cx + Math.cos(angle) * edgeR;
            const ey = cy + Math.sin(angle) * edgeR;

            radarCtx.beginPath();
            radarCtx.arc(ex, ey, 5, 0, Math.PI * 2);
            radarCtx.fill();

            // Pointer
            // ...
        }
    }
}

// Boot
init();
