// Fetch dashboard data
async function fetchDashboardData() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        if (data.success) {
            // Update statistics
            document.querySelector('.box-info li:nth-child(1) h3').textContent = data.data.totalOrders;
            document.querySelector('.box-info li:nth-child(2) h3').textContent = data.data.totalUsers;
            document.querySelector('.box-info li:nth-child(3) h3').textContent = `$${data.data.totalOrders}`;

            // Update recent orders table
            const tbody = document.querySelector('.order table tbody');
            tbody.innerHTML = '';
            
            data.data.recentOrders.forEach(order => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <img src="${order.user.profileImage || '/img/default-avatar.png'}">
                        <p>${order.user.Name}</p>
                    </td>
                    <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                    <td><span class="status ${order.status.toLowerCase()}">${order.status}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    fetchDashboardData();
    // Refresh data every 5 minutes
    setInterval(fetchDashboardData, 300000);
});
