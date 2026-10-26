
const $ = (id) => document.getElementById(id);

let target = null;
let countdownMode = 'tet';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
});

function pad(value) {
    return String(value).padStart(2, '0');
}

function updateCountdown() {
    if (target === null) {
        return;
    }

    const now = Date.now();

    if (now >= target && countdownMode === 'tet') {
        target = null;
        loadNextTetTimestamp();
        return;
    }

    const remaining = Math.max(0, target - now);

    const totalSeconds = Math.floor(remaining / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    $('days').textContent = String(days).padStart(3, '0');
    $('hours').textContent = pad(hours);
    $('minutes').textContent = pad(minutes);
    $('seconds').textContent = pad(seconds);

    $('tet-date').textContent =
        (countdownMode === 'tet' ? 'Mùng 1 Tết · ' : 'Ngày đã chọn · ') +
        dateFormatter.format(new Date(target));
}

async function loadNextTetTimestamp() {
    try {
        const nextTet = await window.tetApi.getNextTetTimestamp();
        if (countdownMode === 'tet') {
            target = nextTet;
            updateCountdown();
        }
    } catch (error) {
        console.error('Không thể lấy ngày Tết tiếp theo:', error);
    }
}

function toLocalDateInputValue(date) {
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    return `${year}-${month}-${day}`;
}

const dateInput = $('custom-date');
const today = new Date();
const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
dateInput.min = toLocalDateInputValue(tomorrow);
dateInput.value = dateInput.min;

$('apply-date').addEventListener('click', () => {
    const [year, month, day] = dateInput.value.split('-').map(Number);
    const selectedDate = new Date(year, month - 1, day);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    if (!dateInput.value || Number.isNaN(selectedDate.getTime()) || selectedDate <= todayStart) {
        $('date-error').textContent = 'Vui lòng chọn một ngày trong tương lai.';
        $('date-error').hidden = false;
        return;
    }

    countdownMode = 'custom';
    target = selectedDate.getTime();
    $('date-error').hidden = true;
    $('auto-date').hidden = false;
    updateCountdown();
});

$('auto-date').addEventListener('click', () => {
    countdownMode = 'tet';
    target = null;
    $('auto-date').hidden = true;
    $('date-error').hidden = true;
    $('tet-date').textContent = 'Đang tính ngày Tết...';
    loadNextTetTimestamp();
});

loadNextTetTimestamp();
setInterval(updateCountdown, 1000);

$('minimize').addEventListener('click', () => {
    window.tetApi.minimize();
});

$('close').addEventListener('click', () => {
    window.tetApi.close();
});

// Hiệu ứng pháo hoa bằng Canvas.
const canvas = $('fireworks');
const ctx = canvas.getContext('2d');

let particles = [];
let lastBurst = 0;

function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function burst() {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const x = width * (0.18 + Math.random() * 0.64);
    const y = height * (0.12 + Math.random() * 0.45);
    const colors = ['#ffd778', '#fff0b0', '#ff7569', '#ffe9a6'];

    for (let i = 0; i < 28; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.5 + Math.random() * 2;

        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 35 + Math.random() * 25,
            color: colors[Math.floor(Math.random() * colors.length)],
            radius: 1 + Math.random() * 1.5
        });
    }
}

function animateFireworks(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    ctx.clearRect(0, 0, width, height);

    if (time - lastBurst > 1500) {
        burst();
        lastBurst = time;
    }

    particles = particles.filter((p) => p.life > 0);

    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.012;
        p.life -= 1;

        ctx.globalAlpha = Math.min(1, p.life / 25);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(animateFireworks);
}

requestAnimationFrame(animateFireworks);
