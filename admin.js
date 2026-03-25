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
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const token = localStorage.getItem('gh_token');
    
    if (isLocal) {
      console.log('[Admin] Running on localhost. Local edits enabled.');
      showDashboard();
      if (!token) {
        showStatus('Local Mode (GitHub Sync Disabled - Login with token to enable)', 'warning');
      } else {
        showStatus('Local Mode (GitHub Sync Enabled)', 'success');
      }
      return;
    }

    if (token) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  function showStatus(msg, type = 'info') {
    const statusEl = document.getElementById('syncStatus') || createStatusEl();
    statusEl.textContent = msg;
    statusEl.className = `status-bar ${type}`;
  }

  function createStatusEl() {
    const el = document.createElement('div');
    el.id = 'syncStatus';
    el.className = 'status-bar';
    dashboardSection.prepend(el);
    return el;
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
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      location.reload(); // Refresh to update status
    } else {
      showLogin();
    }
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
    dishes2: "2 блюда",
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
      // Properly decode Base64 to UTF-8
      const content = decodeURIComponent(escape(atob(data.content)));
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
        <td><img src="${item.image}" alt="Img" onerror="this.src='images/placeholder-menu.jpg'"></td>
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
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: newMenuItems })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Local menu save failed');
      }
      return true;
    }

    const repo = 'NURULLLA/dilafruz-cafe';
    const filePath = 'data/menu.json';
    const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    
    // 1. Get current file SHA
    const resGet = await fetch(url, { headers: getGHHeaders() });
    const dataGet = await resGet.json();
    const sha = dataGet.sha;

    // 2. Update file
    // Properly encode UTF-8 to Base64
    const newContent = btoa(unescape(encodeURIComponent(JSON.stringify({ items: newMenuItems }, null, 2))));
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

  async function uploadImageToGitHub(path, base64Content) {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, image: base64Content })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Local image upload failed');
      }
      return true;
    }

    const repo = 'NURULLLA/dilafruz-cafe';
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;
    
    let sha = null;
    try {
      const resGet = await fetch(url, { headers: getGHHeaders() });
      if (resGet.ok) {
        const dataGet = await resGet.json();
        sha = dataGet.sha;
      }
    } catch(e) {}

    const body = {
      message: `Upload image ${path}`,
      content: base64Content
    };
    if (sha) body.sha = sha;

    const resPut = await fetch(url, {
      method: 'PUT',
      headers: getGHHeaders(),
      body: JSON.stringify(body)
    });
    
    if (!resPut.ok) {
      const err = await resPut.json();
      throw new Error(err.message);
    }
    return true;
  }

  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('itemId').value;
    const formData = new FormData(itemForm);
    
    const saveBtn = document.getElementById('saveItemBtn');
    const originalBtnText = saveBtn.textContent;
    saveBtn.textContent = 'Сохранение...';
    saveBtn.disabled = true;

    try {
      const imageInput = document.getElementById('itemImage');
      let uploadedImagePath = null;
      
      if (imageInput.files && imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result;
            if (result.includes(',')) {
              resolve(result.split(',')[1]);
            } else {
              reject(new Error('Invalid image data'));
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const imageFileName = `images/${Date.now()}_${safeName}`;
        
        await uploadImageToGitHub(imageFileName, base64Data);
        uploadedImagePath = imageFileName;
      }

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
        const existingImagePath = updatedMenu[index].image;
        updatedMenu[index] = { 
          ...updatedMenu[index], 
          ...newItemData
        };
        if (uploadedImagePath) {
          updatedMenu[index].image = uploadedImagePath;
        }
      } else {
        updatedMenu.push({
          id: Date.now().toString(),
          image: uploadedImagePath || 'images/placeholder-menu.jpg',
          ...newItemData
        });
      }

      await saveToGitHub(updatedMenu, id ? `Update item ${id}` : 'Add new item');
      itemModal.classList.add('hidden');
      loadMenu();
    } catch (err) {
      alert('Ошибка: ' + err.message);
    } finally {
      saveBtn.textContent = originalBtnText;
      saveBtn.disabled = false;
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
