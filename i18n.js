const I18N = {
'zh-TW': {
  addProject: '新增項目',
  newProject: '新增項目',
  projectName: '項目名稱',
  projectNamePlaceholder: '例如：網站改版、Q3 計劃…',
  cancel: '取消',
  create: '建立',
  projectsCount: '{0} 個項目',
  completedCount: '{0}/{1} 已完成',
  allDone: '全部完成 ✓',
  emptyTitle: '建立你的第一個項目',
  emptyDesc: '點擊右上角「新增項目」，然後直接在卡片上管理所有待辦事項。',
  emptyButton: '新增第一個項目',
  todoEmpty: '在下方輸入框新增待辦事項',
  addTodoPlaceholder: '新增待辦…',
  addSubPlaceholder: '新增子項目…',
  add: '新增',
  export: '導出',
  more: '更多',
  deleteProject: '刪除項目',
  deleteTodo: '刪除',
  confirmDeleteProject: '確定刪除這個項目？',
  toastProjectDeleted: '項目已刪除',
  toastProjectCreated: '項目已建立',
  toastNoProjects: '沒有項目可以導出',
  toastExported: '已導出 Markdown',
  toastProjectExported: '已導出該項目 Markdown',
  mdTitle: 'monoboards',
  mdExportedAt: '導出時間：',
  mdProgress: '進度：',
  mdNoTodos: '尚無待辦事項',
  privacy: '隱私協議',
  terms: '使用協議',
  dateLocale: 'zh-TW'
},
'zh-CN': {
  addProject: '新增项目',
  newProject: '新增项目',
  projectName: '项目名称',
  projectNamePlaceholder: '例如：网站改版、Q3 计划…',
  cancel: '取消',
  create: '创建',
  projectsCount: '{0} 个项目',
  completedCount: '{0}/{1} 已完成',
  allDone: '全部完成 ✓',
  emptyTitle: '建立你的第一个项目',
  emptyDesc: '点击右上角「新增项目」，然后直接在卡片上管理所有待办事项。',
  emptyButton: '新增第一个项目',
  todoEmpty: '在下方输入框新增待办事项',
  addTodoPlaceholder: '新增待办…',
  addSubPlaceholder: '新增子项目…',
  add: '新增',
  export: '导出',
  more: '更多',
  deleteProject: '删除项目',
  deleteTodo: '删除',
  confirmDeleteProject: '确定删除这个项目？',
  toastProjectDeleted: '项目已删除',
  toastProjectCreated: '项目已创建',
  toastNoProjects: '没有项目可以导出',
  toastExported: '已导出 Markdown',
  toastProjectExported: '已导出该项目 Markdown',
  mdTitle: 'monoboards',
  mdExportedAt: '导出时间：',
  mdProgress: '进度：',
  mdNoTodos: '暂无待办事项',
  privacy: '隐私协议',
  terms: '使用协议',
  dateLocale: 'zh-CN'
},
'en': {
  addProject: 'New Project',
  newProject: 'New Project',
  projectName: 'Project Name',
  projectNamePlaceholder: 'e.g. Website Redesign, Q3 Planning…',
  cancel: 'Cancel',
  create: 'Create',
  projectsCount: '{0} projects',
  completedCount: '{0}/{1} done',
  allDone: 'All Done ✓',
  emptyTitle: 'Create Your First Project',
  emptyDesc: 'Click "New Project" in the top right, then manage all tasks directly on the card.',
  emptyButton: 'Create First Project',
  todoEmpty: 'Add a task below',
  addTodoPlaceholder: 'Add a task…',
  addSubPlaceholder: 'Add sub-task…',
  add: 'Add',
  export: 'Export',
  more: 'More',
  deleteProject: 'Delete Project',
  deleteTodo: 'Delete',
  confirmDeleteProject: 'Are you sure you want to delete this project?',
  toastProjectDeleted: 'Project deleted',
  toastProjectCreated: 'Project created',
  toastNoProjects: 'No projects to export',
  toastExported: 'Exported Markdown',
  toastProjectExported: 'Project Markdown exported',
  mdTitle: 'monoboards',
  mdExportedAt: 'Exported at:',
  mdProgress: 'Progress:',
  mdNoTodos: 'No tasks yet',
  privacy: 'Privacy Policy',
  terms: 'Terms of Use',
  dateLocale: 'en-US'
}
};

const LANG_NAMES = { 'zh-TW': '繁體中文', 'zh-CN': '简体中文', 'en': 'English' };

function detectLang() {
const saved = localStorage.getItem('monoboards-lang');
if (saved && I18N[saved]) return saved;
const nav = navigator.language || navigator.userLanguage || 'zh-TW';
if (nav.startsWith('zh-TW') || nav.startsWith('zh-HK')) return 'zh-TW';
if (nav.startsWith('zh')) return 'zh-CN';
if (nav.startsWith('en')) return 'en';
return 'zh-TW';
}

let currentLang = detectLang();
document.documentElement.lang = currentLang === 'en' ? 'en' : currentLang;

function t(key, ...args) {
let s = (I18N[currentLang] && I18N[currentLang][key]) || I18N['zh-TW'][key] || key;
args.forEach((a, i) => { s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), a); });
return s;
}

function setLang(lang) {
if (!I18N[lang]) return;
currentLang = lang;
localStorage.setItem('monoboards-lang', lang);
document.documentElement.lang = lang === 'en' ? 'en' : lang;
closeLangMenu();
updateStaticText();
render();
}

function toggleLangMenu(e) {
e.stopPropagation();
const menu = document.getElementById('langMenu');
const isOpen = menu.classList.contains('open');
closeMenus();
if (!isOpen) menu.classList.add('open');
}

function closeLangMenu() {
document.getElementById('langMenu').classList.remove('open');
}

function updateStaticText() {
document.getElementById('langLabel').textContent = LANG_NAMES[currentLang];
document.getElementById('addProjectBtn').textContent = t('addProject');
document.getElementById('modalTitle').textContent = t('newProject');
document.getElementById('modalLabel').textContent = t('projectName');
document.getElementById('newName').placeholder = t('projectNamePlaceholder');
document.getElementById('modalCancel').textContent = t('cancel');
document.getElementById('modalCreate').textContent = t('create');
document.getElementById('footerPrivacy').textContent = t('privacy');
document.getElementById('footerTerms').textContent = t('terms');
document.querySelectorAll('.lang-item').forEach(el => el.classList.remove('active'));
document.getElementById('lang-' + currentLang).classList.add('active');
}
