
console.log("Dashboard loaded (static view only)");

const ctx = document.getElementById('trafficChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July','August','September','October','November','December'],
    datasets: [{
      label: 'Yearly Sales',
      data: [1200, 1900, 3000, 2500, 2200, 2000, 2700,200,900,2000,1000,400],
      borderColor: 'rgba(75, 192, 192, 1)',
      tension: 0.3,
      fill: false,
      backgroundColor: 'rgba(75, 192, 192, 0.1)'
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  }
});
