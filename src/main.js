import HeaderComponent from './view/header-component.js';
import FormAddRecipeComponent from './view/form-add-recipe-component.js';
import RecipesBoardPresenter from './presenter/recipes-board-presenter.js';
import RecipeModel from './model/recipe-model.js';
import { render, RenderPosition } from './framework/render.js';

// Initialize application
console.log('Initializing FlavorHub application...');

const bodyContainer = document.querySelector('body');
const mainContainer = document.querySelector('.container');
const recipeBoardContainer = document.getElementById('recipeBoardContainer');

// Check if required elements exist
if (!bodyContainer) {
  console.error('Body container not found!');
}

if (!mainContainer) {
  console.error('Main container not found!');
}

if (!recipeBoardContainer) {
  console.error('Recipe board container not found!');
}

// Remove existing header if present
const existingHeader = document.querySelector('header');
if (existingHeader) {
  existingHeader.remove();
  console.log('Existing header removed');
}

// Render header
console.log('Rendering header component...');
const headerComponent = new HeaderComponent();

// Check if header component has getElement method
if (headerComponent && typeof headerComponent.getElement === 'function') {
  render(headerComponent, bodyContainer, RenderPosition.AFTERBEGIN);
  console.log('Header component rendered successfully');
} else {
  console.error('Header component is not valid:', headerComponent);
}

// Initialize model and presenter
console.log('Initializing recipe model and presenter...');
const recipeModel = new RecipeModel();
const recipesBoardPresenter = new RecipesBoardPresenter(recipeModel, recipeBoardContainer);
recipesBoardPresenter.init();
console.log('Recipe board presenter initialized');

// Theme toggle functionality with event delegation
document.addEventListener('click', function(event) {
  if (event.target.closest('#themeToggle')) {
    const themeToggle = event.target.closest('#themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    
    document.body.classList.toggle('dark-theme');
    
    if (document.body.classList.contains('dark-theme')) {
      localStorage.setItem('theme', 'dark');
      if (themeIcon) themeIcon.textContent = '☀️';
      if (themeText) themeText.textContent = 'Светлая тема';
    } else {
      localStorage.setItem('theme', 'light');
      if (themeIcon) themeIcon.textContent = '🌙';
      if (themeText) themeText.textContent = 'Темная тема';
    }
  }
});

// Check saved theme on load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
  const themeToggle = document.querySelector('#themeToggle');
  if (themeToggle) {
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    if (themeIcon) themeIcon.textContent = '☀️';
    if (themeText) themeText.textContent = 'Светлая тема';
  }
}

// Subscription form
const subscribeForm = document.getElementById('subscribe-form');
if (subscribeForm) {
  subscribeForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const emailInput = this.querySelector('.email-input');
    const email = emailInput.value;
    alert(`Спасибо за подписку! На адрес ${email} будут приходить новые рецепты.`);
    this.reset();
  });
}

// Add CSS for dynamically created elements
const style = document.createElement('style');
style.textContent = `
  .recipe-board-container {
    width: 100%;
    margin: 2rem 0;
  }
  
  .recipe-board-container .search-section {
    display: flex;
    gap: 1rem;
    margin: 2rem auto;
    max-width: 600px;
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 20px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow-lg);
  }
  
  .recipe-board-container .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin: 3rem 0;
  }
  
  .recipe-board-container .popular-section {
    margin: 4rem 0;
  }
  
  .recipe-board-container .more-link {
    display: block;
    width: 100%;
    max-width: 320px;
    margin: 2rem auto;
    background: var(--gradient-primary);
    color: white;
    border: none;
    padding: 1.3rem 2.5rem;
    border-radius: 16px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 1px;
    position: relative;
    overflow: hidden;
  }
  
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    background: var(--surface);
    border-radius: 20px;
    border: 2px dashed var(--border);
    margin: 2rem 0;
  }
  
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.7;
  }
  
  .empty-state h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-weight: 600;
  }
  
  .empty-state p {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.5;
  }
`;
document.head.appendChild(style);

console.log('FlavorHub application initialized successfully');