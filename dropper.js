let inventory = JSON.parse(localStorage.getItem('REWP_Inventory')) || [];

// Inside dropper.js -> addItem() function
function addItem() {
    const type = document.getElementById('matType');
    const weightInput = document.getElementById('weight');
    const weight = parseFloat(weightInput.value);

    if (!weight || weight <= 0) return;

    const now = new Date();
    const timestamp = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    inventory.push({
        name: type.options[type.selectedIndex].text,
        rate: parseFloat(type.value),
        weight: weight,
        time: timestamp
    });

    localStorage.setItem('REWP_Inventory', JSON.stringify(inventory));
    
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

window.onload = calculate;
