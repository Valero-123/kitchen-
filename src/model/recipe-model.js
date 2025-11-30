import { mockRecipes } from '../mock/recipe.js';

export default class RecipeModel {
  #recipes = [...mockRecipes];

  get recipes() {
    return this.#recipes;
  }

  addRecipe(recipeData) {
    const newRecipe = {
      id: generateId(),
      ...recipeData,
      rating: "4.5",
      badge: "Новинка"
    };
    
    this.#recipes.push(newRecipe);
    this._notify();
  }

  updateRecipe(id, updatedData) {
    const index = this.#recipes.findIndex(recipe => recipe.id === id);
    if (index !== -1) {
      this.#recipes[index] = { ...this.#recipes[index], ...updatedData };
      this._notify();
    }
  }

  deleteRecipe(id) {
    this.#recipes = this.#recipes.filter(recipe => recipe.id !== id);
    this._notify();
  }

  filterRecipes(filters = {}) {
    let filtered = [...this.#recipes];

    if (filters.cuisine && filters.cuisine !== 'Выберите кухню') {
      filtered = filtered.filter(recipe => recipe.cuisine === filters.cuisine);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm) ||
        recipe.description.toLowerCase().includes(searchTerm) ||
        recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    return filtered;
  }

  // Observer pattern implementation
  #observers = [];

  addObserver(observer) {
    this.#observers.push(observer);
  }

  removeObserver(observer) {
    this.#observers = this.#observers.filter(obs => obs !== observer);
  }

  _notify() {
    this.#observers.forEach(observer => observer());
  }
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}