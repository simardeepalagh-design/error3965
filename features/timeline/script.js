// MISSION DATA REPOSITORY
const MISSIONS_DATA = {
    apollo: [
        { year: "1961", title: "Moon Goal Announced", desc: "JFK commits the USA to landing humans on the Moon.", icon: "🗣️" },
        { year: "1968", title: "Apollo 8 Orbits Moon", desc: "First crewed lunar orbit mission.", icon: "🌗" },
        { year: "1969", title: "Launch", desc: "Saturn V launches Apollo 11 from Kennedy Space Center.", icon: "🚀" },
        { year: "1969", title: "Lunar Landing", desc: "First humans land on the Moon using the Eagle module.", icon: "🦅" },
        { year: "1969", title: "First Moonwalk", desc: "Neil Armstrong takes the historic first steps.", icon: "👣" },
        { year: "1969", title: "Return to Earth", desc: "Crew safely returns, fulfilling the national goal.", icon: "🌊" }
    ],
    voyager: [
        { year: "1977", title: "Launch", desc: "Voyager 1 launched from Cape Canaveral.", icon: "🚀" },
        { year: "1979", title: "Jupiter Flyby", desc: "First close images of Jupiter's atmosphere and moons.", icon: "🪐" },
        { year: "1980", title: "Saturn Flyby", desc: "Discovers new moons and details of Saturn's rings.", icon: "🪐" },
        { year: "1990", title: "Pale Blue Dot", desc: "Iconic image of Earth taken from 6 billion km away.", icon: "📸" },
        { year: "2012", title: "Interstellar Space", desc: "First human-made object to enter interstellar space.", icon: "🌌" },
        { year: "Present", title: "Still Operating", desc: "Continuing to send data as the farthest human object.", icon: "📡" }
    ],
    hubble: [
        { year: "1990", title: "Launch", desc: "Deployed by Space Shuttle Discovery.", icon: "🚀" },
        { year: "1993", title: "First Servicing", desc: "Mission to correct the telescope's flawed mirror.", icon: "🔧" },
        { year: "1995", title: "Pillars of Creation", desc: "Captures one of the most famous astronomy images.", icon: "🔭" },
        { year: "2009", title: "Final Servicing", desc: "Last astronaut repair mission to upgrade instruments.", icon: "👨‍🚀" },
        { year: "Present", title: "Active Science", desc: "Continues to make major astronomical discoveries.", icon: "✨" }
    ],
    iss: [
        { year: "1998", title: "First Module", desc: "Zarya module launched, beginning construction.", icon: "🛰️" },
        { year: "2000", title: "First Crew", desc: "Permanent human presence in space begins.", icon: "👨‍🚀" },
        { year: "2011", title: "Assembly Completed", desc: "Major construction of the station finished.", icon: "🏗️" },
        { year: "2020", title: "Commercial Crew", desc: "SpaceX Crew Dragon begins transporting astronauts.", icon: "🐉" },
        { year: "Present", title: "Active Research", desc: "The largest human-made structure in space.", icon: "🔬" }
    ],
    curiosity: [
        { year: "2011", title: "Launch", desc: "Launched aboard an Atlas V rocket.", icon: "🚀" },
        { year: "2012", title: "Mars Landing", desc: "Successfully lands in Gale Crater using sky crane.", icon: "🔴" },
        { year: "2013", title: "Water Evidence", desc: "Finds chemical evidence of ancient water conditions.", icon: "💧" },
        { year: "2015", title: "Methane Detection", desc: "Detects spikes of methane in Martian atmosphere.", icon: "💨" },
        { year: "Present", title: "Ongoing Science", desc: "Continues climbing Mount Sharp and analyzing soil.", icon: "🤖" }
    ],
    jwst: [
        { year: "2021", title: "Launch", desc: "Launched on an Ariane 5 rocket from French Guiana.", icon: "🚀" },
        { year: "2022", title: "Deployment Complete", desc: "Tennis-court sized sunshield and mirrors fully deployed.", icon: "🛡️" },
        { year: "2022", title: "First Images", desc: "Deepest and sharpest infrared images of the universe released.", icon: "🖼️" },
        { year: "Present", title: "Science Operations", desc: "Studying the first galaxies and exoplanet atmospheres.", icon: "🔭" }
    ],
    artemis: [
        { year: "2022", title: "Launch", desc: "SLS rocket launches the Orion spacecraft.", icon: "🚀" },
        { year: "2022", title: "Lunar Flyby", desc: "Orion performs close flyby of the Moon.", icon: "🌑" },
        { year: "2022", title: "Distance Record", desc: "Travels farther than any spacecraft built for humans.", icon: "📏" },
        { year: "2022", title: "Earth Return", desc: "Successful splashdown in the Pacific Ocean.", icon: "🌊" },
        { year: "Future", title: "Artemis Program", desc: "Preparing for the first woman and person of color on the Moon.", icon: "👩‍🚀" }
    ]
};

// GLOBAL STATE
let currentMissionData = [];
let currentMissionIndex = -1;
let isLaunched = false;
let particleInterval, timerInterval;

