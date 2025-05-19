let users = [];

async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/users');
    const data = await response.json();
    users = data;
    renderUsers(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    alert('Error loading users. Please try again.');
  }
}

const tableBody = document.getElementById("userTableBody");
const searchInput = document.getElementById("search");
const modal = document.getElementById("addUserModal");

function renderUsers(data) {
  const tableBody = document.getElementById("userTableBody");
  tableBody.innerHTML = "";

  data.forEach((user, index) => {
    const row = `
      <tr>
        <td>${user.username || user.name}</td>
        <td>${user.email}</td>
        <td>${user.role || 'User'}</td>
        <td>${user.division || '-'}</td>
        <td>${user.access || 'Standard'}</td>
        <td>${user.dateAdded || new Date().toLocaleDateString()}</td>
        <td>${user.lastLogin || 'Never'}</td>
        <td>
          <button class="details-btn" onclick="viewDetails(${index})">View Details</button>
          <button class="order-btn" onclick="viewOrders(${index})">View Orders</button>
          <button class="delete-btn" onclick="deleteUser(${index})">Delete</button>
        </td>
      </tr>
    `;
    tableBody.insertAdjacentHTML("beforeend", row);
  });
}

async function deleteUser(index) {
  const user = users[index];
  try {
    const response = await fetch(`http://localhost:3000/users/${user.email}`, {
      method: 'DELETE'
    });
    
    if (response.ok) {
      users.splice(index, 1);
      renderUsers(users);
    } else {
      alert('Error deleting user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user. Please try again.');
  }
}

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(keyword) ||
      u.email.toLowerCase().includes(keyword)
  );
  renderUsers(filtered);
});

document.getElementById("addUserBtn").onclick = () => {
  modal.classList.remove("hidden");
};

document.getElementById("closeModalBtn").onclick = () => {
  modal.classList.add("hidden");
};

document.getElementById("saveUserBtn").onclick = async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const role = document.getElementById("roleInput").value;
  const division = document.getElementById("divisionInput").value;
  const access = document.getElementById("accessInput").value;

  if (name && email) {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: name,
          email,
          role,
          division,
          access,
          dateAdded: new Date().toLocaleDateString(),
          lastLogin: "Never"
        })
      });

      if (response.ok) {
        modal.classList.add("hidden");
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
function viewOrders(index) {
  const user = users[index];
  const ordersList = document.getElementById("ordersList");
  ordersList.innerHTML = "";

  if (user.orders && user.orders.length > 0) {
    user.orders.forEach(order => {
      const item = document.createElement("li");
      item.textContent = `Order ID: ${order.id} — ${order.model} (${order.date})`;
      ordersList.appendChild(item);
    });
  } else {
    ordersList.innerHTML = "<li>No orders found.</li>";
  }

  document.getElementById("ordersModal").classList.remove("hidden");
}

document.getElementById("closeOrdersBtn").onclick = () => {
  document.getElementById("ordersModal").classList.add("hidden");
};

// Function to mask credit card number
function maskCreditCard(cardNumber) {
  if (!cardNumber) return 'Not provided';
  // Keep only last 4 digits, mask the rest
  return '**** **** **** ' + cardNumber.slice(-4);
}

// Function to view user details
function viewDetails(index) {
  const user = users[index];
  const modal = document.getElementById("userDetailsModal");
  
  // Populate the details
  document.getElementById("detailName").textContent = user.username || user.name || 'N/A';
  document.getElementById("detailEmail").textContent = user.email || 'N/A';
  document.getElementById("detailPhone").textContent = user.phone || 'N/A';
  document.getElementById("detailDOB").textContent = user.dob || 'N/A';
  document.getElementById("detailLanguage").textContent = user.language || 'N/A';
  document.getElementById("detailRole").textContent = user.role || 'User';
  document.getElementById("detailAccess").textContent = user.access || 'Standard';
  document.getElementById("detailDateAdded").textContent = user.dateAdded || 'N/A';
  document.getElementById("detailLastLogin").textContent = user.lastLogin || 'Never';
  document.getElementById("detailCreditCard").textContent = maskCreditCard(user.creditCard);

  // Show the modal
  modal.classList.remove("hidden");
}

// Add event listener for closing the details modal
document.getElementById("closeDetailsBtn").onclick = () => {
  document.getElementById("userDetailsModal").classList.add("hidden");
};

// Initialize the page by fetching users
fetchUsers();

