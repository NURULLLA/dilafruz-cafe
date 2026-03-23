/* ===== DILAFRUZ RESTOBAR — Interactive JavaScript ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ─── Loading Screen ────────────────────────────────────────
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 800);
  });
  // Fallback: hide loader after 3s regardless
  setTimeout(() => loader.classList.add('hidden'), 3000);

  // ─── Navbar Scroll Effect ──────────────────────────────────
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  const handleNavScroll = () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });

  // ─── Mobile Menu Toggle ────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
  });

  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ─── Hero Particles ───────────────────────────────────────
  const particleContainer = document.getElementById('heroParticles');
  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (5 + Math.random() * 6) + 's';
    particle.style.width = (1 + Math.random() * 2) + 'px';
    particle.style.height = particle.style.width;
    particleContainer.appendChild(particle);
  }

  // ─── Scroll Indicator ─────────────────────────────────────
  const scrollIndicator = document.getElementById('scrollIndicator');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      document.getElementById('about').scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ─── Intersection Observer — Reveal on Scroll ─────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Don't unobserve so it can re-trigger if needed
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => {
    revealObserver.observe(el);
  });

  // ─── Menu Fetching & Filtering ─────────────────────────────
  const menuTabs = document.querySelectorAll('.menu-tab');
  const menuGrid = document.getElementById('menuGrid');
  let allMenuItems = [];

  const renderMenu = (items, category = 'all') => {
    if (!menuGrid) return;
    menuGrid.innerHTML = '';
    const currentLang = localStorage.getItem('preferredLang') || 'en';
    
    const filtered = category === 'all' ? items : items.filter(i => i.categoryId === category);
    
    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.dataset.category = item.categoryId;

      let name = item.name[currentLang] || item.name.en;
      let desc = item.desc[currentLang] || item.desc.en;

      card.innerHTML = `
        <img src="${item.image}" alt="${name}" class="menu-card-img">
        <div class="menu-card-info">
          <div class="menu-card-top">
            <span class="menu-card-name">${name}</span>
            <span class="menu-card-price">${item.price}</span>
          </div>
          <p class="menu-card-desc">${desc}</p>
        </div>
      `;
      card.style.opacity = '0';
      card.style.transform = 'translateY(15px)';
      menuGrid.appendChild(card);
      
      setTimeout(() => {
        card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 40);
      
      // Error handling for newly added images
      const img = card.querySelector('img');
      img.onerror = function() {
        const canvas = document.createElement('canvas');
        canvas.width = 600; canvas.height = 400;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 600, 400);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#0f3460');
        ctx.fillStyle = gradient; ctx.fillRect(0, 0, 600, 400);
        this.src = canvas.toDataURL();
      };
    });
  };

  fetch('/api/menu')
    .then(res => res.json())
    .then(data => {
      allMenuItems = data;
      renderMenu(allMenuItems, 'all');
    })
    .catch(err => console.error('Error fetching menu:', err));

  menuTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      menuTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const category = tab.dataset.category;
      renderMenu(allMenuItems, category);
    });
  });

  // ─── Smooth scroll for all anchor links ────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetTop = target.getBoundingClientRect().top + window.scrollY - navHeight;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
      }
    });
  });

  // ─── Parallax effect on hero (subtle) ─────────────────────
  const heroContent = document.querySelector('.hero-content');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      heroContent.style.transform = `translateY(${scrolled * 0.25}px)`;
      heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.8));
    }
  }, { passive: true });

  // ─── Counter Animation for Stats ──────────────────────────
  const animateCounters = () => {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
      const text = counter.textContent;
      // Only animate numbers
      const match = text.match(/([\d.]+)/);
      if (!match) return;

      const target = parseFloat(match[1]);
      const suffix = text.replace(match[1], '').trim();
      const prefix = text.substring(0, text.indexOf(match[1]));
      const duration = 1500;
      const step = target / (duration / 16);
      let current = 0;
      counter.dataset.animated = 'true';

      const updateCounter = () => {
        current += step;
        if (current < target) {
          if (target >= 100) {
            counter.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
          } else {
            counter.textContent = prefix + current.toFixed(1) + suffix;
          }
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = text; // Reset to original text
        }
      };
      updateCounter();
    });
  };

  // Observe stats section for counter animation
  const statsSection = document.querySelector('.about-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Small delay for dramatic effect
          setTimeout(animateCounters, 300);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    statsObserver.observe(statsSection);
  }

  // ─── Active nav link highlighting ─────────────────────────
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    const scrollPos = window.scrollY + 100;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollPos >= top && scrollPos < top + height) {
        navLinksAll.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--clr-gold)';
          }
        });
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ─── Multilingual Support ──────────────────────────────────
  const translations = {
    en: {
      nav_story: "Our Story",
      nav_menu: "Menu",
      nav_gallery: "Gallery",
      nav_reserve: "Reserve",
      hero_title: "Dilafruz",
      hero_tagline: "Resto · Bar · Experience",
      hero_reserve: "Reserve a Table",
      hero_menu: "Explore Menu",
      about_label: "Our Story",
      about_title: "Where Elegance Meets Flavor",
      about_p1: "Born from a passion for exceptional hospitality, Dilafruz RestoBar is more than just a restaurant — it's a destination. Named after the timeless beauty that inspires wonder, we bring together the richest traditions of Uzbek and international cuisine with a modern, vibrant bar culture.",
      about_p2: "Every dish is carefully crafted by our talented chefs using the freshest local ingredients, while our bartenders create signature cocktails that tell their own stories. Step inside and discover an atmosphere where every detail — from the warm lighting to the curated music — is designed to make your evening unforgettable.",
      stat_followers: "Followers",
      stat_items: "Menu Items",
      stat_rating: "Rating",
      menu_label: "The Menu",
      menu_title: "Signature Creations",
      menu_subtitle: "A curated selection of our chef's finest dishes, blending traditional flavors with contemporary artistry",
      cat_all: "All",
      cat_dishes: "Soups & First Courses",
      cat_kebabs: "Kebabs",
      cat_drinks: "Drinks",
      cat_sides: "Side Dishes",
      cat_desserts: "Desserts",
      cat_salads: "Salads",
      cat_appetizers: "Cold Appetizers",
      cat_hookah: "Hookah",
      gallery_label: "The Atmosphere",
      gallery_title: "Feel the Ambiance",
      gallery_subtitle: "Step into a world where warm lighting, elegant décor, and curated music create the perfect evening",
      reserve_label: "Make a Reservation",
      reserve_title: "Your Table Awaits",
      reserve_subtitle: "Join us for an unforgettable dining experience. Reserve your table today or visit us to feel the atmosphere firsthand.",
      contact_location: "Location",
      contact_location_val: "Navoi, Amir Temur St.",
      contact_hours: "Hours",
      contact_hours_val: "Daily 09:00 – 02:00",
      contact_call: "Call Us",
      contact_email: "Email",
      contact_ig: "Follow Us on Instagram",
      dish_tukhum_barak_name: "Tukhum Barak",
      dish_tukhum_barak_desc: "A legendary Khorezmian masterpiece. These unique square-shaped dumplings feature a delicate, liquid egg filling seasoned with traditional spices and melted butter. Served warm with fresh smetana.",
      dish_tukhum_barak_price: "75,000 sum",
      dish_tukhum_barak_stats: "400g / 900 kcal",
      dish_avocado_shrimp_name: "Avocado & Shrimp",
      dish_avocado_shrimp_desc: "Fresh avocado paired with succulent grilled shrimp and a light citrus dressing.",
      dish_avocado_shrimp_price: "55,000 sum",
      dish_steak_salad_name: "Warm Steak Salad",
      dish_steak_salad_desc: "Tender beef strips, mixed greens, cherry tomatoes, and balsamic reduction.",
      dish_steak_salad_price: "60,000 sum",
      dish_kebab_khorezm_name: "Kebab Khorezm-style",
      dish_kebab_khorezm_desc: "Authentic grilled meat skewers prepared with traditional Khorezm spices.",
      dish_kebab_khorezm_price: "95,000 sum",
      dish_khiva_izhzhoh_name: "Khiva Izhzhon",
      dish_khiva_izhzhoh_desc: "A legendary traditional meat dish from the heart of Khiva.",
      dish_khiva_izhzhoh_price: "85,000 sum",
      dish_gosht_say_name: "Go'sht Say",
      dish_gosht_say_desc: "Assorted premium platter of grilled meats and traditional sides.",
      dish_gosht_say_price: "110,000 sum",
      dish_chicken_name: "Herb-Crusted Chicken",
      dish_chicken_desc: "Free-range chicken, herb marinade, grilled to perfection with seasonal vegetables.",
      dish_chicken_price: "85,000 sum",
      dish_cocktail_sunset_name: "Dilafruz Sunset",
      dish_cocktail_sunset_desc: "Vodka, passion fruit, lime, elderflower syrup & a touch of gold shimmer.",
      dish_cocktail_sunset_price: "55,000 sum",
      dish_cocktail_martini_name: "Silk Road Martini",
      dish_cocktail_martini_desc: "Espresso, vanilla vodka, Kahlúa, cardamom-infused simple syrup.",
      dish_cocktail_martini_price: "60,000 sum",
      dish_tiramisu_name: "Classic Tiramisu",
      dish_tiramisu_desc: "Mascarpone cream, espresso-soaked ladyfingers, dark cocoa dusting.",
      dish_tiramisu_price: "50,000 sum",
      tag_khorezm: "Khorezmian",
      tag_signature: "Signature",
      tag_traditional: "Traditional",
      tag_popular: "Popular",
      tag_chef_choice: "Chef's Choice",
      tag_bestseller: "Bestseller",
      tag_sweet: "Sweet Finish"
    },
    ru: {
      nav_story: "Наша История",
      nav_menu: "Меню",
      nav_gallery: "Галерея",
      nav_reserve: "Заказать",
      hero_title: "Дилафруз",
      hero_tagline: "Ресто · Бар · Впечатления",
      hero_reserve: "Забронировать",
      hero_menu: "Посмотреть Меню",
      about_label: "Наша История",
      about_title: "Где Элегантность Встречается с Вкусом",
      about_p1: "Рожденный из страсти к истинному гостеприимству, Dilafruz RestoBar — это больше, чем просто ресторан, это место назначения. Названный в честь вечной красоты, мы объединяем богатейшие традиции узбекской и международной кухни с современной барной культурой.",
      about_p2: "Каждое блюдо бережно создается нашими шеф-поварами из свежайших местных продуктов, в то время как бармены готовят авторские коктейли. Окунитесь в атмосферу, где каждая деталь продумана для вашего незабываемого вечера.",
      stat_followers: "Подписчиков",
      stat_items: "Блюд",
      stat_rating: "Рейтинг",
      menu_label: "Меню",
      menu_title: "Авторские Творения",
      menu_subtitle: "Тщательно отобранные блюда, сочетающие традиционные вкусы и современное искусство",
      cat_all: "Все",
      cat_dishes: "1 блюда",
      cat_kebabs: "Шашлыки",
      cat_drinks: "Напитки",
      cat_sides: "Гарниры",
      cat_desserts: "Десерты",
      cat_salads: "Салаты",
      cat_appetizers: "Холодные Закуски",
      cat_hookah: "Кальяны",
      gallery_label: "Атмосфера",
      gallery_title: "Почувствуйте Уют",
      gallery_subtitle: "Мир теплого света, элегантного декора и прекрасной музыки для идеального вечера",
      reserve_label: "Бронирование",
      reserve_title: "Ваш Стол Ждет",
      reserve_subtitle: "Присоединяйтесь к нам для незабываемого ужина. Забронируйте стол сегодня или посетите нас в любое время.",
      contact_location: "Локация",
      contact_location_val: "Навои, ул. Амира Темура",
      contact_hours: "Часы работы",
      contact_hours_val: "Ежедневно 09:00 – 02:00",
      contact_call: "Позвонить",
      contact_email: "Email",
      contact_ig: "Мы в Instagram",
      dish_tukhum_barak_name: "Тухум Барак",
      dish_tukhum_barak_desc: "Легендарное хорезмское блюдо. Уникальные квадратные вареники с необычной жидкой яичной начинкой, приправленной традиционными специями и топленым маслом. Подаются горячими со свежей сметаной.",
      dish_tukhum_barak_price: "75 000 сум",
      dish_tukhum_barak_stats: "400г / 900 ккал",
      dish_avocado_shrimp_name: "Авокадо с креветками",
      dish_avocado_shrimp_desc: "Свежее авокадо в сочетании с сочными креветками гриль и легкой цитрусовой заправкой.",
      dish_avocado_shrimp_price: "55 000 сум",
      dish_steak_salad_name: "Теплый салат со стейком",
      dish_steak_salad_desc: "Нежные полоски говядины, микс зелени, томаты черри и бальзамический соус.",
      dish_steak_salad_price: "60 000 сум",
      dish_kebab_khorezm_name: "Кебаб по-хорезмски",
      dish_kebab_khorezm_desc: "Аутентичные мясные шашлычки, приготовленные по традиционным хорезмским рецептам.",
      dish_kebab_khorezm_price: "95 000 сум",
      dish_khiva_izhzhoh_name: "Хива Ижжон",
      dish_khiva_izhzhoh_desc: "Легендарное традиционное мясное блюдо из самого сердца Хивы.",
      dish_khiva_izhzhoh_price: "85 000 сум",
      dish_gosht_say_name: "Гошт Сай",
      dish_gosht_say_desc: "Ассорти из жареного мяса премиум-класса с традиционными гарнирами.",
      dish_gosht_say_price: "110 000 сум",
      dish_chicken_name: "Цыпленок в травах",
      dish_chicken_desc: "Фермерский цыпленок в маринаде из трав, запеченный до совершенства.",
      dish_chicken_price: "85 000 сум",
      dish_cocktail_sunset_name: "Закат Дилафруз",
      dish_cocktail_sunset_desc: "Водка, маракуйя, лайм, сироп бузины и капля золотого мерцания.",
      dish_cocktail_sunset_price: "55 000 сум",
      dish_cocktail_martini_name: "Мартини Шелковый Путь",
      dish_cocktail_martini_desc: "Эспрессо, ванильная водка, Калуа, простой сироп на основе кардамона.",
      dish_cocktail_martini_price: "60 000 сум",
      dish_tiramisu_name: "Классический Тирамису",
      dish_tiramisu_desc: "Крем маскарпоне, печенье савоярди в кофе, посыпка из темного какао.",
      dish_tiramisu_price: "50 000 сум",
      tag_khorezm: "Хорезм",
      tag_signature: "Авторское",
      tag_traditional: "Традиции",
      tag_popular: "Популярное",
      tag_chef_choice: "Выбор шефа",
      tag_bestseller: "Бестселлер",
      tag_sweet: "Сладкий финал"
    },
    uz: {
      nav_story: "Biz haqimizda",
      nav_menu: "Taomnoma",
      nav_gallery: "Galereya",
      nav_reserve: "Band qilish",
      hero_title: "Dilafruz",
      hero_tagline: "Resto · Bar · Tajriba",
      hero_reserve: "Joy band qilish",
      hero_menu: "Menyuni ko'rish",
      about_label: "Biz haqimizda",
      about_title: "Nafosat va Mazaning Uyg'unligi",
      about_p1: "Mehmondo'stlikka bo'lgan ehtirosdan tug'ilgan Dilafruz RestoBar shunchaki restoran emas — bu o'zgacha manzildir. Go'zallik va nafosat ramzi bo'lgan maskanimizda o'zbek va xalqaro oshxonaning eng sara an'analari zamonaviy bar madaniyati bilan birlashgan.",
      about_p2: "Har bir taom oshpazlarimiz tomonidan eng yangi masalliqlardan tayyorlanadi, barmenlarimiz esa o'ziga xos mualliflik kokteyllarini taqdim etadi. Iliq yorug'lik va sara musiqa bilan ta'minlangan betakror muhitimizga xush kelibsiz.",
      stat_followers: "Obunachilar",
      stat_items: "Taomlar",
      stat_rating: "Reyting",
      menu_label: "Taomnoma",
      menu_title: "Mualliflik Taomlari",
      menu_subtitle: "An'anaviy lazzatlar va zamonaviy san'at uyg'unlashgan sara taomlar to'plami",
      cat_all: "Barchasi",
      cat_dishes: "Birinchi Taomlar",
      cat_kebabs: "Shashliklar",
      cat_drinks: "Ichimliklar",
      cat_sides: "Garnirlar",
      cat_desserts: "Desertlar",
      cat_salads: "Salatlar",
      cat_appetizers: "Sovuq Gazaklar",
      cat_hookah: "Chilyim",
      gallery_label: "Muhit",
      gallery_title: "Atmosferani his qiling",
      gallery_subtitle: "Iliq yorug'lik, nafis dekor va sara musiqa mukammal oqshomni yaratadi",
      reserve_label: "Joy band qilish",
      reserve_title: "Siz uchun joy tayyor",
      reserve_subtitle: "Unutilmas kecha uchun bizga tashrif buyuring. Bugun joy band qiling va atmosferadan bahramand bo'ling.",
      contact_location: "Manzil",
      contact_location_val: "Navoiy, Amir Temur ko'chasi",
      contact_hours: "Ish vaqti",
      contact_hours_val: "Har kuni 09:00 – 02:00",
      contact_call: "Bog'lanish",
      contact_email: "Email",
      contact_ig: "Instagramda kuzating",
      dish_tukhum_barak_name: "Tuxum Barak",
      dish_tukhum_barak_desc: "Xorazm oshxonasining durdonasi. Eritilgan sariyog' va ziravorlar bilan boyitilgan o'ziga xos suyuq tuxumli nachinkaga ega to'rtburchak baraklar. Yangi smetanamiz bilan birga tortiladi.",
      dish_tukhum_barak_price: "75 000 so'm",
      dish_tukhum_barak_stats: "400g / 900 kkal",
      dish_avocado_shrimp_name: "Avokado va Krevetkalar",
      dish_avocado_shrimp_desc: "Yangi avokado bilan qovurilgan krevetkalar va yengil sitrusli sous uyg'unligi.",
      dish_avocado_shrimp_price: "55 000 so'm",
      dish_steak_salad_name: "Issiq Steyk Salati",
      dish_steak_salad_desc: "Yumshoq mol go'shti bo'laklari, ko'katlar, cherri pomidorlari va balzamik sous.",
      dish_steak_salad_price: "60 000 so'm",
      dish_kebab_khorezm_name: "Xorazmcha Kabob",
      dish_kebab_khorezm_desc: "An'anaviy Xorazm ziravorlari bilan tayyorlangan haqiqiy olovda pishgan go'sht shakllari.",
      dish_kebab_khorezm_price: "95 000 so'm",
      dish_khiva_izhzhoh_name: "Xiva Izhzhoni",
      dish_khiva_izhzhoh_desc: "Xiva qalbining afsonaviy an'anaviy go'shtli taomi.",
      dish_khiva_izhzhoh_price: "85 000 so'm",
      dish_gosht_say_name: "Go'sht Say",
      dish_gosht_say_desc: "Qovurilgan premium go'shtlar va an'anaviy garnirlardan iborat to'plam.",
      dish_gosht_say_price: "110 000 so'm",
      dish_chicken_name: "Ko'katli Tovuq",
      dish_chicken_desc: "Maxsus ko'katlar maronadida tayyorlangan va sabzavotlar bilan birga pishirilgan tovuq.",
      dish_chicken_price: "85 000 so'm",
      dish_cocktail_sunset_name: "Dilafruz Sunset",
      dish_cocktail_sunset_desc: "Aroq, ehtiros mevasi, laym, elderflower siropi va tilla rang porlash.",
      dish_cocktail_sunset_price: "55 000 so'm",
      dish_cocktail_martini_name: "Silk Road Martini",
      dish_cocktail_martini_desc: "Espresso, vanilli aroq, Kaluax, kardamonli maxsus sirop.",
      dish_cocktail_martini_price: "60 000 so'm",
      dish_tiramisu_name: "Klassik Tiramisu",
      dish_tiramisu_desc: "Maskarpone kremi, kofeli pechenyelar va qora kakao kukuni.",
      dish_tiramisu_price: "50 000 so'm",
      tag_khorezm: "Xorazmcha",
      tag_signature: "Mualliflik",
      tag_traditional: "An'anaviy",
      tag_popular: "Ommabop",
      tag_chef_choice: "Oshpaz tavsiyasi",
      tag_bestseller: "Xaridorgir",
      tag_sweet: "Shirin yakun"
    }
  };

  const setLanguage = (lang) => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (translations[lang][key]) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = translations[lang][key];
        } else {
          el.textContent = translations[lang][key];
        }
      }
    });

    // Update active button
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Store in localStorage
    localStorage.setItem('preferredLang', lang);
    if (typeof allMenuItems !== 'undefined' && allMenuItems.length > 0) {
      const activeTab = document.querySelector('.menu-tab.active');
      const category = activeTab ? activeTab.dataset.category : 'all';
      renderMenu(allMenuItems, category);
    }
  };

  // Language switcher event listeners
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  // Load preferred language or default to EN
  const savedLang = localStorage.getItem('preferredLang') || 'en';
  setLanguage(savedLang);

  // ─── Image Fallback ─────────────────────────────────────────
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      // Create a beautiful gradient placeholder
      const colors = [
        ['#1a1a2e', '#16213e', '#0f3460'],
        ['#1a1a1a', '#2d2d2d', '#1a1a1a'],
        ['#0c0c0c', '#1a1510', '#0c0c0c'],
        ['#1c1c1c', '#2a2015', '#1c1c1c'],
      ];
      const palette = colors[Math.floor(Math.random() * colors.length)];
      
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, palette[0]);
      gradient.addColorStop(0.5, palette[1]);
      gradient.addColorStop(1, palette[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add subtle gold accent
      ctx.fillStyle = 'rgba(201, 168, 76, 0.08)';
      ctx.beginPath();
      ctx.arc(canvas.width * 0.7, canvas.height * 0.3, 120, 0, Math.PI * 2);
      ctx.fill();
      
      this.src = canvas.toDataURL();
    });
  });

});
