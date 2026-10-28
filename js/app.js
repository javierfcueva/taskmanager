import { loadTasks } from './storage.js';
import { isTask } from './task.js';
import { renderTasks } from './ui.js';

const state = {
  tasks: [],
};

function render() {
  renderTasks(state.tasks);
}

function init() {
  state.tasks = loadTasks().filter(isTask);
  render();
}

init();
