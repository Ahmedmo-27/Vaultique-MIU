let users = window.initialData?.users || [];

async function fetchUsers() {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    const data = await response.json();
    console.log('Fetched users:', data);

    if (data.success) {
      users = data.data;
      updateUsersTable(users);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
}

const tableBody = document.getElementById('userTableBody');
const searchInput = document.getElementById('search');
const modal = document.getElementById('addUserModal');

function renderUsers(data) {
  const tableBody = document.getElementById('userTableBody');
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  tableBody.innerHTML = '';

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
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

async function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user?')) {
    return;
  }

  try {
    console.log('Deleting user:', userId);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Delete response status:', response.status);
    const data = await response.json();
    console.log('Delete response data:', data);

    if (data.success) {
      // Remove the user from the local array first
      users = users.filter(user => user._id !== userId);
      // Update the table with the filtered users
      updateUsersTable(users);
      showNotification('success', 'User deleted successfully');
      // Then fetch fresh data from server
      await fetchUsers();
    } else {
      showNotification('error', data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    showNotification('error', 'Error deleting user: ' + error.message);
  }
}

// Initialize search functionality
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase();
    const filtered = users.filter(
      (u) => u.Name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    );
    updateUsersTable(filtered);
  });
}

document.getElementById('addUserBtn').onclick = () => {
  document.getElementById('nameInput').value = '';
  document.getElementById('emailInput').value = '';
  document.getElementById('roleInput').value = '';

  document.getElementById('addUserModal').classList.remove('hidden');
  document.getElementById('saveUserBtn').addEventListener('click', async () => {
    const formData = new FormData(document.getElementById('userForm'));
    const userData = {
      Name: formData.get('Name'),
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      phone_number: formData.get('phone_number'),
      DOB: formData.get('DOB'),
      language: formData.get('language'),
      role: formData.get('role'),
      Address: {
        city: formData.get('Address[city]'),
        street: formData.get('Address[street]'),
        addressType: formData.get('Address[addressType]'),
        state: formData.get('Address[state]'),
        country: formData.get('Address[country]'),
        postalCode: formData.get('Address[postalCode]'),
      },
    };

    await saveUser(userData);
  });
};

document.getElementById('closeModalBtn').onclick = () => {
  document.getElementById('addUserModal').classList.add('hidden');
};