// CONFIG
const ROCKET_START_X = 10; // Left %
const ROCKET_END_X = 60;   // Left %
const ROCKET_START_Y = 10; // Bottom %
const ROCKET_END_Y = 85;   // Bottom %

// DOM ELEMENTS (Timeline Page Only)
const elements = {
    rocket: document.getElementById('rocket'),
    flame: document.getElementById('flame'),
    progressBar: document.getElementById('progress-bar'),
    missionCard: document.getElementById('mission-card'),
    timelineMarkers: document.getElementById('timeline-markers'),
    particles: document.getElementById('particles-container'),
    stars: document.querySelector('.stars'),
    btnInit: document.getElementById('btn-init'),
    btnNext: document.getElementById('btn-next'),
    elAlti: document.getElementById('altimeter'),
    elVel: document.getElementById('velocity'),
    elCount: document.getElementById('mission-count'),
    elTimer: document.getElementById('timer'),
    missionTitle: document.getElementById('mission-title'),
    missionYear: document.getElementById('mission-year'),
    missionDesc: document.getElementById('mission-desc'),
    missionAgency: document.getElementById('mission-agency')
};

// INITIALIZATION
window.addEventListener('DOMContentLoaded', () => {
    const missionId = document.body.dataset.mission;

    if (missionId && MISSIONS_DATA[missionId]) {
        // We are on a specific mission page
        currentMissionData = MISSIONS_DATA[missionId];
        initTimeline();
    } else {
        // We are on the Dashboard or unknown
        console.log("Dashboard loaded or no mission data found.");
        initDashboardEffects();
    }
});

function initDashboardEffects() {
    // simple parallax on mouse move for dashboard
    document.addEventListener('mousemove', (e) => {
        const stars = document.querySelector('.stars');
        if (stars) {
            const x = (window.innerWidth - e.pageX * 2) / 100;
            const y = (window.innerHeight - e.pageY * 2) / 100;
            stars.style.transform = `translateX(${x}px) translateY(${y}px)`;
        }
    });
}

function initTimeline() {
    createTimelineMarkers(); // Initially position markers diagonally

    // Set Initial Rocket Pos
    if (elements.rocket) {
        elements.rocket.style.left = `${ROCKET_START_X}%`;
        elements.rocket.style.bottom = `${ROCKET_START_Y}%`;
    }

    // Attach event listeners
    if (elements.btnInit) elements.btnInit.addEventListener('click', initiateLaunch);
    if (elements.btnNext) elements.btnNext.addEventListener('click', nextMission);

    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp") {
            if (!isLaunched) {
                initiateLaunch();
            } else if (elements.btnNext && !elements.btnNext.disabled) {
                nextMission();
            }
        }
    });
}

function createTimelineMarkers() {
    if (!elements.timelineMarkers) return;

    elements.timelineMarkers.innerHTML = '';
    currentMissionData.forEach((mission, index) => {
        const marker = document.createElement('div');
        marker.classList.add('timeline-marker');

        // Calculate position based on diagonal path
        const step = currentMissionData.length > 1 ? index / (currentMissionData.length - 1) : 0;

        const posX = ROCKET_START_X + (step * (ROCKET_END_X - ROCKET_START_X));
        const posY = ROCKET_START_Y + (step * (ROCKET_END_Y - ROCKET_START_Y));

        marker.style.left = `${posX}%`; // Center the dot
        marker.style.bottom = `${posY}%`;

        // Adjust ID
        marker.id = `marker-${index}`;

        // Label logic - Position relative to dot
        const label = document.createElement('div');
        label.classList.add('marker-label');
        label.innerText = mission.year;
        // Move label left or right to avoid overlapping the line?
        // Let's put label below or to side.
        label.style.marginLeft = "15px";
        marker.appendChild(label);

        elements.timelineMarkers.appendChild(marker);
    });
}

function initiateLaunch() {
    if (isLaunched) return;
    isLaunched = true;

    elements.btnInit.disabled = true;
    elements.btnInit.innerText = "LAUNCH INITIATED";
    elements.flame.style.opacity = '1';

    let count = 3;
    const countdown = setInterval(() => {
        if (count > 0) {
            elements.btnInit.innerText = `IGNITION IN ${count}...`;
            count--;
        } else {
            clearInterval(countdown);
            elements.btnInit.innerText = "LIFTOFF";
            startAscent();
        }
    }, 1000);
}

function startAscent() {
    elements.btnNext.disabled = false;
    startMissionTimer();
    startParticles();
    nextMission();
}

