import { AbstractComponent } from './abstract-component.js';

function createFormAddRecipeComponentTemplate() {
  return `
    <div class="search-section">
      <input type="text" class="search-input" placeholder="🔍 Поиск рецептов...">
      <button class="search-btn">Найти</button>
    </div>
    <div class="filters">
      <div class="filter-section">
        <div class="filter-title">🍳 КУХНЯ МИРА</div>
        <select class="dropdown" id="cuisineFilter">
          <option>Выберите кухню</option>
          <option>🇷🇺 Русская</option>
          <option>🇮🇹 Итальянская</option>
          <option>🇫🇷 Французская</option>
          <option>🇨🇳 Китайская</option>
          <option>🇯🇵 Японская</option>
          <option>🇲🇽 Мексиканская</option>
        </select>
      </div>

      <div class="filter-section">
        <div class="filter-title">⏱️ ВРЕМЯ ПРИГОТОВЛЕНИЯ</div>
        <select class="dropdown" id="timeFilter">
          <option>Любое время</option>
          <option>До 30 минут</option>
          <option>До 1 часа</option>
          <option>Более 1 часа</option>
        </select>
      </div>

      <div class="filter-section">
        <div class="filter-title">📊 СЛОЖНОСТЬ</div>
        <select class="dropdown" id="difficultyFilter">
          <option>Любая сложность</option>
          <option>👶 Начинающий</option>
          <option>👨‍🍳 Любитель</option>
          <option>🧑‍🍳 Профессионал</option>
        </select>
      </div>
    </div>
    <button class="more-link">+ Добавить новый рецепт</button>
  `;
}

export default class FormAddRecipeComponent extends AbstractComponent {
  get template() {
    return createFormAddRecipeComponentTemplate();
  }
}