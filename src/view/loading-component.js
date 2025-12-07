import { AbstractComponent } from '../framework/view/abstract-component.js';

function createLoadingComponentTemplate() {
  return `
    <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Загрузка рецептов с сервера...</p>
    </div>
  `;
}

export default class LoadingComponent extends AbstractComponent {
  getTemplate() {
    return createLoadingComponentTemplate();
  }
}