function nextMission() {
    if (currentMissionIndex >= currentMissionData.length - 1) return;

    currentMissionIndex++;
    const mission = currentMissionData[currentMissionIndex];

    updateMarkers();

    // Diagonal Movement Logic
    const step = currentMissionData.length > 1 ? currentMissionIndex / (currentMissionData.length - 1) : 1;

    const posX = ROCKET_START_X + (step * (ROCKET_END_X - ROCKET_START_X));
    const posY = ROCKET_START_Y + (step * (ROCKET_END_Y - ROCKET_START_Y));

    // VISUAL BOOST: Trigger shake & big flame
    if (elements.rocket) {
        elements.rocket.classList.add('boosting');
        elements.rocket.style.left = `${posX}%`;
        elements.rocket.style.bottom = `${posY}%`;

        // Remove boost after travel time (matching CSS transition 1.5s)
        setTimeout(() => {
            elements.rocket.classList.remove('boosting');
        }, 1500);
    }

    // Progress Bar (Disabled/Hidden in new CSS, but logic remains benign)
    if (elements.progressBar) elements.progressBar.style.height = `${posY}%`;

    // Parallax background (Diagonal Scroll)
    const bgPos = currentMissionIndex * 50;
    elements.stars.style.backgroundPosition = `-${bgPos}px ${bgPos}px, ${40 - bgPos}px ${60 + bgPos}px, ${130 - bgPos}px ${270 + bgPos}px`;

    // Create massive particle trail during boost
    boostParticles();

    elements.elCount.innerText = `${currentMissionIndex + 1}/${currentMissionData.length}`;
    randomizeTelemetry();

    // Card Update
    elements.missionCard.classList.remove('active');
    setTimeout(() => {
        elements.missionTitle.innerText = mission.title;
        elements.missionYear.innerText = mission.year;
        elements.missionDesc.innerText = mission.desc;
        elements.missionAgency.innerHTML = mission.icon || "🚀";
        elements.missionAgency.style.fontSize = "2rem";

        elements.missionCard.classList.add('active');

        if (currentMissionIndex === currentMissionData.length - 1) {
            elements.btnNext.innerText = "MISSION COMPLETE";
            elements.btnNext.disabled = true;
            elements.flame.style.opacity = '0.5';
        }
    }, 1200); // Wait for rocket travel
}

function updateMarkers() {
    for (let i = 0; i < currentMissionData.length; i++) {
        const marker = document.getElementById(`marker-${i}`);
        if (!marker) continue;

        if (i < currentMissionIndex) {
            marker.classList.add('passed');
            marker.classList.remove('active');
        } else if (i === currentMissionIndex) {
            marker.classList.add('active');
            marker.classList.remove('passed');
        } else {
            marker.classList.remove('active', 'passed');
        }
    }
}

// PARTICLES
function startParticles() {
    if (!elements.particles) return;
    // Faster creation for engine trail
    particleInterval = setInterval(createParticle, 30);
}

function createParticle() {
    if (!elements.particles || !elements.rocket) return;
    const p = document.createElement('div');
    p.classList.add('particle');

    const rRect = elements.rocket.getBoundingClientRect();
    const cRect = elements.particles.getBoundingClientRect();

    // Logic for diagonal trail
    // Rocket rotated 45deg. Engine is bottom-left relative to visual center?
    // Actually CSS rotation rotates the div.
    // The "bottom" of the rocket is engine.
    // If Rotated 45deg clockwise, bottom becomes bottom-left visual.

    // Center point of rocket
    const cx = rRect.left + rRect.width / 2 - cRect.left;
    const cy = rRect.top + rRect.height / 2 - cRect.top;

    // Simple visual tweak:
    const ex = cx - 15;
    const ey = cy + 15;

    p.style.left = `${ex}px`;
    p.style.top = `${ey}px`;

    const spread = (Math.random() - 0.5) * 10;

    // Color space particles (Blue/Cyan/White)
    const hue = Math.floor(180 + Math.random() * 60); // 180-240 (Cyan/Blue)
    p.style.background = `hsla(${hue}, 100%, 70%, 0.8)`;
    p.style.boxShadow = `0 0 5px hsla(${hue}, 100%, 70%, 1)`;

    elements.particles.appendChild(p);

    // Animate trail AWAY from trajectory
    // Trajectory is Top-Right. Particles fall Bottom-Left.

    const anim = p.animate([
        { transform: `translate(${spread}px, 0) scale(1)`, opacity: 0.8 },
        { transform: `translate(${spread - 50}px, 50px) scale(0)`, opacity: 0 }
    ], { duration: 1000 + Math.random() * 500, easing: 'linear' });

    anim.onfinish = () => p.remove();
}

function boostParticles() {
    for (let i = 0; i < 30; i++) setTimeout(createParticle, i * 5);
}

// TELEMETRY & TIMER
function randomizeTelemetry() {
    if (!elements.elVel || !elements.elAlti) return;
    let v = 5000 + Math.floor(Math.random() * 20000);
    let a = 1000 + (currentMissionIndex * 5000);

    // Single burst of updates then stop, to be cleaner
    let updates = 0;
    const interval = setInterval(() => {
        v += (Math.random() * 100 - 50);
        elements.elVel.innerText = `${Math.floor(v)} M/S`;
        a += 50;
        elements.elAlti.innerText = `${Math.floor(a)} KM`;
        updates++;
        if (updates > 20) clearInterval(interval);
    }, 100);
}

function startMissionTimer() {
    if (timerInterval) clearInterval(timerInterval);
    let sec = 0;
    timerInterval = setInterval(() => {
        sec++;
        const d = new Date(0);
        d.setSeconds(sec);
        if (elements.elTimer) elements.elTimer.innerText = d.toISOString().substr(11, 8);
    }, 1000);
}
