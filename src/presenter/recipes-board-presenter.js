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

        // Add new recipe button
        const addRecipeBtn = this.#boardContainer.querySelector('.more-link');
        if (addRecipeBtn) {
            addRecipeBtn.addEventListener('click', this.#handleAddRecipe.bind(this));
        }

        // Reset filters button
        const resetFilters = () => {
            this.#currentFilters = {};
            if (searchInput) searchInput.value = '';
            if (cuisineFilter) cuisineFilter.selectedIndex = 0;
            if (timeFilter) timeFilter.selectedIndex = 0;
            if (difficultyFilter) difficultyFilter.selectedIndex = 0;
            this.#renderRecipes();
        };

        // Add reset filters functionality to search input clear
        if (searchInput) {
            searchInput.addEventListener('search', () => {
                if (searchInput.value === '') {
                    delete this.#currentFilters.search;
                    this.#renderRecipes();
                }
            });
        }
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
            
            const newRecipe = {
                title: title,
                time: time,
                difficulty: difficulty,
                description: description,
                tags: ["Новые"],
                cuisine: "Русская",
                cookingTime: "medium",
                difficultyLevel: "easy"
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
                tags: form.querySelector('#editTags').value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
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