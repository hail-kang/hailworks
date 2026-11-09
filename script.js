const projects = {
  tictoon: { name: '틱툰', english: 'TicToon', description: '누구나 이야기를 만들고 나누는 웹툰 플랫폼.', count: '01 / 03', url: 'https://tictoon.app/' },
  roots: { name: '뿌리', english: 'Our Roots', description: '가족의 이야기를 가계도로 연결하고 함께 만들어가는 서비스.', count: '02 / 03', url: 'https://our-roots-global.web.app/' },
  jeju: { name: '웰컴제주', english: 'Welcome Jeju', description: '제주의 장소와 여행 정보를 새롭게 발견하는 서비스.', count: '03 / 03', url: 'https://welcome-jeju.com/' },
};
const buttons = [...document.querySelectorAll('[data-project]')];
const heading = document.querySelector('#detail-heading');
const description = document.querySelector('#detail-description');
const count = document.querySelector('#detail-count');
const projectLink = document.querySelector('#project-link');
function selectProject(id) {
  const project = projects[id];
  if (!project) return;
  buttons.forEach(button => {
    const selected = button.dataset.project === id;
    button.setAttribute('aria-pressed', String(selected));
    button.classList.toggle('is-selected', selected);
  });
  heading.replaceChildren(document.createTextNode(project.name + ' '), Object.assign(document.createElement('span'), { textContent: project.english }));
  description.textContent = project.description;
  count.textContent = project.count;
  projectLink.href = project.url;
}
buttons.forEach(button => button.addEventListener('click', () => selectProject(button.dataset.project)));
document.querySelector('#year').textContent = new Date().getFullYear();

// Keep each project upright while its center travels around the same ellipse.
const scene = document.querySelector('.orbit-scene');
const satellites = [...scene.querySelectorAll('.satellite')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let angle = -Math.PI / 2;
let previousTime = null;
let dragging = false;
let moved = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let pendingDrag = false;
let suppressClick = false;
function renderOrbit() {
  const bounds = scene.getBoundingClientRect();
  const narrow = bounds.width <= 700;
  const first = satellites[0].getBoundingClientRect();
  const radiusX = Math.max(0, (bounds.width - first.width) * (narrow ? 0.47 : 0.45));
  const radiusY = Math.max(0, (bounds.height - first.height) * (narrow ? 0.38 : 0.34));
  const depth = satellites.map((_, index) => Math.sin(angle + index * Math.PI * 2 / satellites.length));
  const frontIndex = depth.indexOf(Math.max(...depth));
  satellites.forEach((satellite, index) => {
    const orbitAngle = angle + index * Math.PI * 2 / satellites.length;
    const x = bounds.width / 2 + Math.cos(orbitAngle) * radiusX - satellite.offsetWidth / 2;
    const frontLift = narrow ? Math.max(0, Math.sin(orbitAngle)) * 42 : 0;
    const y = bounds.height * (narrow ? 0.46 : 0.5) + Math.sin(orbitAngle) * radiusY - satellite.offsetHeight / 2 - frontLift;
    satellite.style.transform = `translate(${x}px, ${y}px) rotate(${Math.sin(orbitAngle) * 5}deg)`;
    satellite.style.zIndex = index === frontIndex ? "12" : "4";
  });
}
function tick(time) {
  const paused = dragging || scene.matches(':hover') || scene.contains(document.activeElement);
  if (previousTime !== null && !paused && !reducedMotion.matches) angle += Math.min(time - previousTime, 50) * 0.00012;
  previousTime = time;
  renderOrbit();
  requestAnimationFrame(tick);
}
scene.addEventListener('pointerdown', event => {
  if (event.button !== 0) return;
  pendingDrag = true; moved = false; startX = lastX = event.clientX; startY = event.clientY;
});
scene.addEventListener('pointermove', event => {
  if (!pendingDrag) return;
  const dx = event.clientX - startX, dy = event.clientY - startY;
  if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
    dragging = true; moved = true;
    scene.setPointerCapture(event.pointerId);
    scene.classList.add('is-dragging');
  }
  if (dragging) { angle += (event.clientX - lastX) * 0.009; renderOrbit(); }
  lastX = event.clientX;
});
function endDrag() {
  if (moved) { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }
  pendingDrag = false; dragging = false; scene.classList.remove('is-dragging');
}
scene.addEventListener('pointerup', endDrag);
scene.addEventListener('pointercancel', endDrag);
scene.addEventListener('click', event => {
  if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
}, true);
scene.addEventListener('wheel', event => {
  if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) || Math.abs(event.deltaX) < 0.5) return;
  event.preventDefault();
  angle += event.deltaX * 0.006;
  renderOrbit();
}, { passive: false });
window.addEventListener('resize', renderOrbit);
requestAnimationFrame(tick);
