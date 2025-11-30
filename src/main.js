import HeaderComponent from './view/header-component.js';
import FormAddRecipeComponent from './view/form-add-recipe-component.js';
import RecipesBoardPresenter from './presenter/recipes-board-presenter.js';
import RecipeModel from './model/recipe-model.js';
import { render, RenderPosition } from './framework/render.js';

// Initialize application
console.log('🚀 Initializing FlavorHub application...');

const bodyContainer = document.querySelector('body');
const mainContainer = document.querySelector('.container');
const recipeBoardContainer = document.getElementById('recipeBoardContainer');

// Check if required elements exist
if (!bodyContainer) {
    console.error('❌ Body container not found!');
}

if (!mainContainer) {
    console.error('❌ Main container not found!');
}

if (!recipeBoardContainer) {
    console.error('❌ Recipe board container not found!');
} else {
    console.log('✅ Recipe board container found');
}

// Remove existing static content that will be replaced by components
console.log('🗑️ Removing static content...');

const elementsToRemove = [
    { selector: 'header', name: 'header' },
    { selector: '.filters', name: 'filters' },
    { selector: '.search-section', name: 'search section' },
    { selector: '.popular-section', name: 'popular section' },
    { selector: '.more-link', name: 'add recipe button' }
];

elementsToRemove.forEach(({ selector, name }) => {
    const element = document.querySelector(selector);
    if (element) {
        element.remove();
        console.log(`✅ Removed static ${name}`);
    } else {
        console.log(`⚠️ Static ${name} not found (already removed or doesn't exist)`);
    }
});

// Render header
console.log('👤 Rendering header component...');
try {
    const headerComponent = new HeaderComponent();
    
    if (headerComponent && typeof headerComponent.getElement === 'function') {
        render(headerComponent, bodyContainer, RenderPosition.AFTERBEGIN);
        console.log('✅ Header component rendered successfully');
        
        // Add theme toggle functionality to the dynamically created header
        setTimeout(() => {
            initializeThemeToggle();
        }, 100);
    } else {
        console.error('❌ Header component is not valid');
    }
} catch (error) {
    console.error('❌ Error rendering header:', error);
}

// Initialize model and presenter
console.log('🍳 Initializing recipe model and presenter...');
try {
    const recipeModel = new RecipeModel();
    console.log(`✅ Recipe model initialized with ${recipeModel.recipes.length} recipes`);
    
    const recipesBoardPresenter = new RecipesBoardPresenter(recipeModel, recipeBoardContainer);
    recipesBoardPresenter.init();
    console.log('✅ Recipe board presenter initialized');
} catch (error) {
    console.error('❌ Error initializing presenter:', error);
}

// Theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.log('⚠️ Theme toggle button not found');
        return;
    }

    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');

    // Check saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        updateThemeButton('dark', themeIcon, themeText);
    }

    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            localStorage.setItem('theme', 'dark');
            updateThemeButton('dark', themeIcon, themeText);
        } else {
            localStorage.setItem('theme', 'light');
            updateThemeButton('light', themeIcon, themeText);
        }
    });

    console.log('✅ Theme toggle initialized');
}

function updateThemeButton(theme, themeIcon, themeText) {
    if (theme === 'dark') {
        if (themeIcon) themeIcon.textContent = '☀️';
        if (themeText) themeText.textContent = 'Светлая тема';
    } else {
        if (themeIcon) themeIcon.textContent = '🌙';
        if (themeText) themeText.textContent = 'Темная тема';
    }
}

// Subscription form
const subscribeForm = document.getElementById('subscribe-form');
if (subscribeForm) {
    subscribeForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const emailInput = this.querySelector('.email-input');
        const email = emailInput.value;
        
        if (email && email.includes('@')) {
            alert(`Спасибо за подписку! На адрес ${email} будут приходить новые рецепты.`);
            this.reset();
        } else {
            alert('Пожалуйста, введите корректный email адрес.');
        }
    });
    console.log('✅ Subscription form initialized');
} else {
    console.log('⚠️ Subscription form not found');
}

// Add dynamic CSS for components
console.log('🎨 Adding dynamic CSS...');
const dynamicStyles = `
    .recipe-board-container {
        width: 100%;
        margin: 2rem 0;
        transition: all 0.3s ease;
    }
    
    .recipe-board-container .search-section {
        display: flex;
        gap: 1rem;
        margin: 2rem auto;
        max-width: 800px;
        background: var(--surface);
        padding: 1.5rem;
        border-radius: 20px;
        border: 1px solid var(--border);
        box-shadow: var(--shadow-lg);
        align-items: center;
        flex-wrap: wrap;
    }
    
    .recipe-board-container .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.5rem;
        margin: 2rem 0;
    }
    
    .recipe-board-container .filter-section {
        background: var(--surface);
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid var(--border);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-md);
    }
    
    .recipe-board-container .filter-section:hover {
        transform: translateY(-5px);
        border-color: var(--primary-light);
        box-shadow: var(--shadow-xl);
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
    
    .recipe-board-container .more-link:hover {
        transform: translateY(-3px) scale(1.02);
        box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4);
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
    
    .active-filters {
        background: var(--surface-light);
        padding: 1.5rem;
        border-radius: 16px;
        border: 1px solid var(--border);
        margin: 1.5rem 0;
    }
    
    .active-filters-title {
        font-weight: 600;
        margin-bottom: 0.8rem;
        color: var(--text-primary);
        font-size: 1.1rem;
    }
    
    .active-filters-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }
    
    .filter-chip {
        display: inline-flex;
        align-items: center;
        background: var(--gradient-primary);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .filter-chip:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }
    
    .remove-filter {
        margin-left: 0.5rem;
        cursor: pointer;
        font-weight: bold;
        opacity: 0.8;
        transition: opacity 0.3s ease;
    }
    
    .remove-filter:hover {
        opacity: 1;
    }
    
    .results-counter {
        text-align: center;
        margin: 1rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    @media (max-width: 768px) {
        .recipe-board-container .filters-grid {
            grid-template-columns: 1fr;
        }
        
        .recipe-board-container .search-section {
            flex-direction: column;
        }
        
        .recipe-board-container .more-link {
            max-width: 100%;
        }
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = dynamicStyles;
document.head.appendChild(styleElement);
console.log('✅ Dynamic CSS added');

console.log('🎉 FlavorHub application initialized successfully!');