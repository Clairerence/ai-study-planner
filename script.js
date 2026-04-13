const form = document.getElementById("studyForm");
const outputDiv = document.getElementById("output");

// ===== LOAD SAVED PLAN =====
window.onload = function () {
    const saved = localStorage.getItem("elitePlan");
    if (saved) {
        outputDiv.innerHTML = saved;
    }
};

// ===== CORE ENGINE =====
function buildStudyEngine(subjects, difficulties, hours, daysLeft) {
    
    // 1. Normalize difficulty safely
    const weights = difficulties.map(d => {
        let val = parseInt(d.trim());
        return isNaN(val) ? 1 : Math.min(Math.max(val, 1), 3);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // 2. Build subject allocation model (intelligence layer)
    const subjectPlan = subjects.map((sub, i) => {
        let weight = weights[i] || 1;

        return {
            name: sub.trim(),
            weight: weight,
            dailyHours: (weight / totalWeight) * hours,
            frequency: Math.round((weight / totalWeight) * 3) // repetition factor
        };
    });

    return subjectPlan;
}

// ===== SMART SCHEDULER =====
function generateSchedule(subjectPlan, daysLeft) {
    let schedule = [];

    for (let day = 0; day < daysLeft; day++) {

        // rotate but prioritize heavy subjects more often
        let dayPlan = [];

        subjectPlan.forEach(sub => {
            if (day % sub.frequency === 0) {
                dayPlan.push(sub.name);
            }
        });

        // fallback if empty
        if (dayPlan.length === 0) {
            dayPlan.push(subjectPlan[day % subjectPlan.length].name);
        }

        schedule.push({
            day: day + 1,
            subjects: dayPlan
        });
    }

    return schedule;
}

// ===== RENDER ENGINE =====
function renderPlan(subjectPlan, schedule, hours, daysLeft) {

    let plan = `<h3>🔥 AI Study Engine Plan</h3>`;
    plan += `<p><strong>Days Left:</strong> ${daysLeft}</p>`;
    plan += `<p><strong>Daily Hours:</strong> ${hours}</p>`;

    plan += `<h4>📊 Subject Allocation</h4>`;

    subjectPlan.forEach(sub => {
        plan += `
        <div class="task">
            <span>${sub.name} → ${sub.dailyHours.toFixed(2)} hrs/day</span>
            <input type="checkbox" onchange="saveProgress()">
        </div>`;
    });

    plan += `<h4>🗓️ Adaptive Schedule</h4>`;

    schedule.forEach(day => {
        plan += `<p><strong>Day ${day.day}:</strong> ${day.subjects.join(", ")}</p>`;
    });

    return plan;
}

// ===== MAIN ENGINE RUN =====
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const subjects = document.getElementById("subjects").value.split(",");
    const difficulty = document.getElementById("difficulty").value.split(",");
    const hours = parseFloat(document.getElementById("hours").value);
    const examDate = new Date(document.getElementById("examDate").value);

    const today = new Date();
    const daysLeft = Math.max(
        1,
        Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))
    );

    const subjectPlan = buildStudyEngine(subjects, difficulty, hours, daysLeft);
    const schedule = generateSchedule(subjectPlan, daysLeft);

    const planHTML = renderPlan(subjectPlan, schedule, hours, daysLeft);

    outputDiv.innerHTML = planHTML;
    localStorage.setItem("elitePlan", planHTML);
});

// ===== MEMORY SYSTEM =====
function saveProgress() {
    localStorage.setItem("elitePlan", outputDiv.innerHTML);
}

// ===== TIMER ENGINE =====
let time = 1500;
let timer;

function startTimer() {
    clearInterval(timer);

    timer = setInterval(() => {
        let minutes = Math.floor(time / 60);
        let seconds = time % 60;

        document.getElementById("time").innerText =
            `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`;

        time--;

        if (time < 0) {
            clearInterval(timer);
            alert("Session Complete! Take a strategic break.");
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timer);
    time = 1500;
    document.getElementById("time").innerText = "25:00";
}
