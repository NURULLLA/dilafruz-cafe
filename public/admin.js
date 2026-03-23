document.addEventListener('DOMContentLoaded', () => {
  const loginSection = document.getElementById('loginSection');
  const dashboardSection = document.getElementById('dashboardSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginError = document.getElementById('loginError');

  const menuTableBody = document.querySelector('#menuTable tbody');
  const addNewBtn = document.getElementById('addNewBtn');
  
  const itemModal = document.getElementById('itemModal');
  const closeModal = document.getElementById('closeModal');
  const itemForm = document.getElementById('itemForm');
  const modalTitle = document.getElementById('modalTitle');

  // Verify Auth on Load
  checkAuth();

  async function checkAuth() {
    try {
      const res = await fetch('/api/check-auth');
      const data = await res.json();
      if (data.success) {
        showDashboard();
      } else {
        showLogin();
      }
    } catch (err) {
      showLogin();
    }
  }

  function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
  }

  function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadMenu();
    generateQRCode();
  }

  // --- LOGIN LOGIC ---
  loginBtn.addEventListener('click', async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: usernameInput.value,
        password: passwordInput.value
      })
    });
    const data = await res.json();
    if (data.success) {
      loginError.classList.add('hidden');
      showDashboard();
    } else {
      loginError.classList.remove('hidden');
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' });
    showLogin();
  });

  // --- DASHBOARD LOGIC ---
  let menuItems = [];

  const categoryNames = {
    dishes: "1 блюда",
    kebabs: "Шашлыки",
    drinks: "Напитки",
    sides: "Гарниры",
    desserts: "Десерты",
    salads: "Салаты",
    appetizers: "Холодные Закуски",
    hookah: "Кальяны"
  };

  function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    qrContainer.innerHTML = '';
    // Use current origin for the menu link
    const url = window.location.origin;
    new QRCode(qrContainer, {
      text: url,
      width: 128,
      height: 128,
      colorDark : "#c9a84c",
      colorLight : "#0a0a0a",
      correctLevel : QRCode.CorrectLevel.H
    });
  }

  document.getElementById('downloadQrBtn').addEventListener('click', () => {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'dilafruz-menu-qr.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  });

  async function loadMenu() {
    const res = await fetch('/api/menu');
    menuItems = await res.json();
    renderTable();
  }

  function renderTable() {
    menuTableBody.innerHTML = '';
    menuItems.forEach(item => {
      const tr = document.createElement('tr');
      const nameStr = `${item.name.en} / ${item.name.ru} / ${item.name.uz}`;
      tr.innerHTML = `
        <td><img src="/${item.image}" alt="Img" onerror="this.src=''"></td>
        <td>${nameStr}</td>
        <td>${categoryNames[item.categoryId] || item.categoryId}</td>
        <td>${item.price}</td>
        <td class="actions">
          <button class="btn-edit" data-id="${item.id}">Edit</button>
          <button class="btn-delete" data-id="${item.id}">Delete</button>
        </td>
      `;
      menuTableBody.appendChild(tr);
    });

    // Attach events
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => openModal(e.target.dataset.id));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => deleteItem(e.target.dataset.id));
    });
  }

  // --- MODAL LOGIC ---
  addNewBtn.addEventListener('click', () => openModal());
  closeModal.addEventListener('click', () => {
    itemModal.classList.add('hidden');
    itemForm.reset();
  });

  function openModal(id = null) {
    itemForm.reset();
    document.getElementById('itemId').value = id || '';
    
    if (id) {
      modalTitle.textContent = 'Редактировать блюдо';
      const item = menuItems.find(i => i.id === id);
      if (item) {
        document.getElementById('itemCategory').value = item.categoryId;
        document.getElementById('itemPrice').value = item.price;
        
        document.getElementById('nameEn').value = item.name.en;
        document.getElementById('nameRu').value = item.name.ru;
        document.getElementById('nameUz').value = item.name.uz;
        
        document.getElementById('descEn').value = item.desc.en;
        document.getElementById('descRu').value = item.desc.ru;
        document.getElementById('descUz').value = item.desc.uz;
      }
    } else {
      modalTitle.textContent = 'Добавить новое блюдо';
    }
    
    itemModal.classList.remove('hidden');
  }

  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const formData = new FormData(itemForm);
    
    // Determine method and URL based on id existence
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/menu/${id}` : '/api/menu';

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        itemModal.classList.add('hidden');
        loadMenu(); // Reload table
      } else {
        alert('Ошибка при сохранении: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка при сохранении блюда.');
    }
  });

  async function deleteItem(id) {
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          loadMenu();
        }
      } catch (err) {
        console.error(err);
        alert('Ошибка при удалении блюда.');
      }
    }
  }

});
