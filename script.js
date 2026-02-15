// Database Config (Update these when ready)
const SUPABASE_URL = 'https://zyswcgbwnxkfnyskdxsq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5c3djZ2J3bnhrZm55c2tkeHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwODA4NDYsImV4cCI6MjA4NjY1Njg0Nn0.3YEWSI1gTaYA40PGaIA-Y0XO095Rwpmd9nU2PreItJ4';

// --- STATE MANAGEMENT ---
let streak = parseInt(localStorage.getItem('reclaim_streak')) || 0;
let peaceBadges = parseInt(localStorage.getItem('reclaim_peace')) || 0;
let strengthBadges = parseInt(localStorage.getItem('reclaim_strength')) || 0;
let currentRank = localStorage.getItem('reclaim_rank') || "The Void";
let zenActive = false;
let unlockTimer, zenTimer, breathInterval, timeLeft = 120;

const communityNames = ["ShadowWalker", "Phoenix_99", "IronWill", "ZenMaster", "Nova", "RootedOne"];
const communityActions = ["reached Rank: First Spark", "completed Zen Session", "is 15 days strong", "survived a trigger"];

// --- UI UPDATER & LEVEL SYSTEM ---
const updateUI = () => {
    document.getElementById('streak-count').innerText = streak;
    document.getElementById('badge-strength').innerText = `💪 ${strengthBadges}`;
    document.getElementById('badge-peace').innerText = `🕊️ ${peaceBadges}`;

    let rank = "The Void";
    if (streak >= 30) rank = "Golden Ember";
    else if (streak >= 15) rank = "Iron Pillar";
    else if (streak >= 7) rank = "The Root";
    else if (streak >= 3) rank = "First Spark";

    // Level System Logic: Trigger Popup on Rank Increase
    const rankOrder = ["The Void", "First Spark", "The Root", "Iron Pillar", "Golden Ember"];
    if (rankOrder.indexOf(rank) > rankOrder.indexOf(currentRank)) {
        triggerRankPopup(rank);
    }

    currentRank = rank;
    localStorage.setItem('reclaim_rank', rank);
    document.getElementById('rank-display').innerText = rank;
};

// --- CORE ACTIONS ---
window.incrementStreak = () => {
    streak++;
    localStorage.setItem('reclaim_streak', streak);
    addMsg("System", "Neural pathway confirmed.");
    updateUI();
};

window.startResetQuiz = () => document.getElementById('quiz-modal').classList.remove('hidden');
window.confirmReset = () => {
    streak = 0;
    currentRank = "The Void";
    localStorage.setItem('reclaim_streak', 0);
    localStorage.setItem('reclaim_rank', "The Void");
    document.getElementById('quiz-modal').classList.add('hidden');
    updateUI();
};

window.toggleTheme = () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('reclaim_theme', isDark ? 'dark' : 'light');
};

// --- PANIC / ZEN FUNCTION ---
window.toggleZen = () => {
    const zen = document.getElementById('zen-mode');
    const audio = document.getElementById('zen-audio');
    zenActive = !zenActive;
    zen.classList.toggle('hidden');

    if (zenActive) {
        audio.play().catch(() => {});
        timeLeft = 120;
        breathInterval = setInterval(() => {
            const disk = document.getElementById('breathing-disk');
            const exp = disk.classList.toggle('zen-expand');
            document.getElementById('zen-text').innerText = exp ? "Exhale" : "Inhale";
        }, 4000);
        zenTimer = setInterval(() => {
            timeLeft--;
            document.getElementById('zen-timer').innerText = `${Math.floor(timeLeft/60)}:${(timeLeft%60).toString().padStart(2,'0')}`;
            if(timeLeft <= 0) {
                window.toggleZen();
                peaceBadges++;
                localStorage.setItem('reclaim_peace', peaceBadges);
                updateUI();
            }
        }, 1000);
    } else {
        clearInterval(zenTimer); clearInterval(breathInterval);
        audio.pause();
    }
};

// --- FOCUS LOCK ---
window.lockApp = () => document.getElementById('focus-lock').classList.remove('hidden');
window.startUnlock = () => unlockTimer = setTimeout(() => document.getElementById('focus-lock').classList.add('hidden'), 2000);
window.stopUnlock = () => clearTimeout(unlockTimer);

// --- RANK POPUP ---
window.triggerRankPopup = (rankName) => {
    const popup = document.getElementById('rank-popup');
    document.getElementById('new-rank-name').innerText = rankName.toUpperCase();
    popup.classList.remove('hidden');
    strengthBadges += 5;
    localStorage.setItem('reclaim_strength', strengthBadges);
};
window.closeRankPopup = () => document.getElementById('rank-popup').classList.add('hidden');

// --- LIVE PULSE ---
const updateCommunityFeed = () => {
    const container = document.getElementById('feed-container');
    if(!container) return;
    const name = communityNames[Math.floor(Math.random() * communityNames.length)];
    const action = communityActions[Math.floor(Math.random() * communityActions.length)];
    const entry = document.createElement('div');
    entry.className = "feed-entry text-[10px] border-l-2 border-blue-500/30 pl-3 py-1";
    entry.innerHTML = `<span class="font-bold text-blue-400">${name}</span> <span class="opacity-60">${action}</span>`;
    container.prepend(entry);
    if (container.children.length > 4) container.removeChild(container.lastChild);
    document.getElementById('online-count').innerText = `${(1200 + Math.floor(Math.random() * 50)).toLocaleString()} online`;
};

// --- CHAT ---
const addMsg = (sender, text) => {
    const box = document.getElementById('chat-box');
    box.innerHTML += `<p><strong>${sender}:</strong> ${text}</p>`;
    box.scrollTop = box.scrollHeight;
};
window.sendMessage = () => {
    const input = document.getElementById('chat-input');
    if (!input.value) return;
    addMsg("You", input.value);
    setTimeout(() => addMsg("Guide", "The sanctuary remains open. Stay focused."), 600);
    input.value = "";
};

// --- INITIALIZE ---
window.onload = () => {
    if (localStorage.getItem('reclaim_theme') === 'dark') document.body.classList.add('dark-mode');
    const tasks = ["10 Pushups", "Cold Shower", "Meditate 2m", "No Social Media 1h"];
    document.getElementById('mission-text').innerText = tasks[Math.floor(Math.random() * tasks.length)];
    updateUI();
    setInterval(updateCommunityFeed, 6000);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
};