const API_BASE_URL = "http://localhost:5000/api";

const getTodayDateStr = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
};

const state = {
  token: localStorage.getItem("token") || "",
  user: JSON.parse(localStorage.getItem("user") || "null"),
  tasks: [],
  activePage: "tasks",
  lastSuggestionBatch: [],
  selectedDate: getTodayDateStr(),
  calendarMonth: new Date(),
  tasksByDate: {},
  filteredByDate: getTodayDateStr(),
  isFilteredToday: true,
  justRegistered: false
};

const elements = {
  signupForm: document.getElementById("signupForm"),
  loginForm: document.getElementById("loginForm"),
  goToSignupLink: document.getElementById("goToSignupLink"),
  authSwitchText: document.querySelector(".auth-switch"),
  authMessage: document.getElementById("authMessage"),
  authSection: document.getElementById("authSection"),
  taskSection: document.getElementById("taskSection"),
  brandPanel: document.querySelector(".brand-panel"),
  appHeader: document.querySelector(".app-header"),
  taskForm: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  taskList: document.getElementById("taskList"),
  taskCount: document.getElementById("taskCount"),
  logoutBtn: document.getElementById("logoutBtn"),
  statusMessage: document.getElementById("statusMessage"),
  welcomeText: document.getElementById("welcomeText"),
  aiSuggestBtn: document.getElementById("aiSuggestBtn"),
  aiSuggestionList: document.getElementById("aiSuggestionList"),
  aiQuestionInput: document.getElementById("aiQuestionInput"),
  askAiBtn: document.getElementById("askAiBtn"),
  aiResponseText: document.getElementById("aiResponseText"),
  importantTaskList: document.getElementById("importantTaskList"),
  completedHistoryList: document.getElementById("completedHistoryList"),
  myDayPageBtn: document.getElementById("myDayPageBtn"),
  importantPageBtn: document.getElementById("importantPageBtn"),
  historyPageBtn: document.getElementById("historyPageBtn"),
  importantSection: document.getElementById("importantSection"),
  historySection: document.getElementById("historySection"),
  calendarToggleBtn: document.getElementById("calendarToggleBtn"),
  calendarPopup: document.getElementById("calendarPopup"),
  calendarGrid: document.getElementById("calendarGrid"),
  calendarMonth: document.getElementById("calendarMonth"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  clearDateBtn: document.getElementById("clearDateBtn"),
  selectedDateInfo: document.getElementById("selectedDateInfo"),
  dateFilterInfo: document.getElementById("dateFilterInfo"),
  filterDateDisplay: document.getElementById("filterDateDisplay"),
  clearFilterBtn: document.getElementById("clearFilterBtn"),
  importantDateFilterInfo: document.getElementById("importantDateFilterInfo"),
  importantFilterDateDisplay: document.getElementById("importantFilterDateDisplay")
};

const setActivePage = (page) => {
  const pages = {
    tasks: elements.taskSection,
    important: elements.importantSection,
    history: elements.historySection
  };

  if (!pages[page]) {
    page = "tasks";
  }

  state.activePage = page;

  Object.entries(pages).forEach(([key, section]) => {
    section.classList.toggle("hidden", key !== page);
  });

  elements.myDayPageBtn.classList.toggle("active", page === "tasks");
  elements.importantPageBtn.classList.toggle("active", page === "important");
  elements.historyPageBtn.classList.toggle("active", page === "history");
};

const buildTasksByDate = () => {
  state.tasksByDate = {};
  state.tasks.forEach((task) => {
    if (task.completed) {
      return;
    }

    const dateStr = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : getTodayDateStr();

    if (!state.tasksByDate[dateStr]) {
      state.tasksByDate[dateStr] = [];
    }
    state.tasksByDate[dateStr].push(task);
  });
};

const formatDateYMD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
};

const isTaskForDate = (task, dateStr) => {
  if (!task.dueDate) {
    return dateStr === getTodayDateStr();
  }

  const taskDate = new Date(task.dueDate).toISOString().split("T")[0];
  return taskDate === dateStr;
};

