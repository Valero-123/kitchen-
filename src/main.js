// main.js
console.log('🚀 FlavorHub app starting...');

// Переменная для хранения рецептов
let recipes = [];
let currentFilters = {};

// Проверяем загрузку DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

async function initApp() {
    console.log('📄 DOM ready, initializing app...');
    
    try {
        // Загружаем рецепты из mock файла
        await loadRecipes();
        
        // Удаляем статический контент
        removeStaticContent();
        
        // Создаем и рендерим хедер
        renderHeader();
        
        // Инициализируем доску рецептов
        initRecipeBoard();
        
        // Инициализируем форму подписки
        initSubscriptionForm();
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        // Показываем сообщение об ошибке
        showErrorMessage('Не удалось загрузить рецепты. Пожалуйста, обновите страницу.');
    }
}

async function loadRecipes() {
    try {
        console.log('🔍 Loading recipes from mock file...');
        
        // Динамически импортируем рецепты
        const recipeModule = await import('./mock/recipe.js');
        recipes = [...recipeModule.mockRecipes];
        
        console.log(`✅ Loaded ${recipes.length} recipes from mock file`);
        console.log('📝 Recipe titles:', recipes.map(r => r.title));
        
    } catch (error) {
        console.error('❌ Error loading recipes:', error);
        
        // Fallback: создаем несколько базовых рецептов если файл не загрузился
        recipes = [
            {
                id: 'fallback-1',
                title: "Карбонара",
                time: "20 мин",
                difficulty: "👨‍🍳 Любитель",
                rating: "4.7",
                description: "Классическая итальянская паста с беконом и сыром.",
                tags: ["Паста", "Итальянская"],
                badge: "Классика",
                cuisine: "🇮🇹 Итальянская",
                cookingTime: "short",
                difficultyLevel: "medium",
                category: "Основные"
            },
            {
                id: 'fallback-2',
                title: "Окрошка",
                time: "25 мин",
                difficulty: "👶 Начинающий",
                rating: "4.3",
                description: "Освежающий холодный суп для жаркого лета.",
                tags: ["Супы", "Русская"],
                badge: "Лето",
                cuisine: "🇷🇺 Русская",
                cookingTime: "short",
                difficultyLevel: "easy",
                category: "Супы"
            }
        ];
        
        console.warn('⚠️ Using fallback recipes');
    }
}

function showErrorMessage(message) {
    const container = document.getElementById('recipeBoardContainer');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">⚠️</div>
                <h3>Ошибка загрузки</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">Попробовать снова</button>
            </div>
        `;
    }
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
                    <option value="🇬🇷 Греческая">🇬🇷 Греческая</option>
                    <option value="🇮🇳 Индийская">🇮🇳 Индийская</option>
                    <option value="🇻🇳 Вьетнамская">🇻🇳 Вьетнамская</option>
                    <option value="🇪🇸 Испанская">🇪🇸 Испанская</option>
                </select>
            </div>

            <div class="filter-section">
                <div class="filter-title">⏱️ ВРЕМЯ ПРИГОТОВЛЕНИЯ</div>
                <select class="dropdown" id="timeFilter">
                    <option value="">Любое время</option>
                    <option value="fast">🚀 Быстро (до 20 мин)</option>
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
                    <option value="Напитки">🍹 Напитки</option>
                    <option value="Салаты">🥙 Салаты</option>
                    <option value="Выпечка">🥖 Выпечка</option>
                </select>
            </div>
        </div>

        <div class="active-filters" id="activeFilters" style="display: none;">
            <div class="active-filters-title">Активные фильтры:</div>
            <div class="active-filters-list" id="activeFiltersList"></div>
            <button class="clear-all-filters-btn" onclick="clearAllFilters()">Очистить все фильтры</button>
        </div>

        <div class="results-counter" id="resultsCounter"></div>

        <div class="popular-section">
            <h2 class="section-title">🔥 ПОПУЛЯРНЫЕ РЕЦЕПТЫ</h2>
            <div class="popular-grid" id="recipesContainer">
                <!-- Рецепты будут здесь -->
                <div class="loading-message">
                    Загрузка рецептов...
                </div>
            </div>
        </div>
    `;

    // Рендерим рецепты
    renderRecipes();
    
    // Настраиваем обработчики событий
    setupRecipeBoardEvents();
    
    console.log('✅ Recipe board initialized');
}

