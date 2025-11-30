import RecipeListComponent from '../view/recipe-list-component.js';
import RecipeComponent from '../view/recipe-component.js';
import EmptyComponent from '../view/empty-component.js';
import { render } from '../framework/render.js';

export default class RecipesBoardPresenter {
  #recipeModel = null;
  #boardContainer = null;
  #recipeListComponent = new RecipeListComponent();
  #currentFilters = {};

  constructor(recipeModel, boardContainer) {
    this.#recipeModel = recipeModel;
    this.#boardContainer = boardContainer;

    // Subscribe to model changes
    this.#recipeModel.addObserver(this.#handleModelChange.bind(this));
  }

  init() {
    this.#renderBoard();
    this.#setupEventListeners();
  }

  #renderBoard() {
    render(this.#recipeListComponent, this.#boardContainer);
    this.#renderRecipes();
  }

  #renderRecipes() {
    const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
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
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    const performSearch = () => {
      this.#currentFilters.search = searchInput.value;
      this.#renderRecipes();
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });

    // Filter functionality
    const cuisineFilter = document.querySelector('#cuisineFilter');
    const timeFilter = document.querySelector('#timeFilter');
    const difficultyFilter = document.querySelector('#difficultyFilter');

    [cuisineFilter, timeFilter, difficultyFilter].forEach(filter => {
      filter.addEventListener('change', () => {
        this.#currentFilters.cuisine = cuisineFilter.value;
        // Add more filter logic as needed
        this.#renderRecipes();
      });
    });

    // Add new recipe button
    const addRecipeBtn = document.querySelector('.more-link');
    addRecipeBtn.addEventListener('click', this.#handleAddRecipe.bind(this));
  }

  #setupRecipeEventListeners() {
    // Edit buttons
    document.querySelectorAll('.change').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recipeCard = e.target.closest('.popular-card');
        const recipeId = recipeCard.dataset.recipeId;
        this.#handleEditRecipe(recipeId);
      });
    });

    // Delete buttons
    document.querySelectorAll('.delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const recipeCard = e.target.closest('.popular-card');
        const recipeId = recipeCard.dataset.recipeId;
        this.#handleDeleteRecipe(recipeId);
      });
    });
  }

  #handleAddRecipe() {
    const title = prompt('Введите название рецепта:');
    if (title) {
      const newRecipe = {
        title,
        time: "30 мин",
        difficulty: "👶 Начинающий",
        description: "Новый рецепт",
        tags: ["Новые"],
        cuisine: "Русская",
        cookingTime: "short",
        difficultyLevel: "easy"
      };
      
      this.#recipeModel.addRecipe(newRecipe);
    }
  }

  #handleEditRecipe(recipeId) {
    const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
    if (recipe) {
      const newTitle = prompt('Введите новое название рецепта:', recipe.title);
      if (newTitle) {
        this.#recipeModel.updateRecipe(recipeId, { title: newTitle });
      }
    }
  }

  #handleDeleteRecipe(recipeId) {
    const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
    if (recipe && confirm(`Вы уверены, что хотите удалить рецепт "${recipe.title}"?`)) {
      this.#recipeModel.deleteRecipe(recipeId);
    }
  }

  #handleModelChange() {
    this.#renderRecipes();
  }
}