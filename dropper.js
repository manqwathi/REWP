let inventory = JSON.parse(localStorage.getItem('REWP_Inventory')) || [];

// Inside dropper.js -> addItem() function
function addItem() {
    const type = document.getElementById('matType');
    const weightInput = document.getElementById('weight');
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) return;

    const now = new Date();
    // Formats as "DD/MM HH:MM" e.g., "03/03 20:29"
    const timestamp = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    inventory.push({
        name: type.options[type.selectedIndex].text,
        rate: parseFloat(type.value),
        weight: weight,
        time: timestamp // This now includes the date
    });

    localStorage.setItem('REWP_Inventory', JSON.stringify(inventory));
    // ... rest of function ...
}
    
    // SAVVY CONFIRMATION
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

    document.getElementById('gross').innerText = `R${grossTotal.toFixed(2)}`;
    document.getElementById('travel').innerText = `- R${travelCost.toFixed(2)}`;
    document.getElementById('netProfit').innerText = `R${(grossTotal - travelCost).toFixed(2)}`;

    updateGoalTracker(grossTotal, travelCost);
}

function clearHistory() {
    if (confirm("Clear all logs?")) {
        inventory = [];
        localStorage.removeItem('REWP_Inventory');
        calculate();
        toggleWallet();
    }
}

// Enter Key Listener
document.getElementById('weight').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        addItem();
    }
});

function finishBoot() {
    if (window.navigator.vibrate) window.navigator.vibrate(100); 
    const splash = document.getElementById('splash-screen');
    splash.style.opacity = '0';
    
    // NOW run calculations once the UI is visible
    if (typeof calculate === "function") calculate(); 

    setTimeout(() => splash.remove(), 500);
}
function calculate() {
    let grossTotal = 0; // Ensure this is initialized at the top of the function
    const dist = parseFloat(document.getElementById('distance').value) || 0;
    const cons = parseFloat(document.getElementById('consuption').value) || 0;
    const fuel = parseFloat(document.getElementById('fuelPrice').value) || 0;
    const travelCost = (dist / 100) * cons * fuel;

    inventory.forEach(item => { grossTotal += item.weight * item.rate; });

    // Ensure these IDs exist in your HTML
    document.getElementById('gross').innerText = `R${grossTotal.toFixed(2)}`;
    document.getElementById('travel').innerText = `- R${travelCost.toFixed(2)}`;
    
    const net = grossTotal - travelCost;
    document.getElementById('netProfit').innerText = `R${net.toFixed(2)}`;

    // Pass BOTH values to the tracker
    updateGoalTracker(grossTotal, travelCost); 
}
