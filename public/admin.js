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
    const token = localStorage.getItem('gh_token');
    if (token) {
      showDashboard();
    } else {
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
  loginBtn.addEventListener('click', () => {
    const token = passwordInput.value.trim();
    if (token) {
      localStorage.setItem('gh_token', token);
      loginError.classList.add('hidden');
      showDashboard();
    } else {
      loginError.classList.remove('hidden');
    }
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('gh_token');
    showLogin();
  });

  function getGHHeaders() {
    const token = localStorage.getItem('gh_token');
    return {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

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
    const repo = 'NURULLLA/dilafruz-cafe';
    const filePath = 'data/menu.json';
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/contents/${filePath}`, {
        headers: getGHHeaders()
      });
      const data = await res.json();
      const content = atob(data.content);
      const json = JSON.parse(content);
      menuItems = json.items;
      renderTable();
    } catch (err) {
      console.error('Error loading menu:', err);
      // Fallback for non-auth fetch
      const res = await fetch('data/menu.json');
      const json = await res.json();
      menuItems = json.items;
      renderTable();
    }
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

  async function saveToGitHub(newMenuItems, message = 'Update menu') {
    const repo = 'NURULLLA/dilafruz-cafe';
    const filePath = 'data/menu.json';
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    
    // 1. Get current file SHA
    const resGet = await fetch(url, { headers: getGHHeaders() });
    const dataGet = await resGet.json();
    const sha = dataGet.sha;

    // 2. Update file
    const newContent = btoa(JSON.stringify({ items: newMenuItems }, null, 2));
    const resPut = await fetch(url, {
      method: 'PUT',
      headers: getGHHeaders(),
      body: JSON.stringify({
        message,
        content: newContent,
        sha
      })
    });
    
    if (resPut.ok) {
      return true;
    } else {
      const err = await resPut.json();
      throw new Error(err.message);
    }
  }

  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const formData = new FormData(itemForm);
    
    const newItemData = {
      categoryId: formData.get('categoryId'),
      price: formData.get('price'),
      name: {
        en: formData.get('name.en'),
        ru: formData.get('name.ru'),
        uz: formData.get('name.uz')
      },
      desc: {
        en: formData.get('desc.en'),
        ru: formData.get('desc.ru'),
        uz: formData.get('desc.uz')
      }
    };

    let updatedMenu = [...menuItems];
    if (id) {
      const index = updatedMenu.findIndex(item => item.id === id);
      updatedMenu[index] = { ...updatedMenu[index], ...newItemData };
    } else {
      updatedMenu.push({
        id: Date.now().toString(),
        image: 'images/placeholder-menu.jpg', // Default for now
        ...newItemData
      });
    }

    try {
      await saveToGitHub(updatedMenu, id ? `Update item ${id}` : 'Add new item');
      itemModal.classList.add('hidden');
      loadMenu(); 
    } catch (err) {
      alert('GitHub Error: ' + err.message);
    }
  });

  async function deleteItem(id) {
    if (confirm('Вы уверены, что хотите удалить это блюдо?')) {
      const updatedMenu = menuItems.filter(item => item.id !== id);
      try {
        await saveToGitHub(updatedMenu, `Delete item ${id}`);
        loadMenu();
      } catch (err) {
        alert('GitHub Error: ' + err.message);
      }
    }
  }

});
