const PRIORITY_LABELS = { alta: 'Alta', media: 'Media', baja: 'Baja' };

const dateFormat = new Intl.DateTimeFormat('es-EC', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const elements = {
  list: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
};

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

export function renderTasks(tasks) {
  elements.list.replaceChildren(...tasks.map(createTaskItem));
  elements.emptyState.hidden = tasks.length > 0;
}
