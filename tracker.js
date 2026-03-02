// tracker.js
function toggleWallet() {
    const wallet = document.getElementById('walletPopup');
    if (wallet) wallet.classList.toggle('active');
}

let fuelAlertTriggered = false; // Prevents constant vibrating

function updateGoalTracker(gross, travel) {
    const fill = document.getElementById('goalFill');
    const txt = document.getElementById('goalText');
    // ... (previous logic for hist and weightDisplay)

    let percent = travel > 0 ? (gross / travel) * 100 : 0;
    
    // FUEL OVERTAKE ALERT
    if (percent >= 100 && !fuelAlertTriggered) {
        fuelAlertTriggered = true;
        showSuccessToast("⛽ FUEL COVERED! Trip is now Profitable!");
        
        // Vibrate: Short - Long - Short (SOS style)
        if (window.navigator.vibrate) {
            window.navigator.vibrate([200, 100, 500, 100, 200]);
        }
    } else if (percent < 100) {
        fuelAlertTriggered = false; // Reset if you clear history
    }

    fill.style.width = Math.min(percent, 100) + "%";
    fill.style.background = percent >= 100 ? "#00ff88" : "#ff4d4d";
    txt.innerText = `${percent.toFixed(0)}% of Travel Covered`;
}

// Visual Confirmation "Toast"
function showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'savvy-toast';
    toast.innerHTML = `✅ ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 1500);
}
