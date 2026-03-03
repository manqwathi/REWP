function exportToCSV() {
    if (inventory.length === 0) return alert("Log is empty!");

    let csvContent = "data:text/csv;charset=utf-8,Time,Material,Weight,Rate,Total\r\n";
    inventory.forEach(i => {
        csvContent += `${i.time},${i.name},${i.weight},${i.rate},${(i.weight*i.rate).toFixed(2)}\r\n`;
    });

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `REWP_Log_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
