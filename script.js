async function generateAIPlan(prompt) {
    const apiKey = "AIzaSyDJ_4JB7mlnBLiwfC3WHUYhdNeALKxn-bs";

    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + apiKey,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        }
    );

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
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
form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const subjects = document.getElementById("subjects").value;
    const difficulty = document.getElementById("difficulty").value;
    const hours = document.getElementById("hours").value;
    const examDate = document.getElementById("examDate").value;

    const prompt = `
You are a smart medical study planner AI.

Create a structured study plan.

Subjects: ${subjects}
Difficulty levels: ${difficulty}
Hours per day: ${hours}
Exam date: ${examDate}

Rules:
- Break into daily schedule
- Prioritize harder subjects
- Include revision days
- Keep it realistic for a medical student
`;

    outputDiv.innerHTML = "Generating AI study plan...";

    const aiResponse = await generateAIPlan(prompt);

    outputDiv.innerHTML = aiResponse;

    localStorage.setItem("studyPlan", aiResponse);
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
