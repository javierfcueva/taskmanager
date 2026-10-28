const PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' };

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const elements = {
  form: document.getElementById('task-form'),
  title: document.getElementById('task-title'),
  priority: document.getElementById('task-priority'),
  formError: document.getElementById('form-error'),
  list: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
};

const formFields = { title: elements.title, priority: elements.priority };

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

function createTaskItem(task) {
  const item = el('li', 'task');
  item.dataset.id = task.id;
  item.classList.toggle('is-completed', task.completed);

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

export function renderTasks(tasks) {
  elements.list.replaceChildren(...tasks.map(createTaskItem));
  elements.emptyState.hidden = tasks.length > 0;
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

export function resetForm() {
  elements.form.reset();
  clearFormError();
  elements.title.focus();
}

export function confirmDelete(title) {
  return window.confirm(`¿Eliminar la tarea "${title}"?`);
}

export function bindTaskForm(onSubmit) {
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSubmit({ title: elements.title.value, priority: elements.priority.value });
  });

  // El error se quita del campo en cuanto el usuario lo corrige
  for (const input of Object.values(formFields)) {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (!elements.form.querySelector('.is-invalid')) elements.formError.textContent = '';
    });
  }
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
