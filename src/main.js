// main.js
console.log('🚀 FlavorHub app starting...');

// Начальные рецепты
const initialRecipes = [
    {
        id: '1',
        title: "Карбонара",
        time: "20 мин",
        difficulty: "👨‍🍳 Любитель",
        rating: "4.7",
        description: "Классическая итальянская паста с хрустящим беконом, сыром пармезан и сливочным соусом на основе яичных желтков.",
        tags: ["Паста", "Итальянская", "Сытные", "Бекон"],
        badge: "Классика",
        cuisine: "🇮🇹 Итальянская",
        cookingTime: "short",
        difficultyLevel: "medium",
        category: "Основные"
    },
    {
        id: '2',
        title: "Окрошка",
        time: "25 мин",
        difficulty: "👶 Начинающий",
        rating: "4.3",
        description: "Освежающий холодный суп на квасе с отварным мясом, свежими овощами и зеленью. Идеален для жаркого лета.",
        tags: ["Супы", "Русская", "Лето", "Охлаждающие"],
        badge: "Лето",
        cuisine: "🇷🇺 Русская",
        cookingTime: "short",
        difficultyLevel: "easy",
        category: "Супы"
    },
    {
        id: '3',
        title: "Сырники",
        time: "30 мин",
        difficulty: "👶 Начинающий",
        rating: "4.4",
        description: "Нежные творожные оладьи с золотистой корочкой. Подаются со сметаной, вареньем или свежими ягодами.",
        tags: ["Завтраки", "Русская", "Творог", "Сладкое"],
        badge: "Завтрак",
        cuisine: "🇷🇺 Русская",
        cookingTime: "short",
        difficultyLevel: "easy",
        category: "Завтраки"
    }
];

let recipes = [...initialRecipes];

// Проверяем загрузку DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

function initApp() {
    console.log('📄 DOM ready, initializing app...');
    
    // Удаляем статический контент
    removeStaticContent();
    
    // Создаем и рендерим хедер
    renderHeader();
    
    // Инициализируем доску рецептов
    initRecipeBoard();
    
    // Инициализируем форму подписки
    initSubscriptionForm();
    
    console.log('✅ App initialized successfully');
}

function removeStaticContent() {
    const elementsToRemove = ['header', '.filters', '.search-section', '.popular-section', '.more-link'];
    
    elementsToRemove.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.remove();
            console.log(`🗑️ Removed: ${selector}`);
        }
    });
}

