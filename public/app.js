const app = document.getElementById("app");

const state = {
  data: null,
  selectedMemberId: Number(localStorage.getItem("soberStreakMember")) || null,
  month: new Date()
};

function esc(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function dateKey(year, monthIndex, day) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
}

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(date);
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getSelectedMember() {
  return state.data?.members.find(
    (member) => member.id === state.selectedMemberId
  ) || state.data?.members[0];
}

function ordinalRank(index) {
  if (index === 0) return "🏆";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  return String(index + 1);
}

function renderCalendar(member) {
  const year = state.month.getFullYear();
  const month = state.month.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const soberSet = new Set(member.sober_dates);
  const today = new Date();

  let cells = "";

  for (let i = 0; i < startOffset; i += 1) {
    cells += `<div class="calendar-empty"></div>`;
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = dateKey(year, month, day);
    const sober = soberSet.has(key);
    const future = date > new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayClass = isSameDay(date, today) ? " today" : "";
    const soberClass = sober ? " sober" : "";
    const disabled = future ? " disabled" : "";

    cells += `
      <button
        class="day${soberClass}${todayClass}${disabled}"
        ${future ? "disabled" : ""}
        onclick="toggleDay('${key}')"
        title="${future ? "Future date" : sober ? "Marked sober — click to remove" : "Mark this day sober"}"
      >
        <span class="day-number">${day}</span>
        ${sober ? '<span class="check">✓</span>' : ""}
      </button>
    `;
  }

  return `
    <section class="calendar-card">
      <div class="card-heading">
        <div>
          <span class="eyebrow">YOUR CALENDAR</span>
          <h2>${esc(member.name)}'s sober days</h2>
        </div>
        <div class="month-controls">
          <button onclick="changeMonth(-1)" aria-label="Previous month">‹</button>
          <strong>${monthLabel(state.month)}</strong>
          <button onclick="changeMonth(1)" aria-label="Next month">›</button>
        </div>
      </div>

      <div class="weekdays">
        ${["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => `<span>${day}</span>`).join("")}
      </div>

      <div class="calendar-grid">${cells}</div>

      <div class="calendar-help">
        <span class="legend-dot"></span>
        Click a day to mark it sober. Click again to undo it.
      </div>
    </section>
  `;
}

function renderLeaderboard() {
  const members = state.data.members;

  return `
    <section class="leaderboard-card">
      <div class="card-heading">
        <div>
          <span class="eyebrow">THE LEADERBOARD</span>
          <h2>Who's leading the way?</h2>
        </div>
        <span class="live-pill"><span></span> Live</span>
      </div>

      <div class="leaderboard-list">
        ${members.map((member, index) => `
          <div class="leader-row ${member.id === state.selectedMemberId ? "selected" : ""}">
            <div class="rank">${ordinalRank(index)}</div>
            <div class="leader-name">
              <strong>${esc(member.name)}</strong>
              ${member.id === state.selectedMemberId ? '<span>You</span>' : ""}
            </div>
            <div class="stat">
              <strong>${member.sober_days}</strong>
              <span>days</span>
            </div>
            <div class="streak">
              <strong>🔥 ${member.current_streak}</strong>
              <span>current</span>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="leaderboard-note">
        Longest streaks are tracked too. Keep stacking sober days.
      </div>
    </section>
  `;
}

function renderStats(member) {
  return `
    <section class="stats-grid">
      <div class="stat-card">
        <span>YOUR SOBER DAYS</span>
        <strong>${member.sober_days}</strong>
      </div>
      <div class="stat-card">
        <span>CURRENT STREAK</span>
        <strong>🔥 ${member.current_streak}</strong>
      </div>
      <div class="stat-card">
        <span>LONGEST STREAK</span>
        <strong>🏅 ${member.longest_streak}</strong>
      </div>
    </section>
  `;
}

function render() {
  if (!state.data) {
    app.innerHTML = `<div class="loading">Loading Sober Streaks…</div>`;
    return;
  }

  if (!state.selectedMemberId ||
      !state.data.members.some(m => m.id === state.selectedMemberId)) {
    state.selectedMemberId = state.data.members[0]?.id ?? null;
    localStorage.setItem("soberStreakMember", state.selectedMemberId ?? "");
  }

  const member = getSelectedMember();

  app.innerHTML = `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">S</div>
        <div>
          <strong>Sober Streaks</strong>
          <span>Shared sober-day tracker</span>
        </div>
      </div>
      <div class="group-summary">
        <span>Group total</span>
        <strong>${state.data.total}</strong>
        <span>days</span>
      </div>
    </header>

    <section class="hero">
      <span class="badge">SOBER STREAKS</span>
      <h1>Keep the streak going.</h1>
      <p>Mark the days you stayed sober, build your streak, and see where the group stands.</p>

      <div class="member-picker">
        <label for="member">Who are you?</label>
        <select id="member" onchange="selectMember(this.value)">
          ${state.data.members.map(m => `
            <option value="${m.id}" ${m.id === member.id ? "selected" : ""}>
              ${esc(m.name)}
            </option>
          `).join("")}
        </select>
      </div>
    </section>

    ${renderStats(member)}

    <div class="dashboard">
      <div class="main-column">
        ${renderCalendar(member)}
      </div>
      <aside class="side-column">
        ${renderLeaderboard()}
        <section class="group-card">
          <span class="eyebrow">GROUP AVERAGE</span>
          <strong>${state.data.average}</strong>
          <span>sobers days per person</span>
        </section>
      </aside>
    </div>

    <section class="bottom-note">
      <strong>One day at a time.</strong>
      <span>Mark only days you actually stayed sober. No judgment, just progress.</span>
    </section>
  `;
}

async function load() {
  try {
    const response = await fetch("/api/data", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not load the tracker.");
    }

    state.data = data;
    render();
  } catch (error) {
    console.error(error);
    app.innerHTML = `
      <div class="error-card">
        <div class="brand-mark">S</div>
        <h1>Oops.</h1>
        <p>Could not load Sober Streaks.</p>
        <button onclick="load()">Try again</button>
      </div>
    `;
  }
}

window.selectMember = (id) => {
  state.selectedMemberId = Number(id);
  localStorage.setItem("soberStreakMember", String(state.selectedMemberId));
  render();
};

window.changeMonth = (amount) => {
  state.month = new Date(
    state.month.getFullYear(),
    state.month.getMonth() + amount,
    1
  );
  render();
};

window.toggleDay = async (date) => {
  const member = getSelectedMember();
  if (!member) return;

  try {
    document.body.classList.add("saving");

    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        memberId: member.id,
        date
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Could not update the day.");
    }

    state.data = data;
    render();
  } catch (error) {
    alert(error.message);
  } finally {
    document.body.classList.remove("saving");
  }
};

load();
