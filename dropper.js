let inventory = JSON.parse(localStorage.getItem('REWP_Inventory')) || [];
let dailyAllowance = parseFloat(localStorage.getItem('REWP_Allowance')) || 50;

// Optimized Boot Logic
window.addEventListener('DOMContentLoaded', () => {
    // Start calculations immediately in the background
    if (typeof calculate === "function") calculate(); 
    
    // Reduce the wait time significantly (from 30s to 1.5s for "Pro" feel)
    setTimeout(finishBoot, 1500); 
});

function finishBoot() {
    const splash = document.getElementById('splash-screen');
    if (splash) {
        splash.style.transition = "opacity 0.5s ease";
        splash.style.opacity = '0';
        if (window.navigator.vibrate) window.navigator.vibrate([50, 30, 50]); 
        setTimeout(() => splash.remove(), 500);
    }
}


function addItem() {
    const type = document.getElementById('matType');
    const weightInput = document.getElementById('weight');
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) return;

    const now = new Date();
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    inventory.push({
        name: type.options[type.selectedIndex].text,
        rate: parseFloat(type.value),
        weight: weight,
        time: timestamp 
    });

    localStorage.setItem('REWP_Inventory', JSON.stringify(inventory));
    showSuccessToast(`${weight}kg Added Successfully`);
    weightInput.value = '';
    calculate();
}

function calculate() {
    let grossTotal = 0;
    const dist = parseFloat(document.getElementById('distance').value) || 0;
    const cons = parseFloat(document.getElementById('consuption').value) || 0;
    const fuel = parseFloat(document.getElementById('fuelPrice').value) || 0;
    const travelCost = (dist / 100) * cons * fuel;

    inventory.forEach(item => { grossTotal += item.weight * item.rate; });

    const netValue = grossTotal - travelCost;
    const finalPocket = netValue - dailyAllowance;

    // UI Updates
    document.getElementById('gross').innerText = `R${grossTotal.toFixed(2)}`;
    document.getElementById('travel').innerText = `- R${travelCost.toFixed(2)}`;
    
    document.getElementById('netProfit').innerHTML = `
        <span style="font-size:0.8rem; opacity:0.7;">Net: R${netValue.toFixed(2)}</span><br>
        <strong>Pocket: R${finalPocket.toFixed(2)}</strong>
    `;

    // 1. UPDATE PULSE EFFECT
    updatePulseEffect(finalPocket);

    // 2. CHECK TARGET REMINDERS
    checkReminders(netValue);

    // 3. REFRESH HISTORY LIST
    updateHistoryList();

    // 4. UPDATE GOAL TRACKER (If function exists)
    if (typeof updateGoalTracker === "function") {
        updateGoalTracker(grossTotal, travelCost);
    }
    let inspectionStarted = false;

function checkSafetyStatus() {
    const boots = document.getElementById('ppe-boots').checked;
    const vest = document.getElementById('ppe-vest').checked;
    const gloves = document.getElementById('ppe-gloves').checked;
    
    const allowanceBtn = document.querySelector('.btn-main[onclick="openAllowance()"]');
    
    // Mark that the user has started checking gear
    if (boots || vest || gloves) inspectionStarted = true;

    if (inspectionStarted && (!boots || !vest || !gloves)) {
        // If they started but missed something: Pulse Red
        allowanceBtn.classList.add('pulse-red');
        allowanceBtn.innerHTML = "⚠️ Complete Safety Check";
        allowanceBtn.style.background = "#ff4444";
    } else if (boots && vest && gloves) {
        // All checked: Turn Green/Success
        allowanceBtn.classList.remove('pulse-red');
        allowanceBtn.innerHTML = "✅ Safety Verified";
        allowanceBtn.style.background = "#28a745";
    } else {
        // Default State (Before any clicks)
        allowanceBtn.innerHTML = "💰 Manage Allowance";
        allowanceBtn.style.background = "#007bff";
    }
}
    
} // <--- THIS BRACKET WAS MISSING AND CAUSED THE ERROR

function toggleWallet() {
    const wallet = document.getElementById('walletPopup');
    const fab = document.getElementById('mainFab');
    
    if (wallet.style.display === 'none' || wallet.style.display === '') {
        wallet.style.display = 'flex';
        if (fab) fab.style.display = 'none'; // Hide button when wallet is open
    } else {
        wallet.style.display = 'none';
        if (fab) fab.style.display = 'block'; // SHOW button when wallet is hidden
    }
}

