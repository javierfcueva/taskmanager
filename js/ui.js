const PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' };

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const elements = {
  form: document.getElementById('task-form'),
  title: document.getElementById('task-title'),
  priority: document.getElementById('task-priority'),
  formError: document.getElementById('form-error'),
  submit: document.getElementById('form-submit'),
  cancel: document.getElementById('form-cancel'),
  search: document.getElementById('search'),
  filters: document.querySelector('.filters'),
  sort: document.getElementById('sort'),
  statTotal: document.getElementById('stat-total'),
  statPending: document.getElementById('stat-pending'),
  statCompleted: document.getElementById('stat-completed'),
  list: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  toast: document.getElementById('toast'),
};

const formFields = { title: elements.title, priority: elements.priority };

const TOAST_DURATION = 4000;
let toastTimer;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function actionButton(action, label, extraClass = '') {
  const button = el('button', `btn btn-ghost btn-sm ${extraClass}`.trim(), label);
  button.type = 'button';
  button.dataset.action = action;
  return button;
}

function createTaskItem(task, isEditing) {
  const item = el('li', 'task');
  item.dataset.id = task.id;
  item.classList.toggle('is-completed', task.completed);
  item.classList.toggle('is-editing', isEditing);

  const checkbox = el('input', 'task-check');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;
  checkbox.dataset.action = 'toggle';
  checkbox.setAttribute('aria-label', `Completada: ${task.title}`);

  const date = el('time', null, dateFormat.format(new Date(task.createdAt)));
  date.dateTime = task.createdAt;

  const meta = el('span', 'task-meta');
  meta.append(el('span', `badge badge-${task.priority}`, PRIORITY_LABELS[task.priority]), date);

  const body = el('div', 'task-body');
  body.append(el('span', 'task-title', task.title), meta);

  const actions = el('div', 'task-actions');
  actions.append(
    actionButton('edit', 'Editar'),
    actionButton('delete', 'Eliminar', 'btn-danger'),
  );

  item.append(checkbox, body, actions);
  return item;
}

function getTaskId(node) {
  return node.closest('.task').dataset.id;
}

export function renderTasks(tasks, { editingId = null, emptyMessage = 'No hay tareas para mostrar.' } = {}) {
  const items = tasks.map((task) => createTaskItem(task, String(task.id) === editingId));
  elements.list.replaceChildren(...items);
  elements.emptyState.textContent = emptyMessage;
  elements.emptyState.hidden = tasks.length > 0;
}

export function renderStats({ total, pending, completed }) {
  elements.statTotal.textContent = total;
  elements.statPending.textContent = pending;
  elements.statCompleted.textContent = completed;
}

export function showFormError(message, fields) {
  elements.formError.textContent = message;
  for (const [name, input] of Object.entries(formFields)) {
    input.classList.toggle('is-invalid', fields.includes(name));
  }
  formFields[fields[0]].focus();
}

export function clearFormError() {
  elements.formError.textContent = '';
  Object.values(formFields).forEach((input) => input.classList.remove('is-invalid'));
}

// Deja el formulario vacío y en modo crear
export function resetForm() {
  elements.form.reset();
  clearFormError();
  elements.submit.textContent = 'Agregar';
  elements.cancel.hidden = true;
  elements.title.focus();
}

// Carga la tarea en el formulario y lo pasa a modo edición
export function fillForm(task) {
  clearFormError();
  elements.title.value = task.title;
  elements.priority.value = task.priority;
  elements.submit.textContent = 'Guardar';
  elements.cancel.hidden = false;
  elements.title.focus();
}

// Un mensaje nuevo reemplaza al anterior y reinicia el temporizador
export function showToast(message, type = 'info') {
  elements.toast.textContent = message;
  elements.toast.classList.toggle('is-error', type === 'error');
  elements.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.hidden = true;
  }, TOAST_DURATION);
}

export function confirmDelete(title) {
  return window.confirm(`¿Eliminar la tarea "${title}"?`);
}

export function bindTaskForm(onSubmit, onCancel) {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit({ title: elements.title.value, priority: elements.priority.value });
  });

  elements.cancel.addEventListener('click', onCancel);

  // El error se quita del campo en cuanto el usuario lo corrige
  for (const input of Object.values(formFields)) {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (!elements.form.querySelector('.is-invalid')) elements.formError.textContent = '';
    });
  }
}

// La búsqueda se aplica en cada tecla; el filtro activo se marca aquí y se avisa a app.js
export function bindToolbar({ search, filter, sort }) {
  elements.search.addEventListener('input', () => search(elements.search.value));
  elements.sort.addEventListener('change', () => sort(elements.sort.value));

  elements.filters.addEventListener('click', (event) => {
    const button = event.target.closest('.filter');
    if (!button) return;
    for (const item of elements.filters.querySelectorAll('.filter')) {
      const isActive = item === button;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-pressed', String(isActive));
    }
    filter(button.dataset.filter);
  });
}

// Delegación: un listener en la lista para todos los ítems, presentes y futuros
export function bindTaskList(handlers) {
  elements.list.addEventListener('change', (event) => {
    if (event.target.dataset.action !== 'toggle') return;
    handlers.toggle?.(getTaskId(event.target), event.target.checked);
  });

  elements.list.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    handlers[button.dataset.action]?.(getTaskId(button));
  });
}
