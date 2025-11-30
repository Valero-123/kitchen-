import HeaderComponent from './view/header-component.js';
import FormAddRecipeComponent from './view/form-add-recipe-component.js';
import RecipesBoardPresenter from './presenter/recipes-board-presenter.js';
import RecipeModel from './model/recipe-model.js';
import { render, RenderPosition } from './framework/render.js';

// Initialize application
const bodyContainer = document.querySelector('.board-app');
const mainContainer = document.querySelector('.container');

// Render header
const headerComponent = new HeaderComponent();
render(headerComponent, bodyContainer, RenderPosition.BEFOREBEGIN);

// Render form and filters
const formAddRecipeComponent = new FormAddRecipeComponent();
const heroSection = document.querySelector('.hero-section');
render(formAddRecipeComponent, heroSection, RenderPosition.AFTEREND);

// Remove existing static content
const existingPopularSection = document.querySelector('.popular-section');
if (existingPopularSection) {
  existingPopularSection.remove();
}

const existingFeatures = document.querySelector('.features-section');
const existingSubscription = document.querySelector('.subscription');

// Create board container
const boardContainer = document.createElement('div');
mainContainer.insertBefore(boardContainer, existingFeatures);

// Initialize model and presenter
const recipeModel = new RecipeModel();
const recipesBoardPresenter = new RecipesBoardPresenter(recipeModel, boardContainer);
recipesBoardPresenter.init();

// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const themeText = themeToggle.querySelector('.theme-text');

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-theme');
  updateThemeButton('dark');
}

themeToggle.addEventListener('click', function() {
  document.body.classList.toggle('dark-theme');
  
  if (document.body.classList.contains('dark-theme')) {
    localStorage.setItem('theme', 'dark');
    updateThemeButton('dark');
  } else {
    localStorage.setItem('theme', 'light');
    updateThemeButton('light');
  }
});

function updateThemeButton(theme) {
  if (theme === 'dark') {
    themeIcon.textContent = '☀️';
    themeText.textContent = 'Светлая тема';
  } else {
    themeIcon.textContent = '🌙';
    themeText.textContent = 'Темная тема';
  }
}

// Subscription form
document.getElementById('subscribe-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const email = this.querySelector('.email-input').value;
  alert(`Спасибо за подписку! На адрес ${email} будут приходить новые рецепты.`);
  this.reset();
});