function updateHistoryList() {
    const list = document.getElementById('historyList');
    if (!list) return;
    
    const dist = parseFloat(document.getElementById('distance').value) || 0;
    const cons = parseFloat(document.getElementById('consuption').value) || 0;
    const fuel = parseFloat(document.getElementById('fuelPrice').value) || 0;
    const totalTripCost = (dist / 100) * cons * fuel;
    
    const totalWeight = inventory.reduce((sum, item) => sum + item.weight, 0);
    list.innerHTML = '';

    inventory.forEach((item, index) => {
        const itemGross = item.weight * item.rate;
        const itemFuelShare = totalWeight > 0 ? (item.weight / totalWeight) * totalTripCost : 0;
        const itemNet = itemGross - itemFuelShare;

        const logItem = document.createElement('div');
        logItem.className = 'history-item';
        logItem.style = "background: rgba(255,255,255,0.05); margin-bottom: 8px; padding: 10px; border-radius: 6px; border-left: 4px solid #00ff88;";
        
        logItem.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="color:#00ff88;">${item.name}</strong>
                    <div style="font-size:0.7rem; color:#aaa;">Net: R${itemNet.toFixed(2)} (Fuel: -R${itemFuelShare.toFixed(2)})</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">R${itemGross.toFixed(2)}</div>
                    <button onclick="removeItem(${index})" style="color:#ff4444; background:none; border:none; cursor:pointer;">✕</button>
                </div>
            </div>
        `;
        list.appendChild(logItem);
    });
}

// Tab Switcher Logic
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
    document.getElementById('tab-' + tabId).style.display = 'block';
}

function openAllowance() {
    document.getElementById('allowanceModal').style.display = 'flex';
}

function closeAllowance() {
    document.getElementById('allowanceModal').style.display = 'none';
    calculate(); // Recalculate based on new inputs
}

// Red Pulse Animation Trigger
function updatePulseEffect(pocketValue) {
    const allowanceBtn = document.querySelector('.btn-main[onclick="openAllowance()"]');
    if (pocketValue <= 0) {
        allowanceBtn.classList.add('pulse-red');
    } else {
        allowanceBtn.classList.remove('pulse-red');
    }
}

function toggleRecyclerInfo() {
    const info = document.getElementById('infoContent');
    if (!info) return;

    const isHidden = (info.style.display === 'none' || info.style.display === '');
    info.style.display = isHidden ? 'block' : 'none';

    if (isHidden) {
        updateRecyclerStats(); // From previous step
        startTripRoutine();    // Start the routine.js networking flow
    }
}

function updateRecyclerStats() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay(); // 0=Sun, 6=Sat
    
    // 🚦 Traffic Occupation Logic
    let traffic = "Low";
    if (hour >= 11 && hour <= 13) traffic = "🔴 High (Lunch Rush)";
    else if (hour >= 7 && hour <= 9) traffic = "🟡 Medium (Morning Drop)";
    else if (day === 6) traffic = "🔴 High (Weekend Peak)";
    document.getElementById('trafficStatus').innerHTML = traffic;

    // 🕒 Last Claim Deadline
    // Standard weekday close is 17:00; Saturday/Holiday is 13:00
    const deadlineHour = (day === 6 || day === 0) ? 13 : 17;
    const timeLeft = deadlineHour - hour;
    
    if (timeLeft > 0 && timeLeft <= 1) {
        showSuccessToast(`⚠️ Warning: Yard closes in ${Math.round(timeLeft * 60)} mins!`);
    }
}

function checkReminders(net) {
    const targetInput = document.getElementById('targetInput');
    if (!targetInput) return;
    
    const target = parseFloat(targetInput.value) || 0;
    const reminderBtn = document.querySelector('.btn-main'); 
    
    if (reminderBtn && target > 0) {
        if (net >= target) {
            reminderBtn.style.background = "#ffcc00";
            reminderBtn.style.color = "#000";
            reminderBtn.innerText = "⭐ Target Reached!";
        } else {
            reminderBtn.style.background = ""; 
            reminderBtn.style.color = "";
            reminderBtn.innerText = "Save Target";
        }
    }
}

function removeItem(index) {
    if(confirm("Delete this entry?")) {
        inventory.splice(index, 1);
        localStorage.setItem('REWP_Inventory', JSON.stringify(inventory));
        calculate();
    }
}

function clearHistory() {
    if (confirm("Clear all logs?")) {
        inventory = [];
        localStorage.removeItem('REWP_Inventory');
        calculate();
    }
}

// Event Listeners
document.getElementById('weight').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
    }
});
function saveBudget() {
    const budgetData = {
        fixed: document.getElementById('asset-fixed').value,
        short: document.getElementById('asset-short').value,
        edu: document.getElementById('all-edu').value,
        occ: document.getElementById('all-occ').value
    };
    localStorage.setItem('REWP_BudgetSheet', JSON.stringify(budgetData));
    showSuccessToast("Budget Sheet Synchronized");
    closeAllowance();
}
function checkSafetyStatus() {
    const safetyBudget = parseFloat(document.getElementById('exp-safety')?.value) || 0;
    const allChecked = document.getElementById('ppe-boots').checked && 
                       document.getElementById('ppe-vest').checked &&
                       document.getElementById('ppe-gloves').checked;
    
    const allowanceBtn = document.querySelector('.btn-main[onclick="openAllowance()"]');

    if (safetyBudget <= 0 || !allChecked) {
        // High-priority warning
        allowanceBtn.style.background = "#ff4444";
        allowanceBtn.innerHTML = "⚠️ Safety Check Required";
        allowanceBtn.classList.add('pulse-red');
    } else {
        // All clear
        allowanceBtn.style.background = "#007bff";
        allowanceBtn.innerHTML = "💰 Manage Allowance";
        allowanceBtn.classList.remove('pulse-red');
    }
}

// Ensure this runs whenever you calculate or open the modal
function openAllowance() {
    document.getElementById('allowanceModal').style.display = 'flex';
    checkSafetyStatus(); 
}
