let users = window.initialData?.users || [];

async function fetchUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Handle unauthorized access
      window.location.href = '/login';
      return;
    }

    const data = await response.json();

    if (data.success) {
      users = data.data;
      updateUsersTable(users);
    } else {
      showNotification('error', data.message || 'Failed to load users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
    showNotification('error', 'Failed to load users');
  }
}

const tableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("search");
const modal = document.getElementById("addUserModal");

function renderUsers(data) {
  const tableBody = document.getElementById("userTableBody");
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  tableBody.innerHTML = "";

  if (!data || !Array.isArray(data)) {
    console.error('Invalid data received:', data);
    return;
  }

  data.forEach((user, index) => {
    const row = `
      <tr>
        <td>${user.Name || '-'}</td>
        <td>${user.email || '-'}</td>
        <td>${user.role || '-'}</td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
        <td>
          <button onclick="viewUserDetails('${user._id}')" class="view-btn">View</button>
          <button onclick="viewUserOrders('${user._id}')" class="orders-btn">Orders</button>
          <button onclick="editUser('${user._id}')" class="edit-btn">Edit</button>
          <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (data.success) {
      showNotification('success', 'User deleted successfully');
      fetchUsers();
    } else {
      showNotification('error', data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification('error', 'Failed to delete user');
  }
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = users.filter(
    (u) =>
      u.Name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword)
  );
  renderUsers(filtered);
});

document.getElementById("addUserBtn").onclick = () => {
  document.getElementById('nameInput').value = '';
  document.getElementById('emailInput').value = '';
  document.getElementById('roleInput').value = '';

  document.getElementById('addUserModal').classList.remove('hidden');
  document.getElementById('saveUserBtn').onclick = () => saveUser();
};

document.getElementById("closeModalBtn").onclick = () => {
  document.getElementById('addUserModal').classList.add('hidden');
};

document.getElementById("saveUserBtn").onclick = async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;

  if (name && email) {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: name,
          email,
          role,
          dateAdded: new Date().toLocaleDateString(),
          lastLogin: "Never"
        })
      });

      if (response.ok) {
        document.getElementById('addUserModal').classList.add('hidden');
        await fetchUsers(); // Refresh the user list
      } else {
        alert('Error adding user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Error adding user. Please try again.');
    }
  } else {
    alert("Name and Email are required.");
  }
};

renderUsers(users);

async function viewUserDetails(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}`);
    const data = await response.json();

    if (data.success) {
      const user = data.data;
      document.getElementById('detailName').textContent = user.Name;
      document.getElementById('detailEmail').textContent = user.email;
      document.getElementById('detailPhone').textContent = user.phone_number || '-';
      document.getElementById('detailDOB').textContent = new Date(user.DOB).toLocaleDateString();
      document.getElementById('detailLanguage').textContent = user.language;
      document.getElementById('detailRole').textContent = user.role;
      document.getElementById('detailAccess').textContent = user.accessLevel || 'Standard';
      document.getElementById('detailDateAdded').textContent = new Date(user.createdAt).toLocaleDateString();
      document.getElementById('detailLastLogin').textContent = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never';
      document.getElementById('detailCreditCard').textContent = user.Payment ? `**** **** **** ${user.Payment.cardNumber.slice(-4)}` : '-';

      document.getElementById('userDetailsModal').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    showNotification('error', 'Failed to load user details');
  }
}

async function viewUserOrders(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}/orders`);
    const data = await response.json();

    if (data.success) {
      const ordersList = document.getElementById('ordersList');
      ordersList.innerHTML = '';

      data.data.forEach(order => {
        const li = document.createElement('li');
        li.innerHTML = `
          <div class="order-item">
            <span>Order #${order.orderId}</span>
            <span>${new Date(order.orderDate).toLocaleDateString()}</span>
            <span>$${order.total}</span>
            <span class="status ${order.status.toLowerCase()}">${order.status}</span>
          </div>
        `;
        ordersList.appendChild(li);
      });

      document.getElementById('ordersModal').classList.remove('hidden');
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    showNotification('error', 'Failed to load user orders');
  }
}

async function editUser(userId) {
  try {
    const response = await fetch(`/api/admin/users/${userId}`);
    const data = await response.json();

    if (data.success) {
      const user = data.data;
      document.getElementById('nameInput').value = user.Name;
      document.getElementById('emailInput').value = user.email;
      document.getElementById('roleInput').value = user.role;

      document.getElementById('addUserModal').classList.remove('hidden');
      document.getElementById('saveUserBtn').onclick = () => saveUser(userId);
    }
  } catch (error) {
    console.error('Error fetching user for edit:', error);
    showNotification('error', 'Failed to load user data');
  }
}

async function saveUser(userId) {
  const userData = {
    Name: document.getElementById('nameInput').value,
    email: document.getElementById('emailInput').value,
    role: document.getElementById('roleInput').value
  };

  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (data.success) {
      showNotification('success', 'User updated successfully');
      document.getElementById('addUserModal').classList.add('hidden');
      fetchUsers();
    } else {
      showNotification('error', data.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    showNotification('error', 'Failed to update user');
  }
}

document.getElementById("closeDetailsBtn").onclick = () => {
  document.getElementById("userDetailsModal").classList.add("hidden");
};

document.getElementById("closeOrdersBtn").onclick = () => {
  document.getElementById("ordersModal").classList.add("hidden");
};

function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function updateUsersTable(users) {
  const tableBody = document.getElementById("userTableBody");
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  tableBody.innerHTML = "";

  if (!users || !Array.isArray(users)) {
    console.error('Invalid data received:', users);
    return;
  }

  users.forEach((user) => {
    const row = `
      <tr>
        <td>${user.Name || '-'}</td>
        <td>${user.email || '-'}</td>
        <td>${user.role || '-'}</td>
        <td>${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
        <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
        <td>
          <button onclick="viewUserDetails('${user._id}')" class="view-btn">View</button>
          <button onclick="viewUserOrders('${user._id}')" class="orders-btn">Orders</button>
          <button onclick="editUser('${user._id}')" class="edit-btn">Edit</button>
          <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
  // Check if we have initial data
  if (window.initialData?.users?.length > 0) {
    users = window.initialData.users;
    updateUsersTable(users);
  } else if (!window.location.search.includes('view=') && !window.location.search.includes('edit=')) {
    fetchUsers();
  }
});

