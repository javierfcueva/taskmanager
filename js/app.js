import { loadTasks, saveTasks } from './storage.js';
import { createTask, isTask, PRIORITIES } from './task.js';
import {
  bindTaskForm,
  bindTaskList,
  confirmDelete,
  renderTasks,
  resetForm,
  showFormError,
} from './ui.js';

const FORM_ERRORS = {
  title: 'El título no puede estar vacío.',
  priority: 'Selecciona una prioridad.',
};

const state = {
  tasks: [],
};

function render() {
  renderTasks(state.tasks);
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

  state.tasks.push(createTask(values));
  persist();
  resetForm();
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
  persist();
}

function init() {
  bindTaskForm(handleSubmit);
  bindTaskList({ toggle: handleToggle, delete: handleDelete });

  state.tasks = loadTasks().filter(isTask);
  render();
}

init();
