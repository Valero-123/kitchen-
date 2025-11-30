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
        // Clear the container first
        this.#boardContainer.innerHTML = '';
        
        // Render form with filters and search
        render(this.#formAddRecipeComponent, this.#boardContainer);
        
        // Render recipe list
        render(this.#recipeListComponent, this.#boardContainer);
        
        // Render initial recipes
        this.#renderRecipes();
        
        // Setup event listeners after components are rendered
        this.#setupEventListeners();
    }

    #renderRecipes() {
        const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
        
        if (!recipesContainer) {
            console.error('Recipes container not found!');
            return;
        }
        
        // Clear previous content
        recipesContainer.innerHTML = '';

        const filteredRecipes = this.#recipeModel.filterRecipes(this.#currentFilters);

        console.log('Filtered recipes:', filteredRecipes.length, 'with filters:', this.#currentFilters);

        // Update active filters display
        this.#updateActiveFiltersDisplay();

        // Add results counter
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
        // Search functionality
        const searchInput = this.#boardContainer.querySelector('.search-input');
        const searchBtn = this.#boardContainer.querySelector('.search-btn');
        const clearFiltersBtn = this.#boardContainer.querySelector('.clear-filters-btn');

        if (searchInput && searchBtn) {
            const performSearch = () => {
                const searchValue = searchInput.value.trim();
                this.#currentFilters.search = searchValue;
                console.log('Search performed:', searchValue);
                this.#renderRecipes();
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });

            // Clear search when input is cleared
            searchInput.addEventListener('input', () => {
                if (searchInput.value.trim() === '') {
                    delete this.#currentFilters.search;
                    this.#renderRecipes();
                }
            });
        }

        // Clear all filters
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.#clearAllFilters();
            });
        }

        // Filter functionality - cuisine
        const cuisineFilter = this.#boardContainer.querySelector('#cuisineFilter');
        if (cuisineFilter) {
            cuisineFilter.addEventListener('change', () => {
                this.#currentFilters.cuisine = cuisineFilter.value;
                console.log('Cuisine filter changed:', cuisineFilter.value);
                this.#renderRecipes();
            });
        }

        // Filter functionality - time
        const timeFilter = this.#boardContainer.querySelector('#timeFilter');
        if (timeFilter) {
            timeFilter.addEventListener('change', () => {
                this.#currentFilters.time = timeFilter.value;
                console.log('Time filter changed:', timeFilter.value);
                this.#renderRecipes();
            });
        }

        // Filter functionality - difficulty
        const difficultyFilter = this.#boardContainer.querySelector('#difficultyFilter');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                this.#currentFilters.difficulty = difficultyFilter.value;
                console.log('Difficulty filter changed:', difficultyFilter.value);
                this.#renderRecipes();
            });
        }

        // Filter functionality - category
        const categoryFilter = this.#boardContainer.querySelector('#categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.#currentFilters.category = categoryFilter.value;
                console.log('Category filter changed:', categoryFilter.value);
                this.#renderRecipes();
            });
        }

        // Filter functionality - rating
        const ratingFilter = this.#boardContainer.querySelector('#ratingFilter');
        if (ratingFilter) {
            ratingFilter.addEventListener('change', () => {
                this.#currentFilters.rating = ratingFilter.value;
                console.log('Rating filter changed:', ratingFilter.value);
                this.#renderRecipes();
            });
        }

        // Filter functionality - tags
        const tagsFilter = this.#boardContainer.querySelector('#tagsFilter');
        if (tagsFilter) {
            tagsFilter.addEventListener('change', () => {
                this.#currentFilters.tags = tagsFilter.value;
                console.log('Tags filter changed:', tagsFilter.value);
                this.#renderRecipes();
            });
        }

        // Add new recipe button
        const addRecipeBtn = this.#boardContainer.querySelector('.more-link');
        if (addRecipeBtn) {
            addRecipeBtn.addEventListener('click', this.#handleAddRecipe.bind(this));
        }
    }

    #clearAllFilters() {
        this.#currentFilters = {};
        
        // Reset all filter inputs
        const searchInput = this.#boardContainer.querySelector('.search-input');
        const cuisineFilter = this.#boardContainer.querySelector('#cuisineFilter');
        const timeFilter = this.#boardContainer.querySelector('#timeFilter');
        const difficultyFilter = this.#boardContainer.querySelector('#difficultyFilter');
        const categoryFilter = this.#boardContainer.querySelector('#categoryFilter');
        const ratingFilter = this.#boardContainer.querySelector('#ratingFilter');
        const tagsFilter = this.#boardContainer.querySelector('#tagsFilter');

        if (searchInput) searchInput.value = '';
        if (cuisineFilter) cuisineFilter.selectedIndex = 0;
        if (timeFilter) timeFilter.selectedIndex = 0;
        if (difficultyFilter) difficultyFilter.selectedIndex = 0;
        if (categoryFilter) categoryFilter.selectedIndex = 0;
        if (ratingFilter) ratingFilter.selectedIndex = 0;
        if (tagsFilter) tagsFilter.selectedIndex = 0;

        this.#renderRecipes();
        console.log('All filters cleared');
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
            filterChip.style.cssText = `
                display: inline-flex;
                align-items: center;
                background: var(--primary);
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                margin: 0.25rem;
                font-size: 0.85rem;
                font-weight: 500;
            `;

            const filterName = this.#getFilterDisplayName(key, value);
            filterChip.innerHTML = `
                ${filterName}
                <span class="remove-filter" style="margin-left: 0.5rem; cursor: pointer; font-weight: bold;">×</span>
            `;

            const removeBtn = filterChip.querySelector('.remove-filter');
            removeBtn.addEventListener('click', () => {
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
            resultsCounter.style.cssText = `
                text-align: center;
                margin: 1rem 0;
                color: var(--text-secondary);
                font-size: 0.9rem;
                font-weight: 500;
            `;
            
            const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
            if (recipesContainer) {
                recipesContainer.parentNode.insertBefore(resultsCounter, recipesContainer);
            }
        }
        
        const totalRecipes = this.#recipeModel.recipes.length;
        if (resultsCount === totalRecipes) {
            resultsCounter.textContent = `Найдено все рецепты: ${resultsCount}`;
        } else {
            resultsCounter.textContent = `Найдено рецептов: ${resultsCount} из ${totalRecipes}`;
        }
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
        
        // Reset the corresponding input
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
        // Edit buttons
        const editButtons = this.#boardContainer.querySelectorAll('.change');
        editButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeCard = event.target.closest('.popular-card');
                if (recipeCard) {
                    const recipeId = recipeCard.dataset.recipeId;
                    this.#handleEditRecipe(recipeId);
                }
            });
        });

        // Delete buttons
        const deleteButtons = this.#boardContainer.querySelectorAll('.delete');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const recipeCard = event.target.closest('.popular-card');
                if (recipeCard) {
                    const recipeId = recipeCard.dataset.recipeId;
                    this.#handleDeleteRecipe(recipeId);
                }
            });
        });
    }

    #handleAddRecipe() {
        const title = prompt('Введите название рецепта:');
        if (title) {
            const description = prompt('Введите описание рецепта:') || "Новый рецепт - описание можно добавить позже";
            const time = prompt('Введите время приготовления (например, "30 мин"):') || "30 мин";
            const difficulty = prompt('Введите сложность (например, "👶 Начинающий"):') || "👶 Начинающий";
            const cuisine = prompt('Введите кухню (например, "🇷🇺 Русская"):') || "🇷🇺 Русская";
            const tags = prompt('Введите теги через запятую:') || "Новые";
            
            const newRecipe = {
                title: title,
                time: time,
                difficulty: difficulty,
                description: description,
                tags: tags.split(',').map(tag => tag.trim()),
                cuisine: cuisine,
                cookingTime: "medium",
                difficultyLevel: "easy",
                category: "Основные"
            };
            
            this.#recipeModel.addRecipe(newRecipe);
            alert(`Рецепт "${title}" успешно добавлен!`);
        }
    }

    #handleEditRecipe(recipeId) {
        const recipe = this.#recipeModel.recipes.find(recipeItem => recipeItem.id === recipeId);
        if (recipe) {
            this.#showEditForm(recipe);
        }
    }

    #showEditForm(recipe) {
        // Create modal form for editing
        const modal = document.createElement('div');
        modal.className = 'edit-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;

        const form = document.createElement('div');
        form.className = 'edit-form';
        form.style.cssText = `
            background: var(--surface);
            padding: 2rem;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
        `;

        form.innerHTML = `
            <h2 style="margin-bottom: 1.5rem; color: var(--text-primary);">Редактировать рецепт</h2>
            
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Название рецепта:</label>
                <input type="text" id="editTitle" value="${recipe.title}" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Описание:</label>
                <textarea id="editDescription" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); height: 100px;">${recipe.description}</textarea>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Время приготовления:</label>
                <input type="text" id="editTime" value="${recipe.time}" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Сложность:</label>
                <select id="editDifficulty" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
                    <option value="👶 Начинающий" ${recipe.difficulty.includes('Начинающий') ? 'selected' : ''}>👶 Начинающий</option>
                    <option value="👨‍🍳 Любитель" ${recipe.difficulty.includes('Средне') ? 'selected' : ''}>👨‍🍳 Любитель</option>
                    <option value="🧑‍🍳 Профессионал" ${recipe.difficulty.includes('Сложно') ? 'selected' : ''}>🧑‍🍳 Профессионал</option>
                </select>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Кухня:</label>
                <select id="editCuisine" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
                    <option value="🇷🇺 Русская" ${recipe.cuisine.includes('Русская') ? 'selected' : ''}>🇷🇺 Русская</option>
                    <option value="🇮🇹 Итальянская" ${recipe.cuisine.includes('Итальянская') ? 'selected' : ''}>🇮🇹 Итальянская</option>
                    <option value="🇫🇷 Французская" ${recipe.cuisine.includes('Французская') ? 'selected' : ''}>🇫🇷 Французская</option>
                    <option value="🇨🇳 Китайская" ${recipe.cuisine.includes('Китайская') ? 'selected' : ''}>🇨🇳 Китайская</option>
                    <option value="🇯🇵 Японская" ${recipe.cuisine.includes('Японская') ? 'selected' : ''}>🇯🇵 Японская</option>
                    <option value="🇲🇽 Мексиканская" ${recipe.cuisine.includes('Мексиканская') ? 'selected' : ''}>🇲🇽 Мексиканская</option>
                    <option value="🇹🇭 Тайская" ${recipe.cuisine.includes('Тайская') ? 'selected' : ''}>🇹🇭 Тайская</option>
                    <option value="🇺🇸 Американская" ${recipe.cuisine.includes('Американская') ? 'selected' : ''}>🇺🇸 Американская</option>
                    <option value="🇪🇸 Испанская" ${recipe.cuisine.includes('Испанская') ? 'selected' : ''}>🇪🇸 Испанская</option>
                    <option value="🇭🇺 Венгерская" ${recipe.cuisine.includes('Венгерская') ? 'selected' : ''}>🇭🇺 Венгерская</option>
                    <option value="🇮🇱 Израильская" ${recipe.cuisine.includes('Израильская') ? 'selected' : ''}>🇮🇱 Израильская</option>
                    <option value="🇱🇧 Ливанская" ${recipe.cuisine.includes('Ливанская') ? 'selected' : ''}>🇱🇧 Ливанская</option>
                    <option value="🇰🇷 Корейская" ${recipe.cuisine.includes('Корейская') ? 'selected' : ''}>🇰🇷 Корейская</option>
                    <option value="🇨🇺 Кубинская" ${recipe.cuisine.includes('Кубинская') ? 'selected' : ''}>🇨🇺 Кубинская</option>
                    <option value="🇬🇷 Греческая" ${recipe.cuisine.includes('Греческая') ? 'selected' : ''}>🇬🇷 Греческая</option>
                    <option value="🇮🇳 Индийская" ${recipe.cuisine.includes('Индийская') ? 'selected' : ''}>🇮🇳 Индийская</option>
                    <option value="🇻🇳 Вьетнамская" ${recipe.cuisine.includes('Вьетнамская') ? 'selected' : ''}>🇻🇳 Вьетнамская</option>
                </select>
            </div>

            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Тип блюда:</label>
                <select id="editCategory" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
                    <option value="Закуски" ${recipe.tags.includes('Закуски') ? 'selected' : ''}>🥗 Закуски</option>
                    <option value="Супы" ${recipe.tags.includes('Супы') ? 'selected' : ''}>🍲 Супы</option>
                    <option value="Основные" ${recipe.tags.includes('Основные') ? 'selected' : ''}>🍛 Основные блюда</option>
                    <option value="Десерты" ${recipe.tags.includes('Десерты') ? 'selected' : ''}>🍰 Десерты</option>
                    <option value="Завтраки" ${recipe.tags.includes('Завтраки') ? 'selected' : ''}>🥞 Завтраки</option>
                    <option value="Напитки" ${recipe.tags.includes('Напитки') ? 'selected' : ''}>🍹 Напитки</option>
                    <option value="Салаты" ${recipe.tags.includes('Салаты') ? 'selected' : ''}>🥙 Салаты</option>
                    <option value="Выпечка" ${recipe.tags.includes('Выпечка') ? 'selected' : ''}>🥖 Выпечка</option>
                </select>
            </div>

            <div style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: var(--text-secondary);">Теги (через запятую):</label>
                <input type="text" id="editTags" value="${recipe.tags.join(', ')}" style="width: 100%; padding: 0.8rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary);">
            </div>

            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                <button type="button" id="cancelEdit" style="padding: 0.8rem 1.5rem; border: 2px solid var(--border); border-radius: 8px; background: var(--surface); color: var(--text-primary); cursor: pointer;">Отмена</button>
                <button type="button" id="saveEdit" style="padding: 0.8rem 1.5rem; border: none; border-radius: 8px; background: var(--primary); color: white; cursor: pointer;">Сохранить</button>
            </div>
        `;

        modal.appendChild(form);
        document.body.appendChild(modal);

        // Event listeners for modal
        const cancelBtn = form.querySelector('#cancelEdit');
        const saveBtn = form.querySelector('#saveEdit');

        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(modal);
        });

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
            document.body.removeChild(modal);
            alert('Рецепт успешно обновлен!');
        });

        // Close modal on background click
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        });

        // Close modal on Escape key
        document.addEventListener('keydown', function closeModalOnEscape(event) {
            if (event.key === 'Escape') {
                document.body.removeChild(modal);
                document.removeEventListener('keydown', closeModalOnEscape);
            }
        });
    }

    #handleDeleteRecipe(recipeId) {
        const recipe = this.#recipeModel.recipes.find(recipeItem => recipeItem.id === recipeId);
        if (recipe) {
            const confirmation = confirm(`Вы уверены, что хотите удалить рецепт "${recipe.title}"?`);
            if (confirmation) {
                this.#recipeModel.deleteRecipe(recipeId);
                alert(`Рецепт "${recipe.title}" удален!`);
            }
        }
    }

    #handleModelChange() {
        this.#renderRecipes();
    }
}