import { mockRecipes } from '../mock/recipe.js';

export default class RecipeModel {
    #recipes = [...mockRecipes];
    #observers = [];

    get recipes() {
        return this.#recipes;
    }

    addRecipe(recipeData) {
        const newRecipe = {
            id: this.#generateId(),
            title: recipeData.title,
            time: recipeData.time,
            difficulty: recipeData.difficulty,
            rating: "4.5",
            description: recipeData.description,
            tags: recipeData.tags,
            badge: "Новинка",
            cuisine: recipeData.cuisine,
            cookingTime: recipeData.cookingTime,
            difficultyLevel: recipeData.difficultyLevel
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
        let filteredRecipes = [...this.#recipes];

        // Filter by cuisine
        if (filters.cuisine && filters.cuisine !== 'Выберите кухню' && filters.cuisine !== 'Любая кухня') {
            filteredRecipes = filteredRecipes.filter(recipe => {
                return recipe.cuisine && recipe.cuisine.toLowerCase().includes(filters.cuisine.toLowerCase().replace(/[🇷🇺🇮🇹🇫🇷🇨🇳🇯🇵🇲🇽]/g, '').trim());
            });
        }

        // Filter by search text
        if (filters.search && filters.search.trim() !== '') {
            const searchTerm = filters.search.toLowerCase().trim();
            filteredRecipes = filteredRecipes.filter(recipe => {
                return recipe.title.toLowerCase().includes(searchTerm) ||
                       recipe.description.toLowerCase().includes(searchTerm) ||
                       recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            });
        }

        // Filter by cooking time
        if (filters.time && filters.time !== 'Любое время') {
            filteredRecipes = filteredRecipes.filter(recipe => {
                if (filters.time === 'До 30 минут') {
                    return recipe.time.includes('25 мин') || recipe.time.includes('20 мин') || recipe.time.includes('30 мин');
                } else if (filters.time === 'До 1 часа') {
                    return recipe.time.includes('35 мин') || recipe.time.includes('40 мин') || recipe.time.includes('45 мин') || recipe.time.includes('50 мин') || recipe.time.includes('55 мин');
                } else if (filters.time === 'Более 1 часа') {
                    return recipe.time.includes('1 ч') || recipe.time.includes('90 мин') || recipe.time.includes('2 ч');
                }
                return true;
            });
        }

        // Filter by difficulty
        if (filters.difficulty && filters.difficulty !== 'Любая сложность') {
            filteredRecipes = filteredRecipes.filter(recipe => {
                if (filters.difficulty === 'Начинающий' || filters.difficulty === '👶 Начинающий') {
                    return recipe.difficulty.includes('Начинающий') || recipe.difficulty.includes('👶');
                } else if (filters.difficulty === 'Любитель' || filters.difficulty === '👨‍🍳 Любитель') {
                    return recipe.difficulty.includes('Средне') || recipe.difficulty.includes('👨‍🍳');
                } else if (filters.difficulty === 'Профессионал' || filters.difficulty === '🧑‍🍳 Профессионал') {
                    return recipe.difficulty.includes('Сложно') || recipe.difficulty.includes('🧑‍🍳');
                }
                return true;
            });
        }

        return filteredRecipes;
    }

    // Observer pattern implementation
    addObserver(observer) {
        this.#observers.push(observer);
    }

    removeObserver(observer) {
        this.#observers = this.#observers.filter(obs => obs !== observer);
    }

    _notify() {
        this.#observers.forEach(observer => {
            if (typeof observer === 'function') {
                observer();
            }
        });
    }

    #generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
}