function renderRecipes() {
    const recipesContainer = document.getElementById('recipesContainer');
    const resultsCounter = document.getElementById('resultsCounter');
    
    if (!recipesContainer) return;

    // Получаем отфильтрованные рецепты
    const filteredRecipes = filterRecipes();
    
    console.log('🔍 Filtering recipes:', {
        filters: currentFilters,
        total: recipes.length,
        filtered: filteredRecipes.length
    });

    // Очищаем контейнер
    recipesContainer.innerHTML = '';

    // Обновляем счетчик результатов
    if (resultsCounter) {
        const totalRecipes = recipes.length;
        const showingRecipes = filteredRecipes.length;
        resultsCounter.textContent = showingRecipes === totalRecipes 
            ? `Найдено все рецепты: ${showingRecipes}`
            : `Найдено рецептов: ${showingRecipes} из ${totalRecipes}`;
    }

    // Если рецептов нет - показываем пустое состояние
    if (filteredRecipes.length === 0) {
        recipesContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🍳</div>
                <h3>Рецепты не найдены</h3>
                <p>Попробуйте изменить параметры поиска или добавьте новый рецепт</p>
            </div>
        `;
        return;
    }

    // Рендерим отфильтрованные рецепты
    filteredRecipes.forEach(recipe => {
        const recipeCardHTML = createRecipeCardHTML(recipe);
        recipesContainer.insertAdjacentHTML('beforeend', recipeCardHTML);
    });

    console.log(`✅ Rendered ${filteredRecipes.length} recipes`);
}

function filterRecipes() {
    let filteredRecipes = [...recipes];

    // Фильтр по кухне
    if (currentFilters.cuisine && currentFilters.cuisine !== '') {
        filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.cuisine === currentFilters.cuisine
        );
        console.log(`🔍 After cuisine filter (${currentFilters.cuisine}):`, filteredRecipes.length);
    }

    // Фильтр по времени приготовления
    if (currentFilters.time && currentFilters.time !== '') {
        filteredRecipes = filteredRecipes.filter(recipe => {
            const timeValue = currentFilters.time;
            switch (timeValue) {
                case 'fast':
                    return recipe.cookingTime === 'short' || (parseInt(recipe.time) <= 20);
                case 'short':
                    return recipe.cookingTime === 'short' || (parseInt(recipe.time) <= 30);
                case 'medium':
                    return recipe.cookingTime === 'medium' || (parseInt(recipe.time) > 30 && parseInt(recipe.time) <= 60);
                case 'long':
                    return recipe.cookingTime === 'long' || (parseInt(recipe.time) > 60);
                default:
                    return true;
            }
        });
        console.log(`🔍 After time filter (${currentFilters.time}):`, filteredRecipes.length);
    }

    // Фильтр по сложности
    if (currentFilters.difficulty && currentFilters.difficulty !== '') {
        filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.difficultyLevel === currentFilters.difficulty
        );
        console.log(`🔍 After difficulty filter (${currentFilters.difficulty}):`, filteredRecipes.length);
    }

    // Фильтр по категории
    if (currentFilters.category && currentFilters.category !== '') {
        filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.category === currentFilters.category || 
            recipe.tags.includes(currentFilters.category)
        );
        console.log(`🔍 After category filter (${currentFilters.category}):`, filteredRecipes.length);
    }

    // Фильтр по поиску
    if (currentFilters.search && currentFilters.search.trim() !== '') {
        const searchTerm = currentFilters.search.toLowerCase().trim();
        filteredRecipes = filteredRecipes.filter(recipe => 
            recipe.title.toLowerCase().includes(searchTerm) ||
            recipe.description.toLowerCase().includes(searchTerm) ||
            recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
        console.log(`🔍 After search filter (${currentFilters.search}):`, filteredRecipes.length);
    }

    return filteredRecipes;
}

function createRecipeCardHTML(recipe) {
    return `
        <div class="popular-card" data-recipe-id="${recipe.id}">
            ${recipe.badge ? `<div class="card-badge ${recipe.badge === 'Тренд' ? 'trending' : ''}">${recipe.badge}</div>` : ''}
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
    console.log('🔍 Setting up event listeners...');

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
        
        // Очистка поиска при изменении
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() === '') {
                delete currentFilters.search;
                renderRecipes();
                updateActiveFilters();
            }
        });
    }

    // Обработчики фильтров
    const filters = [
        { id: 'cuisineFilter', key: 'cuisine' },
        { id: 'timeFilter', key: 'time' },
        { id: 'difficultyFilter', key: 'difficulty' },
        { id: 'categoryFilter', key: 'category' }
    ];

    filters.forEach(({ id, key }) => {
        const filter = document.getElementById(id);
        if (filter) {
            filter.addEventListener('change', () => {
                currentFilters[key] = filter.value;
                console.log(`🔍 Filter changed: ${key} = ${filter.value}`);
                renderRecipes(); // ВАЖНО: перерисовываем рецепты при изменении фильтра
                updateActiveFilters();
            });
        }
    });

    console.log('✅ All event listeners set up');
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
                        <option value="🇬🇷 Греческая">🇬🇷 Греческая</option>
                        <option value="🇮🇳 Индийская">🇮🇳 Индийская</option>
                        <option value="🇻🇳 Вьетнамская">🇻🇳 Вьетнамская</option>
                        <option value="🇪🇸 Испанская">🇪🇸 Испанская</option>
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
                        <option value="Напитки">🍹 Напитки</option>
                        <option value="Салаты">🥙 Салаты</option>
                        <option value="Выпечка">🥖 Выпечка</option>
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

    // Определяем уровень сложности
    let difficultyLevel = 'medium';
    if (difficulty.includes('Начинающий')) difficultyLevel = 'easy';
    if (difficulty.includes('Профессионал')) difficultyLevel = 'hard';

    // Определяем время приготовления
    let cookingTime = 'medium';
    const timeMinutes = extractTimeMinutes(time);
    if (timeMinutes <= 20) cookingTime = 'fast';
    else if (timeMinutes <= 30) cookingTime = 'short';
    else if (timeMinutes > 60) cookingTime = 'long';

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
        cookingTime: cookingTime,
        difficultyLevel: difficultyLevel
    };

    // Добавляем рецепт в массив
    recipes.unshift(newRecipe); // Добавляем в начало
    
    // Показываем уведомление
    alert(`Рецепт "${title}" успешно добавлен!`);
    
    // Закрываем форму
    closeAddRecipeForm();
    
    // Перерисовываем рецепты
    renderRecipes();
    updateActiveFilters();
}