function renderHeader() {
    const headerHTML = `
        <header>
            <div class="container">
                <div class="logo">FlavorHub</div>
                <nav class="nav-menu">
                    <a href="#" class="nav-link">Рецепты</a>
                    <a href="#" class="nav-link">Категории</a>
                    <a href="#" class="nav-link">О проекте</a>
                </nav>
                <button class="theme-toggle" id="themeToggle">
                    <span class="theme-icon">🌙</span>
                    <span class="theme-text">Темная тема</span>
                </button>
            </div>
        </header>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    initThemeToggle();
}

function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        updateThemeButton(isDark ? 'dark' : 'light');
    });

    // Восстанавливаем тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeButton('dark');
    }
}

function updateThemeButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    
    if (theme === 'dark') {
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Светлая тема';
    } else {
        themeIcon.textContent = '🌙';
        themeText.textContent = 'Темная тема';
    }
}

function initRecipeBoard() {
    const container = document.getElementById('recipeBoardContainer');
    if (!container) {
        console.error('❌ Recipe board container not found!');
        return;
    }

    // Очищаем контейнер
    container.innerHTML = '';

    // Рендерим компоненты напрямую
    container.innerHTML = `
        <div class="search-section">
            <input type="text" class="search-input" placeholder="🔍 Поиск рецептов по названию, ингредиентам...">
            <button class="search-btn" type="button">Найти</button>
            <!-- КНОПКА ДОБАВЛЕНИЯ РЕЦЕПТА -->
            <button class="add-recipe-main-btn" type="button">
                <span class="add-recipe-icon">+</span>
                Добавить рецепт
            </button>
        </div>
        
        <div class="filters-grid">
            <div class="filter-section">
                <div class="filter-title">🌍 СТРАНА / КУХНЯ</div>
                <select class="dropdown" id="cuisineFilter">
                    <option value="">Все кухни</option>
                    <option value="🇷🇺 Русская">🇷🇺 Русская</option>
                    <option value="🇮🇹 Итальянская">🇮🇹 Итальянская</option>
                    <option value="🇫🇷 Французская">🇫🇷 Французская</option>
                    <option value="🇨🇳 Китайская">🇨🇳 Китайская</option>
                    <option value="🇯🇵 Японская">🇯🇵 Японская</option>
                    <option value="🇲🇽 Мексиканская">🇲🇽 Мексиканская</option>
                </select>
            </div>

            <div class="filter-section">
                <div class="filter-title">⏱️ ВРЕМЯ ПРИГОТОВЛЕНИЯ</div>
                <select class="dropdown" id="timeFilter">
                    <option value="">Любое время</option>
                    <option value="short">🚀 Быстро (до 20 мин)</option>
                    <option value="short">⚡ До 30 минут</option>
                    <option value="medium">🕐 До 1 часа</option>
                    <option value="long">⏳ Более 1 часа</option>
                </select>
            </div>

            <div class="filter-section">
                <div class="filter-title">📊 СЛОЖНОСТЬ</div>
                <select class="dropdown" id="difficultyFilter">
                    <option value="">Любая сложность</option>
                    <option value="easy">👶 Начинающий</option>
                    <option value="medium">👨‍🍳 Любитель</option>
                    <option value="hard">🧑‍🍳 Профессионал</option>
                </select>
            </div>

            <div class="filter-section">
                <div class="filter-title">🍽️ ТИП БЛЮДА</div>
                <select class="dropdown" id="categoryFilter">
                    <option value="">Все типы</option>
                    <option value="Закуски">🥗 Закуски</option>
                    <option value="Супы">🍲 Супы</option>
                    <option value="Основные">🍛 Основные блюда</option>
                    <option value="Десерты">🍰 Десерты</option>
                    <option value="Завтраки">🥞 Завтраки</option>
                </select>
            </div>
        </div>

        <div class="active-filters" id="activeFilters" style="display: none;">
            <div class="active-filters-title">Активные фильтры:</div>
            <div class="active-filters-list" id="activeFiltersList"></div>
        </div>

        <div class="results-counter" id="resultsCounter"></div>

        <div class="popular-section">
            <h2 class="section-title">🔥 ПОПУЛЯРНЫЕ РЕЦЕПТЫ</h2>
            <div class="popular-grid" id="recipesContainer">
                <!-- Рецепты будут здесь -->
            </div>
        </div>
    `;

    // Рендерим начальные рецепты
    renderRecipes();
    
    // Настраиваем обработчики событий
    setupRecipeBoardEvents();
    
    console.log('✅ Recipe board initialized');
}

function renderRecipes() {
    const recipesContainer = document.getElementById('recipesContainer');
    const resultsCounter = document.getElementById('resultsCounter');
    
    if (!recipesContainer) return;

    // Очищаем контейнер
    recipesContainer.innerHTML = '';

    // Обновляем счетчик результатов
    if (resultsCounter) {
        resultsCounter.textContent = `Найдено рецептов: ${recipes.length}`;
    }

    // Если рецептов нет - показываем пустое состояние
    if (recipes.length === 0) {
        recipesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍳</div>
                <h3>Рецепты не найдены</h3>
                <p>Попробуйте изменить параметры поиска или добавьте новый рецепт</p>
            </div>
        `;
        return;
    }

    // Рендерим все рецепты
    recipes.forEach(recipe => {
        const recipeCardHTML = createRecipeCardHTML(recipe);
        recipesContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
    });

    console.log(`✅ Rendered ${recipes.length} recipes`);
}

function createRecipeCardHTML(recipe) {
    return `
        <div class="popular-card" data-recipe-id="${recipe.id}">
            ${recipe.badge ? `<div class="card-badge">${recipe.badge}</div>` : ''}
            <div class="card-content">
                <h3 class="card-title">${recipe.title}</h3>
                <div class="card-meta">
                    <span class="meta-item">⏱️ ${recipe.time}</span>
                    <span class="meta-item">${recipe.difficulty}</span>
                    <span class="meta-item">⭐ ${recipe.rating}</span>
                </div>
                <p class="card-description">${recipe.description}</p>
                <div class="card-tags">
                    ${recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="card-btn">
                    <button class="change" onclick="editRecipe('${recipe.id}')">📝 Редактировать</button>
                    <button class="delete" onclick="deleteRecipe('${recipe.id}')">🗑️ Удалить</button>
                </div>
            </div>
        </div>
    `;
}

