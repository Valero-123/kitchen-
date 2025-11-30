import FormAddRecipeComponent from '../view/form-add-recipe-component.js';
import RecipeListComponent from '../view/recipe-list-component.js';
import RecipeComponent from '../view/recipe-component.js';
import EmptyComponent from '../view/empty-component.js';
import { render } from '../framework/render.js';

export default class RecipesBoardPresenter {
    #recipeModel = null;
    #boardContainer = null;
    #formAddRecipeComponent = new FormAddRecipeComponent();
    #recipeListComponent = new RecipeListComponent();
    #currentFilters = {};

    constructor(recipeModel, boardContainer) {
        this.#recipeModel = recipeModel;
        this.#boardContainer = boardContainer;
        this.#recipeModel.addObserver(this.#handleModelChange.bind(this));
    }

    init() {
        this.#renderBoard();
    }

    #renderBoard() {
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
                this.#currentFilters.search = searchInput.value;
                this.#renderRecipes();
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    performSearch();
                }
            });
        }

        // Filter functionality - cuisine
        const cuisineFilter = this.#boardContainer.querySelector('#cuisineFilter');
        if (cuisineFilter) {
            cuisineFilter.addEventListener('change', () => {
                this.#currentFilters.cuisine = cuisineFilter.value;
                this.#renderRecipes();
            });
        }

        // Filter functionality - time
        const timeFilter = this.#boardContainer.querySelector('#timeFilter');
        if (timeFilter) {
            timeFilter.addEventListener('change', () => {
                this.#currentFilters.time = timeFilter.value;
                this.#renderRecipes();
            });
        }

        // Filter functionality - difficulty
        const difficultyFilter = this.#boardContainer.querySelector('#difficultyFilter');
        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => {
                this.#currentFilters.difficulty = difficultyFilter.value;
                this.#renderRecipes();
            });
        }

        // Add new recipe button
        const addRecipeBtn = this.#boardContainer.querySelector('.more-link');
        if (addRecipeBtn) {
            addRecipeBtn.addEventListener('click', this.#handleAddRecipe.bind(this));
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
            const newRecipe = {
                title: title,
                time: "30 мин",
                difficulty: "👨‍🍳 Средне",
                description: description,
                tags: ["Новые"],
                cuisine: "Русская",
                cookingTime: "medium",
                difficultyLevel: "medium"
            };
            
            this.#recipeModel.addRecipe(newRecipe);
            alert(`Рецепт "${title}" успешно добавлен!`);
        }
    }

    #handleEditRecipe(recipeId) {
        const recipe = this.#recipeModel.recipes.find(recipeItem => recipeItem.id === recipeId);
        if (recipe) {
            const newTitle = prompt('Введите новое название рецепта:', recipe.title);
            if (newTitle) {
                this.#recipeModel.updateRecipe(recipeId, { title: newTitle });
                alert(`Рецепт переименован в "${newTitle}"!`);
            }
        }
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