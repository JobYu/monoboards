const KEY = 'kanban-v2';
function normalizeTodo(t) {
if (!Array.isArray(t.children)) t.children = [];
if (typeof t.subOpen !== 'boolean') t.subOpen = t.children.length > 0;
}
function sortSubtasksByDone(t) {
normalizeTodo(t);
if (!t.children.length) return;
const pending = t.children.filter(s => !s.done);
const done = t.children.filter(s => s.done);
t.children = [...pending, ...done];
}
function sortTodosByDone(p) {
if (!p.todos?.length) return;
const pending = p.todos.filter(t => !t.done);
const done = p.todos.filter(t => t.done);
p.todos = [...pending, ...done];
}
function taskDone(t) {
normalizeTodo(t);
let d = t.done ? 1 : 0;
for (const c of t.children) if (c.done) d++;
return d;
}
function taskTotal(t) {
normalizeTodo(t);
return 1 + t.children.length;
}
function projectDone(p) { return p.todos.reduce((s, t) => s + taskDone(t), 0); }
function projectTotal(p) { return p.todos.reduce((s, t) => s + taskTotal(t), 0); }
function normalizeProject(p) {
if (typeof p.archived !== 'boolean') p.archived = false;
if (p.archived) {
  if (!p.archivedAt) p.archivedAt = p.createdAt || new Date().toISOString();
} else {
  p.archivedAt = null;
}
}
function load() {
try {
  const s = JSON.parse(localStorage.getItem(KEY)) || { projects: [] };
  (s.projects || []).forEach(p => {
    normalizeProject(p);
    (p.todos || []).forEach(normalizeTodo);
    sortTodosByDone(p);
  });
  return s;
} catch { return { projects: [] }; }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
let state = load();
let boardView = 'main';

function sortedActiveProjects() {
return state.projects.filter(p => !p.archived).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
function sortedArchivedProjects() {
return state.projects.filter(p => p.archived).sort((a, b) => {
  const ta = a.archivedAt || '';
  const tb = b.archivedAt || '';
  if (ta !== tb) return ta.localeCompare(tb);
  return (a.order ?? 0) - (b.order ?? 0);
});
}
function resequence() {
sortedActiveProjects().forEach((p, i) => { p.order = i; });
}
function render() {
if (boardView === 'main') renderMainGrid();
else renderArchiveGrid();
renderBadge();
updateBoardViewChrome();
}
function renderBadge() {
const el = document.getElementById('headerBadge');
const list = sortedActiveProjects();
const n = list.length;
if (!n) { el.textContent = ''; return; }
const done = list.reduce((s, p) => s + projectDone(p), 0);
const total = list.reduce((s, p) => s + projectTotal(p), 0);
el.textContent = t('projectsCount', n) + ' \u00b7 ' + t('completedCount', done, total);
}
function setBoardView(v) {
boardView = v === 'archive' ? 'archive' : 'main';
render();
}
function toggleBoardArchiveView() {
setBoardView(boardView === 'main' ? 'archive' : 'main');
}
function updateBoardViewChrome() {
const addBtn = document.querySelector('.header-actions .btn-primary');
if (addBtn) addBtn.style.display = boardView === 'main' ? '' : 'none';
const grid = document.getElementById('grid');
if (grid) grid.classList.toggle('archive-layout', boardView === 'archive');
const fab = document.getElementById('archiveFab');
if (!fab) return;
const nArch = state.projects.filter(p => p.archived).length;
fab.title = boardView === 'main' ? t('openArchive') : t('closeArchive');
fab.innerHTML = boardView === 'main'
  ? `<span class="archive-fab-badge${nArch ? '' : ' hidden'}" id="archiveFabBadge">${nArch}</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>`
  : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
}
function pct(p) {
const tot = projectTotal(p);
return tot ? Math.round(projectDone(p) / tot * 100) : 0;
}

function renderMainGrid() {
const grid = document.getElementById('grid');
const projects = sortedActiveProjects();
if (!projects.length) {
  grid.innerHTML = `
    <div class="empty">
      <div class="empty-icon">\ud83d\udccb</div>
      <h2>${escHtml(t('emptyTitle'))}</h2>
      <p>${escHtml(t('emptyDesc'))}</p>
      <button class="btn btn-primary" style="margin-top:4px" onclick="openModal()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        ${escHtml(t('emptyButton'))}
      </button>
    </div>`;
  return;
}
grid.innerHTML = projects.map(p => cardHtml(p)).join('') + addCardHtml();
bindDrag();
}

function renderArchiveGrid() {
const grid = document.getElementById('grid');
const list = sortedArchivedProjects();
const toolbar = `
  <div class="archive-toolbar">
    <button type="button" class="btn btn-ghost" onclick="setBoardView('main')">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
      ${escHtml(t('backToBoard'))}
    </button>
    <h2 class="archive-toolbar-title">${escHtml(t('archiveTitle'))}</h2>
  </div>`;
if (!list.length) {
  grid.innerHTML = toolbar + `<div class="empty archive-empty"><p>${escHtml(t('archiveEmpty'))}</p></div>`;
  return;
}
grid.innerHTML = toolbar + `<div class="archive-cards-strip">${list.map(p => cardHtml(p)).join('')}</div>`;
}

function patchCard(pid) {
const p = state.projects.find(x => x.id === pid);
if (!p) { render(); return; }
const el = document.getElementById('card-' + pid);
if (!el) { render(); return; }
el.outerHTML = cardHtml(p);
renderBadge();
const next = document.getElementById('card-' + pid);
if (next && boardView === 'main') attachCardDrag(next);
}

function closeMenus() {
document.querySelectorAll('.more-menu.open').forEach(el => el.classList.remove('open'));
closeLangMenu();
}

function attachCardDrag(card) {
card.draggable = true;
card.addEventListener('dragstart', onDragStart);
card.addEventListener('dragend', onDragEnd);
card.addEventListener('dragover', onDragOver);
card.addEventListener('dragleave', onDragLeave);
card.addEventListener('drop', onDrop);
}
function bindDrag() {
document.querySelectorAll('.card').forEach(attachCardDrag);
}

function onDragStart(e) {
const card = e.currentTarget;
if (!card.id) return;
card.classList.add('dragging');
e.dataTransfer.effectAllowed = 'move';
e.dataTransfer.setData('text/plain', card.id);
}

function onDragEnd() {
document.querySelectorAll('.card.drop-before,.card.drop-after,.card.dragging').forEach(el => el.classList.remove('drop-before', 'drop-after', 'dragging'));
}

function onDragOver(e) {
e.preventDefault();
const target = e.currentTarget;
if (!target.id || target.classList.contains('dragging')) return;
const rect = target.getBoundingClientRect();
const before = e.clientX < rect.left + rect.width / 2;
target.classList.toggle('drop-before', before);
target.classList.toggle('drop-after', !before);
}

function onDragLeave(e) {
e.currentTarget.classList.remove('drop-before', 'drop-after');
}

function onDrop(e) {
e.preventDefault();
if (boardView !== 'main') return;
const sourceId = e.dataTransfer.getData('text/plain');
const target = e.currentTarget;
if (!sourceId || !target.id || sourceId === target.id) return;
const sourceP = state.projects.find(p => 'card-' + p.id === sourceId);
const targetP = state.projects.find(p => 'card-' + p.id === target.id);
if (!sourceP || !targetP || sourceP.archived || targetP.archived) return;
const sourceIndex = state.projects.findIndex(pr => pr.id === sourceP.id);
const targetIndex = state.projects.findIndex(pr => pr.id === targetP.id);
if (sourceIndex < 0 || targetIndex < 0) return;
const [moved] = state.projects.splice(sourceIndex, 1);
const insertIndex = sourceIndex < targetIndex && target.classList.contains('drop-after') ? targetIndex : targetIndex + (target.classList.contains('drop-after') ? 1 : 0);
state.projects.splice(Math.max(0, Math.min(insertIndex, state.projects.length)), 0, moved);
resequence();
save();
render();
}

function todoBlockHtml(p, todo) {
normalizeTodo(todo);
const subWrapClass = 'todo-sub-wrap' + (todo.subOpen ? '' : ' collapsed');
const subs = todo.children.map(sub => `
    <div class="todo-sub">
      <div class="cb ${sub.done ? 'on' : ''}" onclick="toggleSubtask('${p.id}','${todo.id}','${sub.id}')"></div>
      <div class="todo-text todo-sub-text ${sub.done ? 'done' : ''}"
        contenteditable="true"
        onblur="saveSubtask('${p.id}','${todo.id}','${sub.id}',this)"
        onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}"
      >${escHtml(sub.text)}</div>
      <div class="more-wrap todo-sub-more-wrap">
        <button type="button" class="icon-btn" onclick="toggleSubMore('${p.id}','${todo.id}','${sub.id}',event)" title="${escAttr(t('more'))}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
        <div class="more-menu" id="sub-more-${p.id}-${todo.id}-${sub.id}" onclick="event.stopPropagation()">
          <button type="button" class="more-item danger" onclick="deleteSubtask('${p.id}','${todo.id}','${sub.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            ${escHtml(t('deleteTodo'))}
          </button>
        </div>
      </div>
    </div>`).join('');
const subAdd = `
    <div class="todo-sub-add">
      <input class="add-input add-input-sub" id="subinp-${p.id}-${todo.id}" placeholder="${escAttr(t('addSubPlaceholder'))}" maxlength="200"
        onkeydown="if(event.key==='Enter')addSubtask('${p.id}','${todo.id}')" />
      <button type="button" class="add-btn add-btn-sub" onclick="addSubtask('${p.id}','${todo.id}')" title="${escAttr(t('add'))}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
    </div>`;
const todoSubMenuLead = todo.subOpen
  ? `<button type="button" class="more-item" onclick="closeTodoSubWrap('${p.id}','${todo.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 15 12 9 18 15"/></svg>
            ${escHtml(t('todoMoreCollapseSub'))}
          </button>`
  : `<button type="button" class="more-item" onclick="openTodoSubAndFocus('${p.id}','${todo.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
            ${escHtml(t('todoMoreSub'))}
          </button>`;
return `
  <div class="todo-block">
    <div class="todo-item">
      <div class="cb ${todo.done ? 'on' : ''}" onclick="toggleTodo('${p.id}','${todo.id}')"></div>
      <div class="todo-text ${todo.done ? 'done' : ''}"
        contenteditable="true"
        onblur="saveTodo('${p.id}','${todo.id}',this)"
        onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur()}"
      >${escHtml(todo.text)}</div>
      <div class="more-wrap todo-more-wrap">
        <button type="button" class="icon-btn" onclick="toggleTodoMore('${p.id}','${todo.id}',event)" title="${escAttr(t('more'))}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
        <div class="more-menu" id="todo-more-${p.id}-${todo.id}" onclick="event.stopPropagation()">
          ${todoSubMenuLead}
          <button type="button" class="more-item danger" onclick="deleteTodo('${p.id}','${todo.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            ${escHtml(t('deleteTodo'))}
          </button>
        </div>
      </div>
    </div>
    <div class="${subWrapClass}">${subs}${subAdd}</div>
  </div>`;
}

function cardHtml(p) {
const archiveView = boardView === 'archive';
const done = projectDone(p);
const total = projectTotal(p);
const pp = pct(p);
const full = total > 0 && done === total;
const todos = p.todos.length
  ? p.todos.map(todo => todoBlockHtml(p, todo)).join('')
  : `<div class="todo-empty">${escHtml(t('todoEmpty'))}</div>`;
const moreArchive = !archiveView && full
  ? `<button type="button" class="more-item" onclick="archiveProject('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
            ${escHtml(t('archiveProject'))}
          </button>`
  : '';
const moreUnarchive = archiveView
  ? `<button type="button" class="more-item" onclick="unarchiveProject('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
            ${escHtml(t('unarchiveProject'))}
          </button>`
  : '';

return `
<div class="card" id="card-${p.id}">
  <div class="card-accent${full?' full':''}"></div>
  <div class="card-head">
    <div class="card-title-wrap">
      <input class="card-name" value="${escAttr(p.name)}" placeholder="${escAttr(t('projectName'))}"
        onblur="renameProject('${p.id}',this.value)"
        onkeydown="if(event.key==='Enter')this.blur()" />
      <div class="card-meta">${formatDate(p.createdAt)}</div>
    </div>
    <div class="card-actions">
      <button class="icon-btn" onclick="exportProjectMd('${p.id}'); event.stopPropagation();" title="${escAttr(t('export'))}">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </button>
      <div class="more-wrap">
        <button class="icon-btn" onclick="toggleMore('${p.id}', event)" title="${escAttr(t('more'))}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
        </button>
        <div class="more-menu" id="more-${p.id}" onclick="event.stopPropagation()">
          ${moreArchive}${moreUnarchive}
          <button type="button" class="more-item danger" onclick="deleteProject('${p.id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            ${escHtml(t('deleteProject'))}
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="card-progress">
    <div class="prog-row">
      <span class="prog-counts">${escHtml(t('completedCount', done, total))}</span>
      <span class="prog-pct${full?' done-all':''}">${full ? t('allDone') : pp + '%'}</span>
    </div>
    <div class="prog-track">
      <div class="prog-fill${full?' done-all':''}" style="width:${pp}%"></div>
    </div>
  </div>

  <div class="divider"></div>

  <div class="card-todos" id="todos-${p.id}">${todos}</div>

  <div class="card-add">
    <input class="add-input" id="inp-${p.id}" placeholder="${escAttr(t('addTodoPlaceholder'))}" maxlength="200"
      onkeydown="if(event.key==='Enter')addTodo('${p.id}')" />
    <button class="add-btn" onclick="addTodo('${p.id}')" title="${escAttr(t('add'))}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>
  </div>
</div>`;
}

function addCardHtml() {
return `<div class="add-card" onclick="openModal()">
  <div class="add-card-icon">＋</div>
  <span>${escHtml(t('addProject'))}</span>
</div>`;
}

function toggleMore(pid, event) {
event.stopPropagation();
const menu = document.getElementById('more-' + pid);
const isOpen = menu.classList.contains('open');
closeMenus();
if (!isOpen) menu.classList.add('open');
}

function toggleTodoMore(pid, tid, event) {
event.stopPropagation();
const menu = document.getElementById('todo-more-' + pid + '-' + tid);
if (!menu) return;
const isOpen = menu.classList.contains('open');
closeMenus();
if (!isOpen) menu.classList.add('open');
}

function toggleSubMore(pid, tid, sid, event) {
event.stopPropagation();
const menu = document.getElementById('sub-more-' + pid + '-' + tid + '-' + sid);
if (!menu) return;
const isOpen = menu.classList.contains('open');
closeMenus();
if (!isOpen) menu.classList.add('open');
}

function openTodoSubAndFocus(pid, tid) {
const p = state.projects.find(x => x.id === pid);
const todo = p && p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
todo.subOpen = true;
save();
closeMenus();
patchCard(pid);
requestAnimationFrame(() => {
  const ni = document.getElementById('subinp-' + pid + '-' + tid);
  if (ni) ni.focus();
});
}

function closeTodoSubWrap(pid, tid) {
const p = state.projects.find(x => x.id === pid);
const todo = p && p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
todo.subOpen = false;
save();
closeMenus();
patchCard(pid);
}

document.addEventListener('click', () => closeMenus());

function renameProject(pid, val) {
const p = state.projects.find(x => x.id === pid);
if (!p || !val.trim()) { if(p) { const el=document.getElementById('card-'+pid); if(el)el.querySelector('.card-name').value=p.name; } return; }
p.name = val.trim();
save();
renderBadge();
}

function deleteProject(pid) {
if (!confirm(t('confirmDeleteProject'))) return;
state.projects = state.projects.filter(x => x.id !== pid);
resequence();
save();
render();
toast(t('toastProjectDeleted'));
}

function archiveProject(pid) {
const p = state.projects.find(x => x.id === pid);
if (!p || p.archived) return;
const tot = projectTotal(p);
const done = projectDone(p);
if (!(tot > 0 && done === tot)) return;
p.archived = true;
p.archivedAt = new Date().toISOString();
resequence();
save();
closeMenus();
render();
toast(t('toastArchived'), true);
}

function unarchiveProject(pid) {
const p = state.projects.find(x => x.id === pid);
if (!p || !p.archived) return;
const act = sortedActiveProjects();
const maxO = act.length ? Math.max(...act.map(x => x.order ?? 0)) : -1;
p.archived = false;
p.archivedAt = null;
p.order = maxO + 1;
resequence();
save();
closeMenus();
render();
toast(t('toastUnarchived'), true);
}

function addTodo(pid) {
const inp = document.getElementById('inp-' + pid);
const text = inp.value.trim();
if (!text) return;
const p = state.projects.find(x => x.id === pid);
if (!p) return;
p.todos.push({ id: uid(), text, done: false, createdAt: new Date().toISOString(), children: [] });
sortTodosByDone(p);
save();
inp.value = '';
patchCard(pid);
requestAnimationFrame(() => { const ni = document.getElementById('inp-' + pid); if (ni) ni.focus(); });
}

function toggleTodo(pid, tid) {
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const t = p.todos.find(x => x.id === tid);
if (!t) return;
normalizeTodo(t);
t.done = !t.done;
sortTodosByDone(p);
save();
patchCard(pid);
}

function deleteTodo(pid, tid) {
const p = state.projects.find(x => x.id === pid);
if (!p) return;
p.todos = p.todos.filter(x => x.id !== tid);
save();
patchCard(pid);
}

function saveTodo(pid, tid, el) {
const text = el.innerText.trim();
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const t = p.todos.find(x => x.id === tid);
if (!t) return;
normalizeTodo(t);
if (!text) { el.innerText = t.text; return; }
t.text = text;
save();
}

function addSubtask(pid, tid) {
const inp = document.getElementById('subinp-' + pid + '-' + tid);
if (!inp) return;
const text = inp.value.trim();
if (!text) return;
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const todo = p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
todo.children.push({ id: uid(), text, done: false, createdAt: new Date().toISOString() });
todo.subOpen = true;
sortSubtasksByDone(todo);
save();
inp.value = '';
patchCard(pid);
requestAnimationFrame(() => { const ni = document.getElementById('subinp-' + pid + '-' + tid); if (ni) ni.focus(); });
}

function toggleSubtask(pid, tid, sid) {
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const todo = p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
const s = todo.children.find(x => x.id === sid);
if (!s) return;
s.done = !s.done;
sortSubtasksByDone(todo);
save();
patchCard(pid);
}

function deleteSubtask(pid, tid, sid) {
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const todo = p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
todo.children = todo.children.filter(x => x.id !== sid);
if (!todo.children.length) todo.subOpen = false;
save();
patchCard(pid);
}

function saveSubtask(pid, tid, sid, el) {
const text = el.innerText.trim();
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const todo = p.todos.find(x => x.id === tid);
if (!todo) return;
normalizeTodo(todo);
const s = todo.children.find(x => x.id === sid);
if (!s) return;
if (!text) { el.innerText = s.text; return; }
s.text = text;
save();
}

function openModal() {
closeMenus();
document.getElementById('modalOverlay').classList.remove('hidden');
requestAnimationFrame(() => document.getElementById('newName').focus());
}
function closeModal() {
document.getElementById('modalOverlay').classList.add('hidden');
document.getElementById('newName').value = '';
}
function confirmModal() {
const name = document.getElementById('newName').value.trim();
if (!name) return;
boardView = 'main';
const order = sortedActiveProjects().length;
state.projects.push({ id: uid(), name, todos: [], createdAt: new Date().toISOString(), order, archived: false, archivedAt: null });
resequence();
save();
closeModal();
render();
toast(t('toastProjectCreated'), true);
}

function exportMd() {
const active = sortedActiveProjects();
const archived = sortedArchivedProjects();
if (!active.length && !archived.length) { toast(t('toastNoProjects')); return; }
const locale = t('dateLocale');
const lines = ['# ' + t('mdTitle'), '', `> ${t('mdExportedAt')}${new Date().toLocaleString(locale)}`, ''];
function appendProjectMdBlock(p) {
  const done = projectDone(p);
  const total = projectTotal(p);
  const pp = total ? Math.round(done / total * 100) : 0;
  lines.push(`## ${p.name}`);
  lines.push('');
  lines.push(`**${t('mdProgress')}** ${done}/${total} (${pp}%)  ${'█'.repeat(Math.round(pp/10))}${'░'.repeat(10-Math.round(pp/10))}`);
  lines.push('');
  if (p.todos.length) {
    p.todos.forEach(todo => {
      normalizeTodo(todo);
      lines.push(`- [${todo.done ? 'x' : ' '}] ${todo.text}`);
      todo.children.forEach(c => lines.push(`  - [${c.done ? 'x' : ' '}] ${c.text}`));
    });
  } else lines.push(`_${t('mdNoTodos')}_`);
  lines.push('');
}
active.forEach(appendProjectMdBlock);
if (archived.length) {
  lines.push(`## ${t('mdArchivedSection')}`);
  lines.push('');
  archived.forEach(appendProjectMdBlock);
}
downloadText(lines.join('\n'), `kanban-${new Date().toISOString().slice(0,10)}.md`, 'text/markdown;charset=utf-8');
toast(t('toastExported'), true);
}

function exportProjectMd(pid) {
const p = state.projects.find(x => x.id === pid);
if (!p) return;
const done = projectDone(p);
const total = projectTotal(p);
const pp = total ? Math.round(done / total * 100) : 0;
const locale = t('dateLocale');
const lines = [`# ${p.name}`, '', `> ${t('mdExportedAt')}${new Date().toLocaleString(locale)}`, '', `**${t('mdProgress')}** ${done}/${total} (${pp}%)  ${'█'.repeat(Math.round(pp/10))}${'░'.repeat(10-Math.round(pp/10))}`, ''];
if (p.todos.length) {
  p.todos.forEach(todo => {
    normalizeTodo(todo);
    lines.push(`- [${todo.done ? 'x' : ' '}] ${todo.text}`);
    todo.children.forEach(c => lines.push(`  - [${c.done ? 'x' : ' '}] ${c.text}`));
  });
} else lines.push(`_${t('mdNoTodos')}_`);
downloadText(lines.join('\n'), `${slugify(p.name)}-${new Date().toISOString().slice(0,10)}.md`, 'text/markdown;charset=utf-8');
toast(t('toastProjectExported'), true);
}

function downloadText(text, filename, type) {
const blob = new Blob([text], { type });
const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: filename });
document.body.appendChild(a); a.click(); document.body.removeChild(a);
setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function importMd(input) {
const file = input.files[0];
if (!file) return;
input.value = '';
const reader = new FileReader();
reader.onload = e => {
  const imported = parseMdProjects(e.target.result);
  if (!imported.length) { toast(t('toastImportEmpty')); return; }
  const act = sortedActiveProjects();
  const maxO = act.length ? Math.max(...act.map(x => x.order ?? 0)) : -1;
  const now = new Date().toISOString();
  imported.forEach((p, i) => {
    state.projects.push({
      id: uid(), name: p.name,
      todos: p.todos.map(t => ({
        id: uid(), text: t.text, done: t.done, createdAt: now,
        children: t.children.map(c => ({ id: uid(), text: c.text, done: c.done, createdAt: now })),
        subOpen: t.children.length > 0
      })),
      createdAt: now, order: maxO + 1 + i,
      archived: p.archived, archivedAt: p.archived ? now : null
    });
  });
  save();
  boardView = 'main';
  render();
  toast(t('toastImported', imported.length), true);
};
reader.readAsText(file);
}

function parseMdProjects(text) {
const lines = text.split('\n');
const projects = [];
let current = null;
let currentTodo = null;
let inArchive = false;
for (const line of lines) {
  if (/^>\s/.test(line)) continue;
  if (/^\*\*.*(?:進度|进度|Progress).*$/.test(line)) continue;
  if (/^_{1,2}[^_]+_{1,2}$/.test(line)) continue;
  if (/^##\s*(?:已歸檔專案|已归档项目|Archived projects)/i.test(line)) { inArchive = true; continue; }
  const pm2 = line.match(/^##\s+(.+)$/);
  if (pm2) { if (current) projects.push(current); current = { name: pm2[1].trim(), todos: [], archived: inArchive }; currentTodo = null; continue; }
  const pm1 = line.match(/^#\s+(.+)$/);
  if (pm1) { const name = pm1[1].trim(); if (/^monoboards$/i.test(name)) continue; if (current) projects.push(current); current = { name, todos: [], archived: false }; currentTodo = null; continue; }
  if (!current) continue;
  const sm = line.match(/^  -\s*\[([ xX])\]\s*(.+)$/);
  if (sm && currentTodo) { currentTodo.children.push({ text: sm[2].trim(), done: sm[1].toLowerCase() === 'x' }); continue; }
  const tm = line.match(/^-\s*\[([ xX])\]\s*(.+)$/);
  if (tm) { currentTodo = { text: tm[2].trim(), done: tm[1].toLowerCase() === 'x', children: [] }; current.todos.push(currentTodo); }
}
if (current) projects.push(current);
return projects;
}
function slugify(text) {
return String(text).trim().toLowerCase().replace(/[^\w\u4e00-\u9fff]+/g, '-').replace(/^-+|-+$/g, '') || 'project';
}

function toast(msg, ok = false) {
const c = document.getElementById('toasts');
const el = document.createElement('div');
el.className = 'toast' + (ok ? ' ok' : '');
el.innerHTML = `<span>${ok ? '✓' : 'ℹ'}</span><span>${escHtml(msg)}</span>`;
c.appendChild(el);
setTimeout(() => { el.style.transition='opacity 0.2s'; el.style.opacity='0'; setTimeout(()=>el.remove(), 200); }, 2600);
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return String(s).replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString(t('dateLocale'), { year:'numeric', month:'short', day:'numeric' }) : ''; }

document.addEventListener('keydown', e => {
if (e.key !== 'Escape') return;
if (!document.getElementById('modalOverlay').classList.contains('hidden')) closeModal();
else if (boardView === 'archive') setBoardView('main');
});

updateStaticText();
render();