function setupRecipeBoardEvents() {
    // Обработчик кнопки добавления рецепта в поисковой секции
    const addButton = document.querySelector('.add-recipe-main-btn');
    if (addButton) {
        addButton.addEventListener('click', showAddRecipeForm);
        console.log('✅ Add recipe button event listener attached');
    } else {
        console.error('❌ Add recipe button not found!');
    }

    // Обработчики поиска
    const searchBtn = document.querySelector('.search-btn');
    const searchInput = document.querySelector('.search-input');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Обработчики фильтров
    const filters = ['cuisineFilter', 'timeFilter', 'difficultyFilter', 'categoryFilter'];
    filters.forEach(filterId => {
        const filter = document.getElementById(filterId);
        if (filter) {
            filter.addEventListener('change', updateActiveFilters);
        }
    });
}

function showAddRecipeForm() {
    console.log('➕ Add recipe button clicked!');
    
    const modalHTML = `
        <div class="edit-modal" id="addRecipeModal">
            <div class="edit-form">
                <h2>Добавить новый рецепт</h2>
                
                <div>
                    <label class="required-field">Название рецепта</label>
                    <input type="text" id="addTitle" placeholder="Введите название рецепта" required>
                </div>

                <div>
                    <label>Описание</label>
                    <textarea id="addDescription" placeholder="Опишите рецепт..."></textarea>
                </div>

                <div>
                    <label class="required-field">Время приготовления</label>
                    <input type="text" id="addTime" placeholder="Например: 30 мин" required>
                    <div class="form-hint">Примеры: 15 мин, 30 мин, 1 ч, 1 ч 30 мин</div>
                </div>

                <div>
                    <label class="required-field">Сложность</label>
                    <select id="addDifficulty" required>
                        <option value="">Выберите сложность</option>
                        <option value="👶 Начинающий">👶 Начинающий</option>
                        <option value="👨‍🍳 Любитель">👨‍🍳 Любитель</option>
                        <option value="🧑‍🍳 Профессионал">🧑‍🍳 Профессионал</option>
                    </select>
                </div>

                <div>
                    <label class="required-field">Кухня</label>
                    <select id="addCuisine" required>
                        <option value="">Выберите кухню</option>
                        <option value="🇷🇺 Русская">🇷🇺 Русская</option>
                        <option value="🇮🇹 Итальянская">🇮🇹 Итальянская</option>
                        <option value="🇫🇷 Французская">🇫🇷 Французская</option>
                        <option value="🇨🇳 Китайская">🇨🇳 Китайская</option>
                        <option value="🇯🇵 Японская">🇯🇵 Японская</option>
                        <option value="🇲🇽 Мексиканская">🇲🇽 Мексиканская</option>
                    </select>
                </div>

                <div>
                    <label class="required-field">Тип блюда</label>
                    <select id="addCategory" required>
                        <option value="">Выберите тип блюда</option>
                        <option value="Закуски">🥗 Закуски</option>
                        <option value="Супы">🍲 Супы</option>
                        <option value="Основные">🍛 Основные блюда</option>
                        <option value="Десерты">🍰 Десерты</option>
                        <option value="Завтраки">🥞 Завтраки</option>
                    </select>
                </div>

                <div>
                    <label>Теги (через запятую)</label>
                    <input type="text" id="addTags" placeholder="Например: Быстро, Вегетарианские, Здоровые">
                    <div class="form-hint">Необязательное поле. Теги помогут в поиске рецепта</div>
                </div>

                <div class="edit-button-group">
                    <button type="button" class="cancel-btn" onclick="closeAddRecipeForm()">Отмена</button>
                    <button type="button" class="save-btn" onclick="saveNewRecipe()">Добавить рецепт</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Закрытие модального окна при клике вне формы
    const modal = document.getElementById('addRecipeModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeAddRecipeForm();
        }
    });

    // Закрытие по ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAddRecipeForm();
        }
    });
}

// Глобальные функции для модального окна
window.closeAddRecipeForm = function() {
    const modal = document.getElementById('addRecipeModal');
    if (modal) {
        modal.remove();
        console.log('❌ Add recipe form closed');
    }
}

window.saveNewRecipe = function() {
    const title = document.getElementById('addTitle').value.trim();
    const description = document.getElementById('addDescription').value.trim();
    const time = document.getElementById('addTime').value.trim();
    const difficulty = document.getElementById('addDifficulty').value;
    const cuisine = document.getElementById('addCuisine').value;
    const category = document.getElementById('addCategory').value;
    const tagsInput = document.getElementById('addTags').value.trim();

    // Валидация
    if (!title) {
        alert('Название рецепта обязательно для заполнения!');
        document.getElementById('addTitle').focus();
        return;
    }

    if (!time) {
        alert('Время приготовления обязательно для заполнения!');
        document.getElementById('addTime').focus();
        return;
    }

    if (!difficulty) {
        alert('Выберите сложность рецепта!');
        document.getElementById('addDifficulty').focus();
        return;
    }

    if (!cuisine) {
        alert('Выберите кухню рецепта!');
        document.getElementById('addCuisine').focus();
        return;
    }

    if (!category) {
        alert('Выберите тип блюда!');
        document.getElementById('addCategory').focus();
        return;
    }

    // Обработка тегов
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : [category];

    // Создаем новый рецепт
    const newRecipe = {
        id: Date.now().toString(), // Генерируем уникальный ID
        title,
        description: description || `${title} - вкусный и простой рецепт`,
        time,
        difficulty,
        cuisine,
        category,
        tags,
        rating: "4.5",
        badge: "Новый",
        cookingTime: "medium",
        difficultyLevel: "medium"
    };

    // Добавляем рецепт в массив
    recipes.unshift(newRecipe); // Добавляем в начало
    
    // Показываем уведомление
    alert(`Рецепт "${title}" успешно добавлен!`);
    
    // Закрываем форму
    closeAddRecipeForm();
    
    // Перерисовываем рецепты
    renderRecipes();
}

// Функции для кнопок в карточке рецепта
window.editRecipe = function(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe) {
        alert(`Редактирование рецепта: ${recipe.title}\n\nЭта функция находится в разработке.`);
    }
}

window.deleteRecipe = function(recipeId) {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    if (confirm(`Вы уверены, что хотите удалить рецепт "${recipe.title}"?`)) {
        // Удаляем рецепт из массива
        recipes = recipes.filter(r => r.id !== recipeId);
        
        // Перерисовываем рецепты
        renderRecipes();
        
        alert(`Рецепт "${recipe.title}" удален!`);
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            // Фильтруем рецепты по поисковому запросу
            const filteredRecipes = recipes.filter(recipe => 
                recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            
            // Временно показываем результаты
            const recipesContainer = document.getElementById('recipesContainer');
            const resultsCounter = document.getElementById('resultsCounter');
            
            if (recipesContainer) {
                recipesContainer.innerHTML = '';
                
                if (filteredRecipes.length === 0) {
                    recipesContainer.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-icon">🔍</div>
                            <h3>По запросу "${searchTerm}" ничего не найдено</h3>
                            <p>Попробуйте изменить поисковый запрос</p>
                        </div>
                    `;
                } else {
                    filteredRecipes.forEach(recipe => {
                        const recipeCardHTML = createRecipeCardHTML(recipe);
                        recipesContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
                    });
                }
                
                if (resultsCounter) {
                    resultsCounter.textContent = `Найдено рецептов: ${filteredRecipes.length}`;
                }
            }
        } else {
            // Если поиск пустой, показываем все рецепты
            renderRecipes();
        }
    }
}

