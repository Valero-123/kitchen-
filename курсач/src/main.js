import HeaderComponent from './view/header-component.js';
import FormAddRecipeComponent from './view/form-add-recipe-component.js';
import RecipesBoardPresenter from './presenter/recipes-board-presenter.js';
import RecipeModel from './model/recipe-model.js';
import { render, RenderPosition } from './framework/render.js';

// Initialize application
const bodyContainer = document.querySelector('body');
const mainContainer = document.querySelector('.container');

// Remove existing static content that will be replaced by components
const existingHeader = document.querySelector('header');
if (existingHeader) {
    existingHeader.remove();
}

const existingFilters = document.querySelector('.filters');
if (existingFilters) {
    existingFilters.remove();
}

const existingSearch = document.querySelector('.search-section');
if (existingSearch) {
    existingSearch.remove();
}

const existingPopularSection = document.querySelector('.popular-section');
if (existingPopularSection) {
    existingPopularSection.remove();
}

const existingAddButton = document.querySelector('.more-link');
if (existingAddButton) {
    existingAddButton.remove();
}

// Render header
const headerComponent = new HeaderComponent();
render(headerComponent, bodyContainer, RenderPosition.AFTERBEGIN);

// Find the container for recipe board (after hero section)
const heroSection = document.querySelector('.hero-section');
const boardContainer = document.createElement('div');
boardContainer.className = 'recipe-board-container';
heroSection.parentNode.insertBefore(boardContainer, heroSection.nextSibling);

// Initialize model and presenter
const recipeModel = new RecipeModel();
const recipesBoardPresenter = new RecipesBoardPresenter(recipeModel, boardContainer);
recipesBoardPresenter.init();

// Theme toggle functionality
document.addEventListener('click', function(event) {
    if (event.target.closest('#themeToggle')) {
        const themeToggle = event.target.closest('#themeToggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');
        
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Светлая тема';
        } else {
            localStorage.setItem('theme', 'light');
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Темная тема';
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
        themeIcon.textContent = '☀️';
        themeText.textContent = 'Светлая тема';
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