const renderCalendar = () => {
  const year = state.calendarMonth.getFullYear();
  const month = state.calendarMonth.getMonth();

  elements.calendarMonth.textContent = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(state.calendarMonth);

  elements.calendarGrid.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i;
    const cell = document.createElement("div");
    cell.className = "calendar-day other-month";
    cell.textContent = day;
    elements.calendarGrid.appendChild(cell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    cell.textContent = day;

    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const today = getTodayDateStr();

    if (dateStr === state.selectedDate) {
      cell.classList.add("selected");
    } else if (dateStr === today) {
      cell.classList.add("today");
    }

    if (state.tasksByDate[dateStr] && state.tasksByDate[dateStr].length > 0) {
      cell.classList.add("has-tasks");
    }

    cell.addEventListener("click", () => {
      const today = getTodayDateStr();
      state.selectedDate = dateStr;
      state.filteredByDate = dateStr;
      state.isFilteredToday = dateStr === today;
      renderCalendar();
      updateDateDisplays();
      
      if (state.isFilteredToday) {
        elements.clearFilterBtn.classList.add("hidden");
      } else {
        elements.clearFilterBtn.classList.remove("hidden");
      }
      
      elements.dateFilterInfo.classList.remove("hidden");
      renderTasks(state.tasks);
      renderSideSections(state.tasks);
      closeCalendar();
    });

    elements.calendarGrid.appendChild(cell);
  }

  const totalCells = elements.calendarGrid.children.length;
  const remainingCells = 42 - totalCells;
  for (let day = 1; day <= remainingCells; day += 1) {
    const cell = document.createElement("div");
    cell.className = "calendar-day other-month";
    cell.textContent = day;
    elements.calendarGrid.appendChild(cell);
  }
};

const toggleCalendar = () => {
  elements.calendarPopup.classList.toggle("hidden");
  if (!elements.calendarPopup.classList.contains("hidden")) {
    renderCalendar();
  }
};

const closeCalendar = () => {
  elements.calendarPopup.classList.add("hidden");
};

const updateDateDisplays = () => {
  const dateForDisplay = state.filteredByDate || getTodayDateStr();
  const formattedDate = formatDateDisplay(new Date(dateForDisplay));

  elements.filterDateDisplay.textContent = formattedDate;
  if (elements.importantFilterDateDisplay) {
    elements.importantFilterDateDisplay.textContent = formattedDate;
  }
};

const formatDateLabel = (value) => {
  if (!value) {
    return "Unknown Date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown Date";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
};

const formatDisplayName = (name) => {
  if (!name || typeof name !== "string") {
    return "User";
  }

  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const sanitizeTitle = (title) => title.replace(/[\W_]+/g, " ").trim().toLowerCase();

const shuffleArray = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

const arraysEqual = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

const askAiInApp = async () => {
  const question = elements.aiQuestionInput.value.trim();

  if (!question) {
    showStatus("Please type a question first.", true);
    return;
  }

  elements.askAiBtn.disabled = true;
  elements.askAiBtn.textContent = "Thinking...";
  elements.aiResponseText.textContent = "Generating response...";

  try {
    const data = await request("/ai/ask", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ question })
    });

    elements.aiResponseText.textContent = data.answer || "No response received.";
    elements.aiQuestionInput.value = "";
    showStatus(data.model === "local-fallback" ? "AI fallback response ready." : "AI response ready.");
  } catch (error) {
    elements.aiResponseText.textContent = "Could not fetch response from AI.";
    showStatus(error.message, true);
  } finally {
    elements.askAiBtn.disabled = false;
    elements.askAiBtn.textContent = "Ask Now";
  }
};

const renderImportantTasks = (tasks) => {
  const activeDate = state.filteredByDate || getTodayDateStr();
  const importantTasks = tasks.filter((task) => task.important && !task.completed && isTaskForDate(task, activeDate));
  elements.importantTaskList.innerHTML = "";
  elements.importantTaskList.scrollTop = 0;

  if (!importantTasks.length) {
    elements.importantTaskList.innerHTML = '<li class="task-item"><p class="task-title">No important tasks for this date.</p></li>';
    return;
  }

  importantTasks.forEach((task) => {
    elements.importantTaskList.appendChild(createTaskListItem(task));
  });
};

const renderCompletedHistory = (tasks) => {
  const completedTasks = tasks
    .filter((task) => task.completed)
    .sort((a, b) => new Date(b.completedAt || b.updatedAt) - new Date(a.completedAt || a.updatedAt));

  elements.completedHistoryList.innerHTML = "";
  elements.completedHistoryList.scrollTop = 0;

  if (!completedTasks.length) {
    elements.completedHistoryList.innerHTML = '<li class="task-item"><p class="task-title">Complete tasks to build your history.</p></li>';
    return;
  }

  let currentDate = "";
  completedTasks.forEach((task) => {
    const label = formatDateLabel(task.completedAt || task.updatedAt);

    if (label !== currentDate) {
      const dateItem = document.createElement("li");
      dateItem.className = "mini-date";
      dateItem.textContent = label;
      elements.completedHistoryList.appendChild(dateItem);
      currentDate = label;
    }

    elements.completedHistoryList.appendChild(createTaskListItem(task, { actionMode: "delete" }));
  });
};

