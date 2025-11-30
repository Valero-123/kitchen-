import { AbstractComponent } from './abstract-component.js';

function createRecipeComponentTemplate(recipe) {
  const { id, title, time, difficulty, rating, description, tags, badge } = recipe;
  
  return `
    <div class="popular-card" data-recipe-id="${id}">
      ${badge ? `<div class="card-badge ${badge === 'Тренд' ? 'trending' : ''}">${badge}</div>` : ''}
      <div class="card-content">
        <h3 class="card-title">${title}</h3>
        <div class="card-meta">
          <span class="meta-item">⏱️ ${time}</span>
          <span class="meta-item">${difficulty}</span>
          <span class="meta-item">⭐ ${rating}</span>
        </div>
        <p class="card-description">${description}</p>
        <div class="card-tags">
          ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <div class="card-btn">
          <button class="change">📝 Редактировать</button>
          <button class="delete">🗑️ Удалить</button>
        </div>
      </div>
    </div>
  `;
}

export default class RecipeComponent extends AbstractComponent {
  constructor(recipe) {
    super();
    this.recipe = recipe;
  }

  get template() {
    return createRecipeComponentTemplate(this.recipe);
  }
}