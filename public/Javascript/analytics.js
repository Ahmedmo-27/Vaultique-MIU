console.log('Dashboard loaded (static view only)');

// Initialize charts
let salesChart, userChart, productChart;

// Fetch analytics data
async function fetchAnalyticsData() {
  try {
    const [salesResponse, userResponse, productResponse] = await Promise.all([
      fetch('/api/admin/analytics/sales'),
      fetch('/api/admin/analytics/users'),
      fetch('/api/admin/analytics/products'),
    ]);

    const salesData = await salesResponse.json();
    const userData = await userResponse.json();
    const productData = await productResponse.json();

    if (salesData.success && userData.success && productData.success) {
      updateSalesChart(salesData.data);
      updateUserStats(userData.data);
      updateProductStats(productData.data);
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }
}

// Update sales chart
function updateSalesChart(data) {
  const trafficChart = document.getElementById('trafficChart').getContext('2d');

  if (salesChart) {
    salesChart.destroy();
  }

  salesChart = new Chart(trafficChart, {
    type: 'line',
    data: {
      labels: data.map((item) => item._id),
      datasets: [
        {
          label: 'Sales',
          data: data.map((item) => item.totalSales),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Update user statistics
function updateUserStats(data) {
  const totalUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
  const lastDayUsers = data[data.length - 1]?.newUsers || 0;
  const previousDayUsers = data[data.length - 2]?.newUsers || 0;
  const userGrowth = previousDayUsers
    ? ((lastDayUsers - previousDayUsers) / previousDayUsers) * 100
    : 0;

  document.querySelector('.stats-box:nth-child(3) h3').textContent = totalUsers.toLocaleString();
  document.querySelector('.stats-box:nth-child(3) p').textContent =
    `${userGrowth >= 0 ? '↑' : '↓'} ${Math.abs(userGrowth).toFixed(1)}%`;
}

// Update product statistics
function updateProductStats(data) {
  // Update most selling brands
  const brandStats = data.reduce((acc, item) => {
    const brand = item.productDetails.brand;
    if (!acc[brand]) {
      acc[brand] = { total: 0, revenue: 0 };
    }
    acc[brand].total += item.totalSold;
    acc[brand].revenue += item.totalRevenue;
    return acc;
  }, {});

  // Sort brands by revenue
  const sortedBrands = Object.entries(brandStats)
    .sort(([, a], [, b]) => b.revenue - a.revenue)
    .slice(0, 5);

  // Update brand bars
  const brandContainer = document.querySelector('.card:nth-child(7)');
  brandContainer.innerHTML = '<h3>Most Selling Brands</h3>';

  sortedBrands.forEach(([brand, stats]) => {
    const percentage = ((stats.revenue / sortedBrands[0][1].revenue) * 100).toFixed(0);
    brandContainer.innerHTML += `
            <p>${brand} | ${percentage}%</p>
            <div class="bar" style="width: ${percentage}%"></div>
        `;
  });
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
  fetchAnalyticsData();
  // Refresh data every 5 minutes
  setInterval(fetchAnalyticsData, 300000);
});