const renderAiSuggestions = () => {
  const existingTitles = new Set(state.tasks.map((task) => sanitizeTitle(task.title)).filter(Boolean));
  const baseSuggestions = [
    "Plan tomorrow's top 3 priorities",
    "Review pending emails for 15 minutes",
    "Do a quick code cleanup pass",
    "Prepare progress update for today",
    "Take a focused 25-minute deep work sprint",
    "Back up important project files",
    "Clear your downloads folder",
    "Document one key learning from today",
    "Create a short checklist for tomorrow morning",
    "Refactor one small repetitive task",
    "Review calendar for upcoming deadlines",
    "Organize notes from today's work",
    "Close two low-value pending tasks"
  ];

  const smartSuggestions = [];
  if (state.tasks.some((task) => /meeting|call/i.test(task.title))) {
    smartSuggestions.push("Write meeting notes and action items");
  }
  if (state.tasks.some((task) => /report|update/i.test(task.title))) {
    smartSuggestions.push("Create a short summary report draft");
  }
  if (state.tasks.some((task) => /bug|fix|issue/i.test(task.title))) {
    smartSuggestions.push("Re-test fixed bugs before end of day");
  }

  const pool = [...smartSuggestions, ...baseSuggestions]
    .filter((title) => !existingTitles.has(sanitizeTitle(title)))
    .filter((title, index, arr) => arr.indexOf(title) === index);

  const suggestionLimit = 3;
  let combined = [];

  if (pool.length <= suggestionLimit) {
    combined = shuffleArray(pool);
  } else {
    let attempts = 0;
    do {
      combined = shuffleArray(pool).slice(0, suggestionLimit);
      attempts += 1;
    } while (attempts < 7 && arraysEqual(combined.map(sanitizeTitle), state.lastSuggestionBatch));
  }

  state.lastSuggestionBatch = combined.map(sanitizeTitle);

  elements.aiSuggestionList.innerHTML = "";

  if (!combined.length) {
    elements.aiSuggestionList.innerHTML = '<li class="task-item"><p class="task-title">You are fully planned. Great job.</p></li>';
    return;
  }

  combined.forEach((title) => {
    const item = document.createElement("li");
    item.className = "task-item";
    const titleNode = document.createElement("p");
    titleNode.className = "task-title";
    titleNode.textContent = title;
    item.title = "Click to add this suggestion";
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      elements.taskInput.value = title;
      elements.taskInput.focus();
      showStatus("Suggestion copied to task input.");
    });
    item.appendChild(titleNode);
    elements.aiSuggestionList.appendChild(item);
  });
};

const renderSideSections = (tasks) => {
  renderImportantTasks(tasks);
  renderCompletedHistory(tasks);
};

const showStatus = (message, isError = false) => {
  elements.statusMessage.textContent = message;
  elements.statusMessage.style.color = isError ? "#b74848" : "#145948";
};

const showAuthMessage = (message, isError = false) => {
  if (!elements.authMessage) {
    return;
  }

  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("hidden", !message);
  elements.authMessage.style.color = isError ? "#b74848" : "#14579f";
  elements.authMessage.style.borderColor = isError ? "rgba(183, 72, 72, 0.22)" : "rgba(20, 87, 159, 0.18)";
  elements.authMessage.style.background = isError ? "rgba(183, 72, 72, 0.09)" : "rgba(20, 87, 159, 0.08)";
};

const switchAuthTab = (tab) => {
  const signupActive = tab === "signup";
  elements.signupForm.classList.toggle("hidden", !signupActive);
  elements.loginForm.classList.toggle("hidden", signupActive);
  if (elements.authSwitchText) {
    const hideSignupPrompt = !signupActive && state.justRegistered;
    elements.authSwitchText.classList.toggle("hidden", hideSignupPrompt);
  }
  showAuthMessage("");
};

const saveSession = (token, user) => {
  state.token = token;
  state.user = user;
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

const clearSession = () => {
  state.token = "";
  state.user = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${state.token}`
});

const request = async (url, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${url}`, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Something went wrong.";
    throw new Error(message);
  }

  return data;
};

