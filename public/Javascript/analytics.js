console.log('Dashboard loaded (static view only)');

// Initialize charts
let salesChart, userChart, productChart;

// Fetch analytics data
async function fetchAnalyticsData() {
  try {
    console.log('Fetching analytics data...');
    const [salesResponse, userResponse, productResponse] = await Promise.all([
      fetch('/api/admin/analytics/sales'),
      fetch('/api/admin/analytics/users'),
      fetch('/api/admin/analytics/products'),
    ]);

    if (!salesResponse.ok || !userResponse.ok || !productResponse.ok) {
      throw new Error('One or more API requests failed');
    }

    const salesData = await salesResponse.json();
    const userData = await userResponse.json();
    const productData = await productResponse.json();

    if (salesData.success && userData.success && productData.success) {
      updateSalesChart(salesData.data);
      updateUserStats(userData.data);
      updateProductStats(productData.data);
    } else {
      throw new Error('Failed to fetch analytics data');
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    // Show error message to user
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.textContent = 'Failed to load analytics data. Please try again later.';
      errorContainer.style.display = 'block';
    }
  }
}

// Update sales chart
function updateSalesChart(data) {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  if (salesChart) {
    salesChart.destroy();
  }

  const labels = data.map(item => `${item._id.year}-${item._id.month}`);
  const salesData = data.map(item => item.totalSales);
  const orderData = data.map(item => item.orderCount);

  salesChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Sales',
          data: salesData,
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.3,
          fill: false
        },
        {
          label: 'Orders',
          data: orderData,
          borderColor: 'rgba(255, 99, 132, 1)',
          tension: 0.3,
          fill: false
        }
      ]
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
}

// Update user stats
function updateUserStats(data) {
  const userStatsContainer = document.getElementById('user-stats');
  if (!userStatsContainer) return;

  const totalUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
  const userGrowth = data.length >= 2 ? 
    ((data[data.length - 1].newUsers - data[data.length - 2].newUsers) / data[data.length - 2].newUsers) * 100 : 0;

  userStatsContainer.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Total Users</h5>
        <p class="card-text">${totalUsers}</p>
        <p class="card-text ${userGrowth >= 0 ? 'text-success' : 'text-danger'}">
          ${userGrowth >= 0 ? '↑' : '↓'} ${Math.abs(userGrowth).toFixed(1)}%
        </p>
      </div>
    </div>
  `;
}

// Update product stats
function updateProductStats(data) {
  const productStatsContainer = document.getElementById('product-stats');
  if (!productStatsContainer) return;

  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalSold = data.reduce((sum, item) => sum + item.totalSold, 0);

  productStatsContainer.innerHTML = `
    <div class="card">
      <div class="card-body">
        <h5 class="card-title">Product Performance</h5>
        <p class="card-text">Total Revenue: $${totalRevenue.toFixed(2)}</p>
        <p class="card-text">Total Units Sold: ${totalSold}</p>
      </div>
    </div>
  `;
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard loaded');
  fetchAnalyticsData();
  // Refresh data every 5 minutes
  setInterval(fetchAnalyticsData, 300000);
});