async function saveUser(userData) {
  try {
    console.log('Saving user data:', userData);
    const response = await fetch('/api/admin/users/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    console.log('Save response status:', response.status);
    const data = await response.json();
    console.log('Save response data:', data);

    if (data.success) {
      // Add the new user to the local array
      users.push(data.data);
      // Update the table with the new user
      updateUsersTable(users);
      showNotification('success', 'User saved successfully!');
      document.getElementById('addUserModal').classList.add('hidden');
      // Then fetch fresh data from server
      await fetchUsers();
    } else {
      showNotification('error', data.message || 'Failed to save user');
    }
  } catch (error) {
    console.error('Error saving user:', error);
    showNotification('error', 'Error saving user: ' + error.message);
  }
}

renderUsers(users);

async function viewUserDetails(userId) {
  try {
    console.log('Fetching user details for:', userId);
    const response = await fetch(`/api/admin/users/${userId}`);
    const data = await response.json();
    console.log('User details response:', data);

    if (data.success) {
      const user = data.data;
      const modal = document.getElementById('userDetailsModal');
      const modalBody = modal.querySelector('.modal-body');

      modalBody.innerHTML = `
        <div class="user-details">
          <div class="detail-section">
            <h3>Basic Information</h3>
            <p><strong>Name:</strong> ${user.Name || '-'}</p>
            <p><strong>Username:</strong> ${user.username || '-'}</p>
            <p><strong>Email:</strong> ${user.email || '-'}</p>
            <p><strong>Phone:</strong> ${user.phone_number || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${user.DOB ? new Date(user.DOB).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Language:</strong> ${user.language || 'English'}</p>
            <p><strong>Role:</strong> ${user.role || '-'}</p>
            <p><strong>Created At:</strong> ${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
          ${
            user.Address
              ? `
            <div class="detail-section">
              <h3>Address Information</h3>
              <p><strong>City:</strong> ${user.Address.city || '-'}</p>
              <p><strong>Street:</strong> ${user.Address.street || '-'}</p>
              <p><strong>Address Type:</strong> ${user.Address.addressType || '-'}</p>
              <p><strong>State:</strong> ${user.Address.state || '-'}</p>
              <p><strong>Country:</strong> ${user.Address.country || '-'}</p>
              <p><strong>Postal Code:</strong> ${user.Address.postalCode || '-'}</p>
            </div>
          `
              : ''
          }
          ${
            user.Payment
              ? `
            <div class="detail-section">
              <h3>Payment Information</h3>
              <p><strong>Card Holder:</strong> ${user.Payment.cardHolder || '-'}</p>
              <p><strong>Payment Type:</strong> ${user.Payment.paymentType || '-'}</p>
              <p><strong>Expiry Date:</strong> ${user.Payment.expiryDate || '-'}</p>
              <p><strong>Card Number:</strong> **** **** **** ${user.Payment.cardNumber.slice(-4) || '-'}</p>
            </div>
          `
              : ''
          }
        </div>
      `;

      modal.classList.remove('hidden');
    } else {
      showNotification('error', data.message || 'Failed to load user details');
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    showNotification('error', 'Failed to load user details');
  }
}

async function viewUserOrders(userId) {
  try {
    console.log('Fetching orders for user:', userId);
    const response = await fetch(`/api/admin/users/${userId}/orders`);
    const data = await response.json();
    console.log('Orders response:', data);

    if (data.success) {
      const modal = document.getElementById('ordersModal');
      const modalBody = modal.querySelector('.modal-body');

      if (data.data && data.data.length > 0) {
        modalBody.innerHTML = `
          <ul class="orders-list">
            ${data.data
              .map(
                (order) => `
              <li>
                <div class="order-info">
                  <span class="order-id">Order #${order._id}</span>
                  <span class="order-date">${new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div class="order-details">
                  <span class="order-total">$${order.total.toFixed(2)}</span>
                  <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
                </div>
                ${
                  order.items && order.items.length > 0
                    ? `
                  <div class="order-items">
                    <h4>Items:</h4>
                    <ul>
                      ${order.items
                        .map(
                          (item) => `
                        <li>
                          ${item.product ? item.product.name : 'Unknown Product'} - 
                          Quantity: ${item.quantity}, 
                          Price: $${item.price.toFixed(2)}
                        </li>
                      `
                        )
                        .join('')}
                    </ul>
                  </div>
                `
                    : ''
                }
              </li>
            `
              )
              .join('')}
          </ul>
        `;
      } else {
        modalBody.innerHTML = '<p>No orders found for this user</p>';
      }

      modal.classList.remove('hidden');
    } else {
      showNotification('error', data.message || 'Failed to load user orders');
    }
  } catch (error) {
    console.error('Error fetching user orders:', error);
    showNotification('error', 'Failed to load user orders');
  }
}

async function editUser(userId) {
  try {
    console.log('Fetching user details for edit:', userId);
    const response = await fetch(`/api/admin/users/${userId}`);
    const result = await response.json();
    console.log('User details response:', result);

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch user details');
    }

    const user = result.data;
    if (!user) {
      throw new Error('No user data received');
    }

    // Get the modal and form elements
    const modal = document.getElementById('addUserModal');
    const form = document.getElementById('userForm');
    
    if (!modal || !form) {
      throw new Error('Modal or form elements not found');
    }

    // Set modal title
    const modalTitle = modal.querySelector('.modal-title');
    if (modalTitle) {
      modalTitle.textContent = 'Edit User';
    }

    // Populate form fields
    form.querySelector('[name="Name"]').value = user.Name || '';
    form.querySelector('[name="username"]').value = user.username || '';
    form.querySelector('[name="email"]').value = user.email || '';
    form.querySelector('[name="phone_number"]').value = user.phone_number || '';
    form.querySelector('[name="DOB"]').value = user.DOB ? new Date(user.DOB).toISOString().split('T')[0] : '';
    form.querySelector('[name="language"]').value = user.language || 'English';
    form.querySelector('[name="role"]').value = user.role || 'user';

    // Handle address fields
    if (user.Address) {
      form.querySelector('[name="Address[street]"]').value = user.Address.street || '';
      form.querySelector('[name="Address[city]"]').value = user.Address.city || '';
      form.querySelector('[name="Address[state]"]').value = user.Address.state || '';
      form.querySelector('[name="Address[postalCode]"]').value = user.Address.postalCode || '';
      form.querySelector('[name="Address[country]"]').value = user.Address.country || '';
    }

    // Show the modal
    modal.classList.remove('hidden');

    // Update save button to handle update instead of create
    const saveButton = document.getElementById('saveUserBtn');
    if (saveButton) {
      saveButton.onclick = async () => {
        const formData = new FormData(form);
        const userData = {
          Name: formData.get('Name'),
          username: formData.get('username'),
          email: formData.get('email'),
          phone_number: formData.get('phone_number'),
          DOB: formData.get('DOB'),
          language: formData.get('language'),
          role: formData.get('role'),
          Address: {
            city: formData.get('Address[city]'),
            street: formData.get('Address[street]'),
            state: formData.get('Address[state]'),
            country: formData.get('Address[country]'),
            postalCode: formData.get('Address[postalCode]'),
          },
        };

        // Only include password if it's not empty
        const password = formData.get('password');
        if (password) {
          userData.password = password;
        }

        // Remove any Payment-related fields
        delete userData.Payment;

        await updateUser(userId, userData);
      };
    }

  } catch (error) {
    console.error('Error in editUser:', error);
    showNotification('Error loading user details: ' + error.message, 'error');
  }
}

async function updateUser(userId, userData) {
  try {
    console.log('Updating user:', userId, userData);
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    console.log('Update response status:', response.status);
    const data = await response.json();
    console.log('Update response data:', data);

    if (data.success) {
      // Update the user in the local array
      const index = users.findIndex(user => user._id === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...data.data };
      }
      // Update the table with the modified user
      updateUsersTable(users);
      showNotification('success', 'User updated successfully!');
      document.getElementById('addUserModal').classList.add('hidden');
      // Then fetch fresh data from server
      await fetchUsers();
    } else {
      showNotification('error', data.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('Error updating user:', error);
    showNotification('error', 'Error updating user: ' + error.message);
  }
}

document.getElementById('closeDetailsBtn').onclick = () => {
  document.getElementById('userDetailsModal').classList.add('hidden');
};

document.getElementById('closeOrdersBtn').onclick = () => {
  document.getElementById('ordersModal').classList.add('hidden');
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
  const tableBody = document.getElementById('userTableBody');
  if (!tableBody) {
    console.error('Table body element not found');
    return;
  }

  tableBody.innerHTML = '';

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
    tableBody.insertAdjacentHTML('beforeend', row);
  });
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Get all required elements
    const searchInput = document.getElementById('search');
    const addUserBtn = document.getElementById('addUserBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const closeDetailsBtn = document.getElementById('closeDetailsBtn');
    const closeOrdersBtn = document.getElementById('closeOrdersBtn');
    const userForm = document.getElementById('userForm');

    // Initialize search functionality
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const keyword = searchInput.value.toLowerCase();
            const filtered = users.filter(
                (u) =>
                    (u.Name && u.Name.toLowerCase().includes(keyword)) ||
                    (u.email && u.email.toLowerCase().includes(keyword))
            );
            updateUsersTable(filtered);
        });
    }

    // Initialize add user button
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            if (userForm) userForm.reset();
            document.getElementById('addUserModal').classList.remove('hidden');
        });
    }

    // Initialize close modal button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('addUserModal').classList.add('hidden');
        });
    }

    // Initialize save user button
    if (saveUserBtn) {
        saveUserBtn.addEventListener('click', async () => {
            if (!userForm) return;
            
            const formData = new FormData(userForm);
            const userData = {
                Name: formData.get('Name'),
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                phone_number: formData.get('phone_number'),
                DOB: formData.get('DOB'),
                language: formData.get('language'),
                role: formData.get('role'),
                Address: {
                    city: formData.get('Address[city]'),
                    street: formData.get('Address[street]'),
                    state: formData.get('Address[state]'),
                    country: formData.get('Address[country]'),
                    postalCode: formData.get('Address[postalCode]')
                }
            };
            await saveUser(userData);
        });
    }

    // Initialize close details button
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', () => {
            document.getElementById('userDetailsModal').classList.add('hidden');
        });
    }

    // Initialize close orders button
    if (closeOrdersBtn) {
        closeOrdersBtn.addEventListener('click', () => {
            document.getElementById('ordersModal').classList.add('hidden');
        });
    }

    // Check if we have initial data
    if (window.initialData?.users?.length > 0) {
        users = window.initialData.users;
        updateUsersTable(users);
    } else if (!window.location.search.includes('view=') && !window.location.search.includes('edit=')) {
        fetchUsers();
    }
});
