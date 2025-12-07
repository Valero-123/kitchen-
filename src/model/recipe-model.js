import RecipesApiService from './recipes-api-service.js';

export default class RecipeModel {
  #recipes = [];
  #observers = [];
  #recipesApiService = null;
  #isInitialized = false;

  constructor(recipesApiService) {
    this.#recipesApiService = recipesApiService;
  }

  get recipes() {
    return this.#recipes;
  }

  get isInitialized() {
    return this.#isInitialized;
  }

  // Инициализация данных с сервера
  async init() {
    try {
      console.log('🔄 Загрузка рецептов с сервера...');
      this.#recipes = await this.#recipesApiService.recipes;
      console.log('✅ Рецепты загружены:', this.#recipes.length);
      this.#isInitialized = true;
      this._notify('INIT');
    } catch (err) {
      console.error('❌ Ошибка загрузки рецептов:', err);
      this.#recipes = [];
      this.#isInitialized = true;
      this._notify('ERROR');
    }
  }

  // Добавить рецепт через API
  async addRecipe(recipeData) {
    try {
      const newRecipe = {
        title: recipeData.title,
        time: recipeData.time,
        difficulty: recipeData.difficulty,
        rating: "4.5",
        description: recipeData.description,
        tags: recipeData.tags || [],
        badge: "Новый",
        cuisine: recipeData.cuisine,
        cookingTime: recipeData.cookingTime,
        difficultyLevel: recipeData.difficultyLevel,
        category: recipeData.category || "Основные",
        createdAt: new Date().toISOString()
      };

      console.log('🔄 Отправка рецепта на сервер:', newRecipe.title);
      const createdRecipe = await this.#recipesApiService.addRecipe(newRecipe);
      
      this.#recipes.push(createdRecipe);
      this._notify('ADD', createdRecipe);
      console.log('✅ Рецепт добавлен на сервер:', createdRecipe.title);
      
      return createdRecipe;
    } catch (err) {
      console.error('❌ Ошибка при добавлении рецепта:', err);
      throw err;
    }
  }

  // Обновить рецепт через API
  async updateRecipe(id, updatedData) {
    try {
      const index = this.#recipes.findIndex(recipe => recipe.id === id);
      if (index === -1) {
        throw new Error(`Рецепт с id ${id} не найден`);
      }

      const updatedRecipe = { 
        ...this.#recipes[index], 
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      
      console.log('🔄 Обновление рецепта на сервере:', updatedRecipe.title);
      const result = await this.#recipesApiService.updateRecipe(id, updatedRecipe);
      
      this.#recipes[index] = result;
      this._notify('UPDATE', result);
      console.log('✅ Рецепт обновлен на сервере:', result.title);
      
      return result;
    } catch (err) {
      console.error('❌ Ошибка при обновлении рецепта:', err);
      throw err;
    }
  }

  // Удалить рецепт через API
  async deleteRecipe(id) {
    try {
      const recipe = this.#recipes.find(r => r.id === id);
      if (!recipe) {
        throw new Error(`Рецепт с id ${id} не найден`);
      }

      console.log('🔄 Удаление рецепта с сервера:', recipe.title);
      await this.#recipesApiService.deleteRecipe(id);
      
      this.#recipes = this.#recipes.filter(recipe => recipe.id !== id);
      this._notify('DELETE', { id });
      console.log('✅ Рецепт удален с сервера:', recipe.title);
      
      return recipe;
    } catch (err) {
      console.error('❌ Ошибка при удалении рецепта:', err);
      throw err;
    }
  }

  // Drag & Drop (только локально)
  reorderRecipes(sourceIndex, targetIndex) {
    if (sourceIndex === targetIndex) return;
    
    const [movedRecipe] = this.#recipes.splice(sourceIndex, 1);
    this.#recipes.splice(targetIndex, 0, movedRecipe);
    this._notify('REORDER');
    console.log('🔀 Рецепты переупорядочены локально');
  }

  // Фильтрация
  filterRecipes(filters = {}) {
    let filteredRecipes = [...this.#recipes];

    // Filter by cuisine
    if (filters.cuisine && filters.cuisine !== '') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const recipeCuisine = this.#extractCuisineName(recipe.cuisine);
        const filterCuisine = this.#extractCuisineName(filters.cuisine);
        return recipeCuisine === filterCuisine;
      });
    }

    // Filter by search text
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = filters.search.toLowerCase().trim();
      filteredRecipes = filteredRecipes.filter(recipe => {
        return recipe.title.toLowerCase().includes(searchTerm) ||
               recipe.description.toLowerCase().includes(searchTerm) ||
               (recipe.tags && recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
      });
    }

    // Filter by cooking time
    if (filters.time && filters.time !== '') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        const timeMinutes = this.#extractTimeMinutes(recipe.time);
        
        switch (filters.time) {
          case 'fast':
            return timeMinutes <= 20;
          case 'short':
            return timeMinutes <= 30;
          case 'medium':
            return timeMinutes <= 60;
          case 'long':
            return timeMinutes > 60;
          default:
            return true;
        }
      });
    }

    // Filter by difficulty
    if (filters.difficulty && filters.difficulty !== '') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        return recipe.difficultyLevel === filters.difficulty;
      });
    }

    // Filter by category
    if (filters.category && filters.category !== '') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        return recipe.category === filters.category || 
               (recipe.tags && recipe.tags.includes(filters.category));
      });
    }

    // Filter by rating
    if (filters.rating && filters.rating !== '') {
      const minRating = parseFloat(filters.rating);
      filteredRecipes = filteredRecipes.filter(recipe => {
        const recipeRating = parseFloat(recipe.rating) || 0;
        return recipeRating >= minRating;
      });
    }

    // Filter by tags
    if (filters.tags && filters.tags !== '') {
      filteredRecipes = filteredRecipes.filter(recipe => {
        return recipe.tags && recipe.tags.some(tag => tag === filters.tags);
      });
    }

    return filteredRecipes;
  }

  #extractCuisineName(cuisineString) {
    if (!cuisineString) return '';
    return cuisineString.replace(/[🇷🇺🇮🇹🇫🇷🇨🇳🇯🇵🇲🇽🇹🇭🇺🇸🇪🇸🇭🇺🇮🇱🇱🇧🇰🇷🇨🇺🇬🇷🇮🇳🇻🇳]/g, '').trim();
  }

  #extractTimeMinutes(timeString) {
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

  addObserver(observer) {
    this.#observers.push(observer);
    console.log('👀 Observer added to RecipeModel');
  }

  removeObserver(observer) {
    this.#observers = this.#observers.filter(obs => obs !== observer);
    console.log('👋 Observer removed from RecipeModel');
  }

  _notify(event, payload) {
    console.log(`🔔 Notifying observers: ${event}`, payload);
    this.#observers.forEach(observer => {
      if (typeof observer === 'function') {
        observer(event, payload);
      }
    });
  }
}