function updateActiveFilters() {
    const activeFilters = [];
    
    // Проверяем каждый фильтр
    const filters = [
        { id: 'cuisineFilter', name: 'Кухня' },
        { id: 'timeFilter', name: 'Время' },
        { id: 'difficultyFilter', name: 'Сложность' },
        { id: 'categoryFilter', name: 'Тип блюда' }
    ];

    filters.forEach(filter => {
        const element = document.getElementById(filter.id);
        if (element && element.value) {
            activeFilters.push(`${filter.name}: ${element.options[element.selectedIndex].text}`);
        }
    });

    // Показываем/скрываем блок активных фильтров
    const activeFiltersContainer = document.getElementById('activeFilters');
    const activeFiltersList = document.getElementById('activeFiltersList');
    
    if (activeFilters.length > 0) {
        activeFiltersContainer.style.display = 'block';
        activeFiltersList.innerHTML = activeFilters.map(filter => 
            `<div class="filter-chip">${filter}</div>`
        ).join('');
    } else {
        activeFiltersContainer.style.display = 'none';
    }
}

function initSubscriptionForm() {
    const subscribeForm = document.getElementById('subscribe-form');
    if (subscribeForm) {
        subscribeForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailInput = event.target.querySelector('.email-input');
            const email = emailInput.value;
            
            if (email && email.includes('@')) {
                alert(`Спасибо за подписку! На адрес ${email} будут приходить новые рецепты.`);
                event.target.reset();
            } else {
                alert('Пожалуйста, введите корректный email адрес.');
            }
        });
    }
}