const createTaskListItem = (task, options = {}) => {
  const { actionMode = "all" } = options;
  const item = document.createElement("li");
  item.className = "task-item";

  const starToggleBtn = document.createElement("button");
  starToggleBtn.className = `action-btn star-btn task-star-toggle ${task.important ? "active" : ""}`;
  starToggleBtn.textContent = task.important ? "★" : "☆";
  starToggleBtn.type = "button";
  starToggleBtn.setAttribute("aria-label", task.important ? "Unstar task" : "Star task");
  starToggleBtn.addEventListener("click", () => toggleTaskImportant(task._id));

  const taskTitle = document.createElement("p");
  taskTitle.className = `task-title ${task.completed ? "done" : ""}`;
  taskTitle.textContent = task.title;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const completeBtn = document.createElement("button");
  completeBtn.className = "action-btn complete-btn";
  completeBtn.textContent = task.completed ? "Undo" : "Complete";
  completeBtn.type = "button";
  completeBtn.addEventListener("click", () => toggleTask(task._id));

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "action-btn delete-btn";
  deleteBtn.textContent = "Delete";
  deleteBtn.type = "button";
  deleteBtn.addEventListener("click", () => deleteTask(task._id));

  if (actionMode === "delete") {
    actions.append(deleteBtn);
  } else {
    actions.append(starToggleBtn, completeBtn, deleteBtn);
  }
  item.append(taskTitle, actions);

  return item;
};

const renderTasks = (tasks) => {
  let displayTasks = tasks;

  if (state.filteredByDate) {
    displayTasks = tasks.filter((task) => isTaskForDate(task, state.filteredByDate));
  }

  elements.taskList.innerHTML = "";

  if (!displayTasks.length) {
    const noTaskMsg = state.filteredByDate
      ? `<li class="task-item"><p class="task-title">No tasks for this date. Add a task to get started.</p></li>`
      : '<li class="task-item"><p class="task-title">No tasks yet. Add your first task.</p></li>';
    elements.taskList.innerHTML = noTaskMsg;
    elements.taskCount.textContent = "0 tasks";
    return;
  }

  displayTasks.forEach((task) => {
    elements.taskList.appendChild(createTaskListItem(task));
  });

  const completed = displayTasks.filter((task) => task.completed).length;
  elements.taskCount.textContent = `${displayTasks.length} task${displayTasks.length > 1 ? "s" : ""} | ${completed} completed`;
};

const fetchTasks = async () => {
  try {
    const tasks = await request("/tasks", {
      method: "GET",
      headers: authHeaders()
    });

    state.tasks = tasks;
    buildTasksByDate();
    renderTasks(tasks);
    renderSideSections(tasks);
    if (!elements.calendarPopup.classList.contains("hidden")) {
      renderCalendar();
    }
  } catch (error) {
    showStatus(error.message, true);
  }
};

const toggleTaskImportant = async (taskId) => {
  try {
    await request(`/tasks/${taskId}/star`, {
      method: "PATCH",
      headers: authHeaders()
    });

    await fetchTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
};

const toggleTask = async (taskId) => {
  try {
    await request(`/tasks/${taskId}`, {
      method: "PATCH",
      headers: authHeaders()
    });

    await fetchTasks();
  } catch (error) {
    showStatus(error.message, true);
  }
};

const deleteTask = async (taskId) => {
  try {
    await request(`/tasks/${taskId}`, {
      method: "DELETE",
      headers: authHeaders()
    });

    await fetchTasks();
    showStatus("Task deleted.");
  } catch (error) {
    showStatus(error.message, true);
  }
};

const setAuthenticatedView = async () => {
  document.body.classList.remove("logged-out");
  elements.authSection.classList.add("hidden");
  elements.brandPanel.classList.remove("hidden");
  elements.appHeader.classList.remove("hidden");
  elements.statusMessage.classList.remove("hidden");
  elements.logoutBtn.classList.remove("hidden");
  elements.welcomeText.textContent = `Welcome, ${formatDisplayName(state.user?.name)}`;
  setActivePage(state.activePage);
  showStatus("You are logged in.");
  showAuthMessage("");
  await fetchTasks();
  renderAiSuggestions();
  
  const today = getTodayDateStr();
  state.filteredByDate = today;
  state.isFilteredToday = true;
  updateDateDisplays();
  elements.clearFilterBtn.classList.add("hidden");
  elements.dateFilterInfo.classList.remove("hidden");
};

const setLoggedOutView = () => {
  document.body.classList.add("logged-out");
  elements.authSection.classList.remove("hidden");
  elements.brandPanel.classList.add("hidden");
  elements.appHeader.classList.add("hidden");
  elements.taskSection.classList.add("hidden");
  elements.importantSection.classList.add("hidden");
  elements.historySection.classList.add("hidden");
  elements.logoutBtn.classList.add("hidden");
  elements.welcomeText.textContent = "Welcome";
  showStatus("");
  showAuthMessage("");
  state.tasks = [];
  state.lastSuggestionBatch = [];
  elements.taskList.innerHTML = "";
  elements.taskCount.textContent = "0 tasks";
  elements.aiQuestionInput.value = "";
  elements.aiResponseText.textContent = "Your AI answer will appear here.";
  renderSideSections([]);
  elements.aiSuggestionList.innerHTML = '<li class="task-item"><p class="task-title">Login to get personalized suggestions.</p></li>';
  switchAuthTab("login");
};

elements.myDayPageBtn.addEventListener("click", () => setActivePage("tasks"));
elements.importantPageBtn.addEventListener("click", () => setActivePage("important"));
elements.historyPageBtn.addEventListener("click", () => setActivePage("history"));

elements.aiSuggestBtn.addEventListener("click", () => {
  renderAiSuggestions();
  showStatus("AI suggestions generated.");
});

elements.askAiBtn.addEventListener("click", askAiInApp);
elements.aiQuestionInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    askAiInApp();
  }
});

