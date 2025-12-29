const canvas = document.getElementById("rain");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".hero-card");

// -----------------------------
// Canvas setup
// -----------------------------
function resizeCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function getHeroBounds() {
	const rect = hero.getBoundingClientRect();
	return rect; // y-position of the top edge
}

const splashes = [];

// -----------------------------
// Mouse umbrella
// -----------------------------
const mouse = {
	x: null,
	y: null,
	radius: 60, // umbrella size
};

window.addEventListener("mousemove", (e) => {
	mouse.x = e.clientX;
	mouse.y = e.clientY;
});

function distance(x1, y1, x2, y2) {
	return Math.hypot(x2 - x1, y2 - y1);
}

// -----------------------------
// Raindrop settings
// -----------------------------
const drops = [];
const DROP_COUNT = 1000;

for (let i = 0; i < DROP_COUNT; i++) {
	drops.push({
		x: Math.random() * canvas.width,
		y: Math.random() * canvas.height,
		speed: Math.random() * 10 + 1,
		size: Math.random() * 1.5 + 1,
		rolling: false,
	});
}

// -----------------------------
// Draw a drop
// -----------------------------
function drawDrop(x, y, size, rolling = false, angle = 0) {
	ctx.beginPath();
	if (rolling) {
		// Squashed ellipse for rolling effect
		const width = size;
		const height = size;
		ctx.ellipse(x, y, width, height, angle, 0, 2 * Math.PI);
	} else {
		// Normal teardrop
		ctx.arc(x, y, size, 0, Math.PI, false); // top arc
		ctx.quadraticCurveTo(x, y, x, y - size * 3); // pointy bottom
	}
	ctx.closePath();
	ctx.fill();
}

// -----------------------------
// Animation loop
// -----------------------------
function drawRain() {
	const heroBounds = getHeroBounds();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "rgba(99, 166, 197, 0.25)";
	ctx.shadowBlur = 6;
	ctx.shadowColor = "rgba(120, 200, 255, 0.4)";

	for (let drop of drops) {
		// Check if drop hits the hero card top
		if (drop.y >= heroBounds.top && drop.y - drop.speed < heroBounds.top && (drop.x > heroBounds.left && drop.x < heroBounds.right)) {
			// Create a splash
			splashes.push({
				x: drop.x,
				y: heroBounds.top,
				radius: 2 + Math.random() * 2,
				life: 5, // frames until fade
			});

			// Reset drop
			drop.y = -drop.size * 4;
			drop.x = Math.random() * canvas.width;
		}
		// -----------------------------
		// Umbrella interaction (top only)
		// -----------------------------
		drop.rolling = false; // default

		if (mouse.x !== null) {
			const d = distance(drop.x, drop.y, mouse.x, mouse.y);

			if (d < mouse.radius && drop.y < mouse.y) {
				drop.rolling = true;

				const angle = Math.atan2(drop.y - mouse.y, drop.x - mouse.x);

				// Snap to umbrella surface
				const surfaceX = mouse.x + Math.cos(angle) * mouse.radius;
				const surfaceY = mouse.y + Math.sin(angle) * mouse.radius;

				drop.x = surfaceX;
				drop.y = surfaceY;

				// Slide along tangent (roll off)
				drop.x += Math.cos(angle + Math.PI / 2) * 1.5;
				drop.y += Math.sin(angle + Math.PI / 2) * 1.5;

				// Draw rolling drop
				drawDrop(drop.x, drop.y, drop.size, true, angle + Math.PI / 2);
			}
		}

		// -----------------------------
		// Normal falling
		// -----------------------------
		if (!drop.rolling) {
			drop.y += drop.speed;
			drawDrop(drop.x, drop.y, drop.size);
		}

		// Reset when off screen
		if (drop.y > canvas.height) {
			drop.y = -drop.size * 4;
			drop.x = Math.random() * canvas.width;
		}
	}

	for (let i = splashes.length - 1; i >= 0; i--) {
		const s = splashes[i];
		ctx.beginPath();
		ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
		ctx.fillStyle = `rgba(99, 166, 197, ${s.life / 15})`;
		ctx.fill();

		s.radius += 0.5; // splash expands
		s.life -= 1; // fade out

		if (s.life <= 0) {
			splashes.splice(i, 1);
		}
	}

	requestAnimationFrame(drawRain);
}

drawRain();