function extractTimeMinutes(timeString) {
    if (!timeString) return 0;
    
    if (timeString.includes('ч')) {
        const hours = parseInt(timeString) || 0;
        const minutesMatch = timeString.match(/(\d+)\s*мин/);
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        return hours * 60 + minutes;
    } else {
        const minutesMatch = timeString.match(/(\d+)/);
        return minutesMatch ? parseInt(minutesMatch[1]) : 0;
    }
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
        updateActiveFilters();
        
        alert(`Рецепт "${recipe.title}" удален!`);
    }
}

function performSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        const searchTerm = searchInput.value.trim();
        if (searchTerm) {
            currentFilters.search = searchTerm;
            renderRecipes();
            updateActiveFilters();
        } else {
            delete currentFilters.search;
            renderRecipes();
            updateActiveFilters();
        }
    }
}

function updateActiveFilters() {
    const activeFiltersContainer = document.getElementById('activeFilters');
    const activeFiltersList = document.getElementById('activeFiltersList');
    
    if (!activeFiltersContainer || !activeFiltersList) return;

    const activeFilters = Object.entries(currentFilters)
        .filter(([key, value]) => value && value !== '');

    if (activeFilters.length === 0) {
        activeFiltersContainer.style.display = 'none';
        return;
    }

    activeFiltersContainer.style.display = 'block';
    activeFiltersList.innerHTML = '';

    activeFilters.forEach(([key, value]) => {
        const filterChip = document.createElement('div');
        filterChip.className = 'filter-chip';
        
        const filterName = getFilterDisplayName(key, value);
        filterChip.innerHTML = `
            ${filterName}
            <span class="remove-filter" onclick="removeFilter('${key}')">×</span>
        `;

        activeFiltersList.appendChild(filterChip);
    });
}

function getFilterDisplayName(key, value) {
    const displayNames = {
        cuisine: `🌍 ${value.replace(/[🇷🇺🇮🇹🇫🇷🇨🇳🇯🇵🇲🇽🇬🇷🇮🇳🇻🇳🇪🇸]/g, '').trim()}`,
        time: `⏱️ ${getTimeDisplayName(value)}`,
        difficulty: `📊 ${getDifficultyDisplayName(value)}`,
        category: `🍽️ ${value}`,
        search: `🔍 "${value}"`
    };

    return displayNames[key] || `${key}: ${value}`;
}

function getTimeDisplayName(timeKey) {
    const timeNames = {
        'fast': 'До 20 мин',
        'short': 'До 30 мин',
        'medium': 'До 1 часа',
        'long': 'Более 1 часа'
    };
    return timeNames[timeKey] || timeKey;
}

function getDifficultyDisplayName(difficultyKey) {
    const difficultyNames = {
        'easy': 'Начинающий',
        'medium': 'Любитель',
        'hard': 'Профессионал'
    };
    return difficultyNames[difficultyKey] || difficultyKey;
}

window.removeFilter = function(filterKey) {
    delete currentFilters[filterKey];
    
    // Сбрасываем соответствующий элемент формы
    const filterInputs = {
        cuisine: '#cuisineFilter',
        time: '#timeFilter',
        difficulty: '#difficultyFilter',
        category: '#categoryFilter',
        search: '.search-input'
    };

    if (filterInputs[filterKey]) {
        const input = document.querySelector(filterInputs[filterKey]);
        if (input) {
            if (filterKey === 'search') {
                input.value = '';
            } else {
                input.selectedIndex = 0;
            }
        }
    }

    renderRecipes();
    updateActiveFilters();
}

window.clearAllFilters = function() {
    currentFilters = {};
    
    // Сбрасываем все элементы формы
    const searchInput = document.querySelector('.search-input');
    const selects = document.querySelectorAll('select');
    
    if (searchInput) searchInput.value = '';
    selects.forEach(select => select.selectedIndex = 0);

    renderRecipes();
    updateActiveFilters();
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