if (elements.goToSignupLink) {
  elements.goToSignupLink.addEventListener("click", (event) => {
    event.preventDefault();
    state.justRegistered = false;
    switchAuthTab("signup");
  });
}

elements.signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    name: document.getElementById("signupName").value.trim(),
    email: document.getElementById("signupEmail").value.trim(),
    password: document.getElementById("signupPassword").value
  };

  try {
    const data = await request("/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    elements.signupForm.reset();
    state.justRegistered = true;
    switchAuthTab("login");
    showAuthMessage("Account created successfully. Now login.");
  } catch (error) {
    showAuthMessage(error.message, true);
  }
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    email: document.getElementById("loginEmail").value.trim(),
    password: document.getElementById("loginPassword").value
  };

  try {
    const data = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    saveSession(data.token, data.user);
    elements.loginForm.reset();
    await setAuthenticatedView();
  } catch (error) {
    showAuthMessage(error.message, true);
  }
});

elements.taskForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = elements.taskInput.value.trim();
  if (!title) {
    return;
  }

  const payload = { title };
  const dueDateForTask = state.selectedDate || state.filteredByDate || getTodayDateStr();
  payload.dueDate = dueDateForTask;

  try {
    await request("/tasks", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });

    elements.taskForm.reset();
    state.selectedDate = dueDateForTask;
    state.filteredByDate = dueDateForTask;
    state.isFilteredToday = dueDateForTask === getTodayDateStr();
    updateDateDisplays();
    elements.dateFilterInfo.classList.remove("hidden");
    closeCalendar();
    await fetchTasks();
    showStatus("Task added.");
  } catch (error) {
    showStatus(error.message, true);
  }
});

elements.logoutBtn.addEventListener("click", () => {
  clearSession();
  setLoggedOutView();
  showStatus("Logged out successfully.");
});

elements.calendarToggleBtn.addEventListener("click", () => {
  toggleCalendar();
});

elements.prevMonthBtn.addEventListener("click", () => {
  state.calendarMonth.setMonth(state.calendarMonth.getMonth() - 1);
  renderCalendar();
});

elements.nextMonthBtn.addEventListener("click", () => {
  state.calendarMonth.setMonth(state.calendarMonth.getMonth() + 1);
  renderCalendar();
});

elements.clearDateBtn.addEventListener("click", () => {
  state.selectedDate = null;
  renderCalendar();
});

elements.clearFilterBtn.addEventListener("click", () => {
  const today = getTodayDateStr();
  state.filteredByDate = today;
  state.isFilteredToday = true;
  state.selectedDate = today;
  elements.clearFilterBtn.classList.add("hidden");
  updateDateDisplays();
  elements.dateFilterInfo.classList.remove("hidden");
  renderCalendar();
  renderTasks(state.tasks);
  renderSideSections(state.tasks);
});

if (state.token && state.user) {
  setAuthenticatedView();
} else {
  setLoggedOutView();
}
