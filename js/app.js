import { fetchTodos } from './api.js';
import { hasStoredTasks, loadTasks, saveTasks } from './storage.js';
import { createTask, isTask, PRIORITIES } from './task.js';
import {
  bindTaskForm,
  bindTaskList,
  confirmDelete,
  fillForm,
  renderTasks,
  resetForm,
  showFormError,
  showToast,
} from './ui.js';

const FORM_ERRORS = {
  title: 'El título no puede estar vacío.',
  priority: 'Selecciona una prioridad.',
};

const HOUR = 60 * 60 * 1000;

const state = {
  tasks: [],
  editingId: null,
};

function render() {
  renderTasks(state.tasks, state.editingId);
}

// Guarda y vuelve a dibujar tras cada cambio del estado
function persist() {
  saveTasks(state.tasks);
  render();
}

// El id del DOM llega como string; las tareas de la API pueden tener id numérico
function findTask(id) {
  return state.tasks.find((task) => String(task.id) === id);
}

function validateForm({ title, priority }) {
  const invalid = [];
  if (title.trim() === '') invalid.push('title');
  if (!PRIORITIES.includes(priority)) invalid.push('priority');
  return invalid;
}

function handleSubmit(values) {
  const invalid = validateForm(values);
  if (invalid.length > 0) {
    const message = invalid.length > 1 ? 'Completa el título y la prioridad.' : FORM_ERRORS[invalid[0]];
    showFormError(message, invalid);
    return;
  }

  const editing = state.editingId && findTask(state.editingId);
  if (editing) {
    editing.title = values.title.trim();
    editing.priority = values.priority;
  } else {
    state.tasks.push(createTask(values));
  }

  state.editingId = null;
  persist();
  resetForm();
}

function handleEdit(id) {
  const task = findTask(id);
  if (!task) return;
  state.editingId = id;
  fillForm(task);
  render();
}

function handleCancel() {
  state.editingId = null;
  resetForm();
  render();
}

function handleToggle(id, completed) {
  const task = findTask(id);
  if (!task) return;
  task.completed = completed;
  persist();
}

function handleDelete(id) {
  const task = findTask(id);
  if (!task || !confirmDelete(task.title)) return;
  state.tasks = state.tasks.filter((item) => item !== task);
  if (state.editingId === id) {
    state.editingId = null;
    resetForm();
  }
  persist();
}

// La API no trae prioridad ni fecha: se asignan de forma determinista,
// con fechas escalonadas una hora hacia atrás para que el orden tenga sentido
function fromTodo(todo, index, now) {
  return createTask({
    id: `api-${todo.id}`,
    title: todo.title,
    completed: todo.completed,
    priority: PRIORITIES[todo.id % PRIORITIES.length],
    createdAt: new Date(now - index * HOUR).toISOString(),
  });
}

async function importFromApi() {
  let todos;
  try {
    todos = await fetchTodos();
  } catch (error) {
    showToast(`No se pudieron cargar las tareas de la API: ${error.message}.`, 'error');
    return;
  }

  const existing = new Set(state.tasks.map((task) => String(task.id)));
  const now = Date.now();
  const imported = todos
    .map((todo, index) => fromTodo(todo, index, now))
    .filter((task) => isTask(task) && !existing.has(task.id));

  state.tasks.push(...imported);
  persist();
  showToast(`Se importaron ${imported.length} tareas de la API.`);
}

async function init() {
  bindTaskForm(handleSubmit, handleCancel);
  bindTaskList({ toggle: handleToggle, edit: handleEdit, delete: handleDelete });

  // loadTasks borra la clave si está corrupta, así que va antes de hasStoredTasks
  state.tasks = loadTasks().filter(isTask);
  render();

  if (!hasStoredTasks()) await importFromApi();
}

init();
