const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(width = 1000, reduced = false) {
  const handlers = {};
  const ids = ['tictoon', 'roots', 'jeju'];
  const buttons = ids.flatMap(id => Array.from({ length: 2 }, () => ({ dataset: { project: id }, attrs: {}, classList: { toggle() {} }, setAttribute(k,v){this.attrs[k]=v}, addEventListener(k,fn){this[k]=fn} })));
  const satellites = ids.map(() => ({ style: {}, offsetWidth: 180, offsetHeight: 150, getBoundingClientRect(){ return { width: 180, height: 150 }; } }));
  const scene = { classList: { add(){}, remove(){} }, querySelectorAll: () => satellites, getBoundingClientRect: () => ({ width, height: 600 }), matches: () => false, contains: () => false, setPointerCapture(){}, addEventListener(k,fn){handlers[k]=fn} };
  const heading={replaceChildren(...nodes){this.nodes=nodes}},description={},count={},year={},projectLink={};
  const document = { activeElement: null, querySelectorAll: () => buttons, querySelector: key => ({'.orbit-scene':scene,'#detail-heading':heading,'#detail-description':description,'#detail-count':count,'#year':year,'#project-link':projectLink}[key]), createTextNode: text => ({textContent:text}), createElement: () => ({}) };
  const context = {document, window:{matchMedia:()=>({matches:reduced}),addEventListener(){}},requestAnimationFrame(fn){ context.frame=fn },setTimeout(){},Date,Math};
  vm.runInNewContext(fs.readFileSync('script.js','utf8'),context);
  return {buttons,satellites,handlers,heading,count,context,projectLink};
}

test('project selection synchronizes cards and project description', () => {
  const {buttons,heading,count}=setup();
  buttons.find(b=>b.dataset.project==='roots').click();
  assert.equal(heading.nodes[0].textContent.trim(),'뿌리');
  assert.equal(count.textContent,'02 / 03');
  for(const button of buttons) assert.equal(button.attrs['aria-pressed'],String(button.dataset.project==='roots'));
});
test('horizontal trackpad motion moves the orbit, vertical scrolling is not blocked', () => {
  const {handlers,satellites,context}=setup();
  context.frame(0); const before=satellites[0].style.transform;
  let prevented=false; handlers.wheel({deltaX:30,deltaY:1,preventDefault(){prevented=true}});
  assert.ok(prevented); assert.notEqual(satellites[0].style.transform,before);
  prevented=false; handlers.wheel({deltaX:1,deltaY:30,preventDefault(){prevented=true}}); assert.equal(prevented,false);
});
test('one project appears in front of the sun and two behind',()=>{
  const {satellites,context}=setup(390); context.frame(0);
  assert.equal(satellites.filter(x=>x.style.zIndex==='12').length,1);
  assert.equal(satellites.filter(x=>x.style.zIndex==='4').length,2);
});
test('reduced motion stops automatic rotation',()=>{
  const {satellites,context}=setup(390,true); context.frame(0);const before=satellites[0].style.transform;context.frame(1000);assert.equal(satellites[0].style.transform,before);
});
test('dragging horizontally rotates the orbit',()=>{
  const {handlers,satellites,context}=setup();context.frame(0);const before=satellites[0].style.transform;
  handlers.pointerdown({button:0,clientX:100,clientY:100});
  handlers.pointermove({clientX:135,clientY:102,pointerId:1});
  assert.notEqual(satellites[0].style.transform,before);
  handlers.pointerup();
});

test('each project opens its matching site',()=>{
  const {buttons,projectLink}=setup();
  for(const [id,url] of [['tictoon','https://tictoon.app/'],['roots','https://our-roots-global.web.app/'],['jeju','https://welcome-jeju.com/']]) { buttons.find(b=>b.dataset.project===id).click(); assert.equal(projectLink.href,url); }
});
