const STORAGE_KEY = "todo2.items";

const form = document.getElementById("add-form");
const input = document.getElementById("new-todo");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-done");
const filterBtns = document.querySelectorAll(".filters button");

let todos = load();
let filter = "all";
let editingId = null;

function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // 저장 실패(사생활 보호 모드 등)해도 앱은 계속 동작
  }
}

function update() {
  save();
  render();
}

function addTodo(text) {
  todos.unshift({ id: crypto.randomUUID(), text, done: false });
  update();
}

function render() {
  const visible = todos.filter(t =>
    filter === "all" ? true : filter === "done" ? t.done : !t.done
  );

  listEl.replaceChildren(...visible.map(createItem));
  emptyEl.hidden = visible.length > 0;

  const remaining = todos.filter(t => !t.done).length;
  countEl.textContent = `남은 할 일 ${remaining}개`;
  clearBtn.hidden = !todos.some(t => t.done);

  filterBtns.forEach(b => b.classList.toggle("active", b.dataset.filter === filter));

  const editInput = listEl.querySelector(".edit");
  if (editInput) editInput.focus();
}

function createItem(todo) {
  const li = document.createElement("li");
  li.className = "item" + (todo.done ? " done" : "");
  li.dataset.id = todo.id;

  const check = document.createElement("input");
  check.type = "checkbox";
  check.checked = todo.done;
  check.setAttribute("aria-label", "완료 표시");
  check.addEventListener("change", () => {
    todo.done = check.checked;
    update();
  });

  let body;
  if (editingId === todo.id) {
    body = document.createElement("input");
    body.className = "edit";
    body.type = "text";
    body.value = todo.text;
    body.maxLength = 200;
    let finished = false;
    const finish = commit => {
      if (finished) return;
      finished = true;
      const value = body.value.trim();
      if (commit && value) todo.text = value;
      editingId = null;
      update();
    };
    body.addEventListener("keydown", e => {
      if (e.key === "Enter") finish(true);
      else if (e.key === "Escape") finish(false);
    });
    body.addEventListener("blur", () => finish(true));
  } else {
    body = document.createElement("span");
    body.className = "text";
    body.textContent = todo.text;
    body.title = "더블클릭하여 수정";
    body.addEventListener("dblclick", () => {
      editingId = todo.id;
      render();
    });
  }

  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "×";
  del.setAttribute("aria-label", "삭제");
  del.addEventListener("click", () => {
    todos = todos.filter(t => t.id !== todo.id);
    update();
  });

  li.append(check, body, del);
  return li;
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTodo(text);
  input.value = "";
  input.focus();
});

filterBtns.forEach(b =>
  b.addEventListener("click", () => {
    filter = b.dataset.filter;
    render();
  })
);

clearBtn.addEventListener("click", () => {
  todos = todos.filter(t => !t.done);
  update();
});

render();
