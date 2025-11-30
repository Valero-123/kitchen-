import FormAddRecipeComponent from '../view/form-add-recipe-component.js';
import RecipeListComponent from '../view/recipe-list-component.js';
import RecipeComponent from '../view/recipe-component.js';
import EmptyComponent from '../view/empty-component.js';
import { render } from '../framework/render.js';

export default class RecipesBoardPresenter {
    #recipeModel = null;
    #boardContainer = null;
    #formAddRecipeComponent = null;
    #recipeListComponent = null;
    #currentFilters = {};

    constructor(recipeModel, boardContainer) {
        this.#recipeModel = recipeModel;
        this.#boardContainer = boardContainer;
        this.#formAddRecipeComponent = new FormAddRecipeComponent();
        this.#recipeListComponent = new RecipeListComponent();
        this.#recipeModel.addObserver(this.#handleModelChange.bind(this));
    }

    init() {
        this.#renderBoard();
    }

    #renderBoard() {
        this.#boardContainer.innerHTML = '';
        
        render(this.#formAddRecipeComponent, this.#boardContainer);
        render(this.#recipeListComponent, this.#boardContainer);
        this.#renderRecipes();
        this.#setupEventListeners();
    }

    #renderRecipes() {
        const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
        
        if (!recipesContainer) {
            return;
        }
        
        recipesContainer.innerHTML = '';

        const filteredRecipes = this.#recipeModel.filterRecipes(this.#currentFilters);

        this.#updateActiveFiltersDisplay();
        this.#updateResultsCounter(filteredRecipes.length);

        if (filteredRecipes.length === 0) {
            const emptyComponent = new EmptyComponent();
            render(emptyComponent, recipesContainer);
            return;
        }

        filteredRecipes.forEach(recipe => {
            const recipeComponent = new RecipeComponent(recipe);
            render(recipeComponent, recipesContainer);
        });

        this.#setupRecipeEventListeners();
    }

    #setupEventListeners() {
        const searchInput = this.#boardContainer.querySelector('.search-input');
        const searchBtn = this.#boardContainer.querySelector('.search-btn');
        const clearFiltersBtn = this.#boardContainer.querySelector('.clear-filters-btn');

        if (searchInput && searchBtn) {
            const performSearch = () => {
                this.#currentFilters.search = searchInput.value.trim();
                this.#renderRecipes();
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });

            searchInput.addEventListener('input', () => {
                if (searchInput.value.trim() === '') {
                    delete this.#currentFilters.search;
                    this.#renderRecipes();
                }
            });
        }

        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.#clearAllFilters();
            });
        }

        const filters = [
            { id: 'cuisineFilter', key: 'cuisine' },
            { id: 'timeFilter', key: 'time' },
            { id: 'difficultyFilter', key: 'difficulty' },
            { id: 'categoryFilter', key: 'category' },
            { id: 'ratingFilter', key: 'rating' },
            { id: 'tagsFilter', key: 'tags' }
        ];

        filters.forEach(({ id, key }) => {
            const filter = this.#boardContainer.querySelector(`#${id}`);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.#currentFilters[key] = filter.value;
                    this.#renderRecipes();
                });
            }
        });

        const addRecipeBtn = this.#boardContainer.querySelector('.more-link');
        if (addRecipeBtn) {
            addRecipeBtn.addEventListener('click', this.#handleAddRecipe.bind(this));
        }
    }

    #clearAllFilters() {
        this.#currentFilters = {};
        
        const elements = {
            '.search-input': (el) => el.value = '',
            '#cuisineFilter': (el) => el.selectedIndex = 0,
            '#timeFilter': (el) => el.selectedIndex = 0,
            '#difficultyFilter': (el) => el.selectedIndex = 0,
            '#categoryFilter': (el) => el.selectedIndex = 0,
            '#ratingFilter': (el) => el.selectedIndex = 0,
            '#tagsFilter': (el) => el.selectedIndex = 0
        };

        Object.entries(elements).forEach(([selector, resetFn]) => {
            const element = this.#boardContainer.querySelector(selector);
            if (element) resetFn(element);
        });

        this.#renderRecipes();
    }

    #updateActiveFiltersDisplay() {
        const activeFiltersContainer = this.#boardContainer.querySelector('#activeFilters');
        const activeFiltersList = this.#boardContainer.querySelector('#activeFiltersList');

        if (!activeFiltersContainer || !activeFiltersList) return;

        const activeFilters = Object.entries(this.#currentFilters)
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
            
            const filterName = this.#getFilterDisplayName(key, value);
            filterChip.innerHTML = `
                ${filterName}
                <span class="remove-filter">×</span>
            `;

            filterChip.querySelector('.remove-filter').addEventListener('click', () => {
                this.#removeFilter(key);
            });

            activeFiltersList.appendChild(filterChip);
        });
    }

    #updateResultsCounter(resultsCount) {
        let resultsCounter = this.#boardContainer.querySelector('.results-counter');
        
        if (!resultsCounter) {
            resultsCounter = document.createElement('div');
            resultsCounter.className = 'results-counter';
            
            const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
            if (recipesContainer) {
                recipesContainer.parentNode.insertBefore(resultsCounter, recipesContainer);
            }
        }
        
        const totalRecipes = this.#recipeModel.recipes.length;
        resultsCounter.textContent = resultsCount === totalRecipes 
            ? `Найдено все рецепты: ${resultsCount}`
            : `Найдено рецептов: ${resultsCount} из ${totalRecipes}`;
    }

    #getFilterDisplayName(key, value) {
        const displayNames = {
            cuisine: `🌍 ${value.replace(/[🇷🇺🇮🇹🇫🇷🇨🇳🇯🇵🇲🇽🇹🇭🇺🇸🇪🇸🇭🇺🇮🇱🇱🇧🇰🇷🇨🇺🇬🇷🇮🇳🇻🇳]/g, '').trim()}`,
            time: `⏱️ ${this.#getTimeDisplayName(value)}`,
            difficulty: `📊 ${this.#getDifficultyDisplayName(value)}`,
            category: `🍽️ ${value}`,
            rating: `⭐ ${value}+`,
            tags: `🏷️ ${value}`,
            search: `🔍 "${value}"`
        };

        return displayNames[key] || `${key}: ${value}`;
    }

    #getTimeDisplayName(timeKey) {
        const timeNames = {
            'fast': 'До 20 мин',
            'short': 'До 30 мин',
            'medium': 'До 1 часа',
            'long': 'Более 1 часа'
        };
        return timeNames[timeKey] || timeKey;
    }

    #getDifficultyDisplayName(difficultyKey) {
        const difficultyNames = {
            'easy': 'Начинающий',
            'medium': 'Любитель',
            'hard': 'Профессионал'
        };
        return difficultyNames[difficultyKey] || difficultyKey;
    }

    #removeFilter(key) {
        delete this.#currentFilters[key];
        
        const filterInputs = {
            cuisine: '#cuisineFilter',
            time: '#timeFilter',
            difficulty: '#difficultyFilter',
            category: '#categoryFilter',
            rating: '#ratingFilter',
            tags: '#tagsFilter',
            search: '.search-input'
        };

        if (filterInputs[key]) {
            const input = this.#boardContainer.querySelector(filterInputs[key]);
            if (input) {
                if (key === 'search') {
                    input.value = '';
                } else {
                    input.selectedIndex = 0;
                }
            }
        }

        this.#renderRecipes();
    }

    #setupRecipeEventListeners() {
        this.#boardContainer.querySelectorAll('.change').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeCard = event.target.closest('.popular-card');
                if (recipeCard) {
                    this.#handleEditRecipe(recipeCard.dataset.recipeId);
                }
            });
        });

        this.#boardContainer.querySelectorAll('.delete').forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeCard = event.target.closest('.popular-card');
                if (recipeCard) {
                    this.#handleDeleteRecipe(recipeCard.dataset.recipeId);
                }
            });
        });
    }

    #handleAddRecipe() {
        const title = prompt('Введите название рецепта:');
        if (title) {
            const description = prompt('Введите описание рецепта:') || "Новый рецепт";
            const time = prompt('Введите время приготовления:') || "30 мин";
            const difficulty = prompt('Введите сложность:') || "👶 Начинающий";
            const cuisine = prompt('Введите кухню:') || "🇷🇺 Русская";
            const tags = prompt('Введите теги через запятую:') || "Новые";
            
            const newRecipe = {
                title,
                time,
                difficulty,
                description,
                tags: tags.split(',').map(tag => tag.trim()),
                cuisine,
                cookingTime: "medium",
                difficultyLevel: "easy",
                category: "Основные"
            };
            
            this.#recipeModel.addRecipe(newRecipe);
            alert(`Рецепт "${title}" успешно добавлен!`);
        }
    }

    #handleEditRecipe(recipeId) {
        const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
        if (recipe) {
            this.#showEditForm(recipe);
        }
    }

    #showEditForm(recipe) {
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        
        const form = document.createElement('div');
        form.className = 'edit-form';
        form.innerHTML = this.#createEditFormHTML(recipe);

        modal.appendChild(form);
        document.body.appendChild(modal);

        this.#setupEditFormListeners(modal, form, recipe);
    }

    #createEditFormHTML(recipe) {
        return `
            <h2>Редактировать рецепт</h2>
            
            <div>
                <label>Название рецепта:</label>
                <input type="text" id="editTitle" value="${recipe.title}">
            </div>

            <div>
                <label>Описание:</label>
                <textarea id="editDescription">${recipe.description}</textarea>
            </div>

            <div>
                <label>Время приготовления:</label>
                <input type="text" id="editTime" value="${recipe.time}">
            </div>

            <div>
                <label>Сложность:</label>
                <select id="editDifficulty">
                    <option value="👶 Начинающий" ${recipe.difficulty.includes('Начинающий') ? 'selected' : ''}>👶 Начинающий</option>
                    <option value="👨‍🍳 Любитель" ${recipe.difficulty.includes('Средне') ? 'selected' : ''}>👨‍🍳 Любитель</option>
                    <option value="🧑‍🍳 Профессионал" ${recipe.difficulty.includes('Сложно') ? 'selected' : ''}>🧑‍🍳 Профессионал</option>
                </select>
            </div>

            <div>
                <label>Кухня:</label>
                <select id="editCuisine">
                    ${this.#createCuisineOptions(recipe)}
                </select>
            </div>

            <div>
                <label>Тип блюда:</label>
                <select id="editCategory">
                    ${this.#createCategoryOptions(recipe)}
                </select>
            </div>

            <div>
                <label>Теги (через запятую):</label>
                <input type="text" id="editTags" value="${recipe.tags.join(', ')}">
            </div>

            <div class="edit-button-group">
                <button type="button" class="cancel-btn">Отмена</button>
                <button type="button" class="save-btn">Сохранить</button>
            </div>
        `;
    }

    #createCuisineOptions(recipe) {
        const cuisines = [
            '🇷🇺 Русская', '🇮🇹 Итальянская', '🇫🇷 Французская', '🇨🇳 Китайская',
            '🇯🇵 Японская', '🇲🇽 Мексиканская', '🇹🇭 Тайская', '🇺🇸 Американская',
            '🇪🇸 Испанская', '🇭🇺 Венгерская', '🇮🇱 Израильская', '🇱🇧 Ливанская',
            '🇰🇷 Корейская', '🇨🇺 Кубинская', '🇬🇷 Греческая', '🇮🇳 Индийская', '🇻🇳 Вьетнамская'
        ];

        return cuisines.map(cuisine => 
            `<option value="${cuisine}" ${recipe.cuisine.includes(cuisine.replace(/[🇷🇺🇮🇹🇫🇷🇨🇳🇯🇵🇲🇽🇹🇭🇺🇸🇪🇸🇭🇺🇮🇱🇱🇧🇰🇷🇨🇺🇬🇷🇮🇳🇻🇳]/g, '').trim()) ? 'selected' : ''}>${cuisine}</option>`
        ).join('');
    }

    #createCategoryOptions(recipe) {
        const categories = [
            { value: 'Закуски', label: '🥗 Закуски' },
            { value: 'Супы', label: '🍲 Супы' },
            { value: 'Основные', label: '🍛 Основные блюда' },
            { value: 'Десерты', label: '🍰 Десерты' },
            { value: 'Завтраки', label: '🥞 Завтраки' },
            { value: 'Напитки', label: '🍹 Напитки' },
            { value: 'Салаты', label: '🥙 Салаты' },
            { value: 'Выпечка', label: '🥖 Выпечка' }
        ];

        return categories.map(cat => 
            `<option value="${cat.value}" ${recipe.tags.includes(cat.value) ? 'selected' : ''}>${cat.label}</option>`
        ).join('');
    }

    #setupEditFormListeners(modal, form, recipe) {
        const cancelBtn = form.querySelector('.cancel-btn');
        const saveBtn = form.querySelector('.save-btn');

        const closeModal = () => document.body.removeChild(modal);

        cancelBtn.addEventListener('click', closeModal);

        saveBtn.addEventListener('click', () => {
            const updatedData = {
                title: form.querySelector('#editTitle').value,
                description: form.querySelector('#editDescription').value,
                time: form.querySelector('#editTime').value,
                difficulty: form.querySelector('#editDifficulty').value,
                cuisine: form.querySelector('#editCuisine').value,
                tags: form.querySelector('#editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                category: form.querySelector('#editCategory').value
            };

            if (updatedData.title.trim() === '') {
                alert('Название рецепта не может быть пустым!');
                return;
            }

            this.#recipeModel.updateRecipe(recipe.id, updatedData);
            closeModal();
            alert('Рецепт успешно обновлен!');
        });

        modal.addEventListener('click', (event) => {
            if (event.target === modal) closeModal();
        });

        document.addEventListener('keydown', function closeOnEscape(event) {
            if (event.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', closeOnEscape);
            }
        });
    }

    #handleDeleteRecipe(recipeId) {
        const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
        if (recipe && confirm(`Вы уверены, что хотите удалить рецепт "${recipe.title}"?`)) {
            this.#recipeModel.deleteRecipe(recipeId);
            alert(`Рецепт "${recipe.title}" удален!`);
        }
    }

    #handleModelChange() {
        this.#renderRecipes();
    }
}