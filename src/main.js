import HeaderComponent from './view/header-component.js';
import FormAddRecipeComponent from './view/form-add-recipe-component.js';
import RecipesBoardPresenter from './presenter/recipes-board-presenter.js';
import RecipeModel from './model/recipe-model.js';
import { render, RenderPosition } from './framework/render.js';

class FlavorHubApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Initializing FlavorHub application...');

        this.bodyContainer = document.body;
        this.recipeBoardContainer = document.getElementById('recipeBoardContainer');

        console.log('🔍 Recipe board container:', this.recipeBoardContainer);

        if (!this.recipeBoardContainer) {
            console.error('❌ Recipe board container not found! Creating fallback...');
            this.createFallbackContainer();
            return;
        }

        this.removeStaticContent();
        this.renderHeader();
        this.initRecipeBoard();
        this.initSubscriptionForm();
        
        console.log('✅ FlavorHub application initialized successfully');
    }

    createFallbackContainer() {
        // Создаем контейнер, если он не найден
        this.recipeBoardContainer = document.createElement('div');
        this.recipeBoardContainer.id = 'recipeBoardContainer';
        this.recipeBoardContainer.className = 'recipe-board-container';
        
        const mainContainer = document.querySelector('.container');
        const heroSection = document.querySelector('.hero-section');
        
        if (mainContainer && heroSection) {
            mainContainer.insertBefore(this.recipeBoardContainer, heroSection.nextSibling);
            console.log('✅ Fallback container created');
            
            // Перезапускаем инициализацию
            this.removeStaticContent();
            this.renderHeader();
            this.initRecipeBoard();
            this.initSubscriptionForm();
        } else {
            console.error('❌ Cannot create fallback container - main container not found');
        }
    }

    removeStaticContent() {
        const elementsToRemove = ['header', '.filters', '.search-section', '.popular-section', '.more-link'];
        
        elementsToRemove.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.remove();
                console.log(`🗑️ Removed: ${selector}`);
            }
        });
    }

    renderHeader() {
        try {
            console.log('🔍 Rendering header...');
            const headerComponent = new HeaderComponent();
            render(headerComponent, this.bodyContainer, RenderPosition.AFTERBEGIN);
            this.initThemeToggle();
            console.log('✅ Header rendered successfully');
        } catch (error) {
            console.error('❌ Error rendering header:', error);
        }
    }

    initThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) {
            console.warn('⚠️ Theme toggle button not found');
            return;
        }

        const themeIcon = themeToggle.querySelector('.theme-icon');
        const themeText = themeToggle.querySelector('.theme-text');

        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            this.updateThemeButton('dark', themeIcon, themeText);
        }

        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            this.updateThemeButton(isDark ? 'dark' : 'light', themeIcon, themeText);
        });
        
        console.log('✅ Theme toggle initialized');
    }

    updateThemeButton(theme, themeIcon, themeText) {
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
            themeText.textContent = 'Светлая тема';
        } else {
            themeIcon.textContent = '🌙';
            themeText.textContent = 'Темная тема';
        }
    }

    initRecipeBoard() {
        try {
            console.log('🔍 Initializing recipe board...');
            const recipeModel = new RecipeModel();
            const recipesBoardPresenter = new RecipesBoardPresenter(recipeModel, this.recipeBoardContainer);
            recipesBoardPresenter.init();
            console.log('✅ Recipe board initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing recipe board:', error);
        }
    }

    initSubscriptionForm() {
        const subscribeForm = document.getElementById('subscribe-form');
        if (subscribeForm) {
            subscribeForm.addEventListener('submit', (event) => {
                event.preventDefault();
                const emailInput = event.target.querySelector('.email-input');
                const email = emailInput.value;
                
                if (email && email.includes('@')) {
                    alert(`Спасибо за подписку! На адрес ${email} будут приходить новые рецепты.`);
                    event.target.reset();
                } else {
                    alert('Пожалуйста, введите корректный email адрес.');
                }
            });
            console.log('✅ Subscription form initialized');
        } else {
            console.warn('⚠️ Subscription form not found');
        }
    }
}

// Ожидаем полной загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM fully loaded, starting app...');
        new FlavorHubApp();
    });
} else {
    console.log('📄 DOM already loaded, starting app...');
    new FlavorHubApp();
}