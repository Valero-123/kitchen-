import { AbstractComponent } from '../framework/view/abstract-component.js';

function createFormAddRecipeComponentTemplate() {
  return `
    <div class="search-section">
      <input type="text" class="search-input" placeholder="🔍 Поиск рецептов по названию, ингредиентам...">
      <button class="search-btn" type="button">Найти</button>
      <button class="add-recipe-main-btn" type="button">
        <span class="add-recipe-icon">+</span>
        Добавить рецепт
      </button>
    </div>
  `;
}

export default class FormAddRecipeComponent extends AbstractComponent {
  getTemplate() {
    return createFormAddRecipeComponentTemplate();
  }
}