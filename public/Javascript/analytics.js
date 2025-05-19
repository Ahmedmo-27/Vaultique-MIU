console.log("Dashboard loaded (static view only)");

const chartCanvas = document.getElementById('trafficChart');

if (chartCanvas) {
  const ctx = chartCanvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      datasets: [{
        label: 'Yearly Sales',
        data: [1200, 1900, 200, 2500, 2200, 2000, 2700, 200, 900, 2000, 1000, 400],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        tension: 0.3,
        pointBackgroundColor: '#fff',
        pointBorderColor: 'rgba(75, 192, 192, 1)',
        pointHoverRadius: 6,
        pointRadius: 4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              size: 14
            }
          }
        },
        title: {
          display: true,
          text: 'Monthly Sales Overview',
          font: {
            size: 16
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 500
          }
        }
      }
    }
  });
} else {
  console.error("Canvas element for trafficChart not found.");
}
