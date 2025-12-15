import FormAddRecipeComponent from '../view/form-add-recipe-component.js';
import RecipeListComponent from '../view/recipe-list-component.js';
import RecipeComponent from '../view/recipe-component.js';
import EmptyComponent from '../view/empty-component.js';
import LoadingComponent from '../view/loading-component.js';
import { render } from '../framework/render.js';

export default class RecipesBoardPresenter {
  #recipeModel = null;
  #boardContainer = null;
  #formAddRecipeComponent = null;
  #recipeListComponent = null;
  #loadingComponent = null;
  #currentSearch = '';
  #dragSourceIndex = null;
  #isLoading = false;

  constructor(recipeModel, boardContainer) {
    this.#recipeModel = recipeModel;
    this.#boardContainer = boardContainer;
    this.#formAddRecipeComponent = new FormAddRecipeComponent();
    this.#recipeListComponent = new RecipeListComponent();
    this.#loadingComponent = new LoadingComponent();
    this.#recipeModel.addObserver(this.#handleModelChange.bind(this));
  }

  async init() {
    console.log('🔍 Starting board presenter initialization...');
    
    // Сразу рендерим компоненты (как в изначальном коде)
    this.#renderBoard();
    
    // Потом в фоне загружаем данные с сервера
    this.#loadRecipesFromServer();
    
    console.log('✅ Board presenter initialized successfully');
  }

  async #loadRecipesFromServer() {
    try {
      console.log('🔄 Загрузка рецептов с сервера...');
      await this.#recipeModel.init();
      console.log('✅ Рецепты загружены с сервера');
      
      // Обновляем отображение после загрузки
      this.#renderRecipes();
    } catch (error) {
      console.error('❌ Ошибка загрузки рецептов с сервера:', error);
      // Если сервер недоступен, показываем то, что уже есть
      this.#renderRecipes();
    }
  }

  #renderBoard() {
    console.log('🔍 Rendering board components...');
    
    // Очищаем контейнер
    this.#boardContainer.innerHTML = '';
    
    // Рендерим компоненты (поиск и список рецептов)
    render(this.#formAddRecipeComponent, this.#boardContainer);
    render(this.#recipeListComponent, this.#boardContainer);
    
    console.log('✅ Board components rendered');
    
    // Сразу рендерим рецепты (даже если они еще не загружены с сервера)
    this.#renderRecipes();
    this.#setupEventListeners();
  }

  #renderRecipes() {
    console.log('🔄 Rendering recipes...');
    
    const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
    
    if (!recipesContainer) {
      console.error('❌ Recipes container not found!');
      return;
    }
    
    // Очищаем контейнер
    recipesContainer.innerHTML = '';

    // Получаем рецепты (могут быть пустыми, если еще не загрузились)
    const filteredRecipes = this.#recipeModel.filterRecipes(this.#currentSearch);

    console.log(`🔍 Found ${filteredRecipes.length} recipes to render`);

    // Если рецептов нет - показываем пустое состояние
    if (filteredRecipes.length === 0) {
      console.log('🔍 No recipes found, showing empty state');
      const emptyComponent = new EmptyComponent();
      render(emptyComponent, recipesContainer);
      return;
    }

    // Рендерим рецепты
    filteredRecipes.forEach((recipe, index) => {
      console.log(`🎨 Rendering recipe ${index + 1}:`, recipe.title);
      const recipeComponent = new RecipeComponent(recipe);
      render(recipeComponent, recipesContainer);
    });

    console.log(`✅ Rendered ${filteredRecipes.length} recipes`);
    
    // Настраиваем обработчики для рецептов
    this.#setupRecipeEventListeners();
    this.#setupDragAndDrop();
  }

  // Drag & Drop Implementation
  #setupDragAndDrop() {
    const recipesContainer = this.#boardContainer.querySelector('#recipesContainer');
    if (!recipesContainer) return;

    const draggableRecipes = recipesContainer.querySelectorAll('.draggable-recipe');
    
    draggableRecipes.forEach((recipe, index) => {
      // Drag Start
      recipe.addEventListener('dragstart', (e) => {
        this.#dragSourceIndex = index;
        recipe.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index);
      });

      // Drag End
      recipe.addEventListener('dragend', () => {
        recipe.classList.remove('dragging');
        draggableRecipes.forEach(r => r.classList.remove('drag-over'));
        this.#dragSourceIndex = null;
      });

      // Drag Over
      recipe.addEventListener('dragover', (e) => {
        e.preventDefault();
        recipe.classList.add('drag-over');
      });

      // Drag Leave
      recipe.addEventListener('dragleave', () => {
        recipe.classList.remove('drag-over');
      });

      // Drop
      recipe.addEventListener('drop', (e) => {
        e.preventDefault();
        recipe.classList.remove('drag-over');
        
        const sourceIndex = this.#dragSourceIndex;
        const targetIndex = index;
        
        if (sourceIndex !== null && sourceIndex !== targetIndex) {
          this.#recipeModel.reorderRecipes(sourceIndex, targetIndex);
        }
      });
    });

    // Drop zone для всего контейнера
    recipesContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      recipesContainer.classList.add('drop-zone-active');
    });

    recipesContainer.addEventListener('dragleave', () => {
      recipesContainer.classList.remove('drop-zone-active');
    });

    recipesContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      recipesContainer.classList.remove('drop-zone-active');
    });
  }

  #setupEventListeners() {
    console.log('🔍 Setting up event listeners...');
    
    const searchInput = this.#boardContainer.querySelector('.search-input');
    const searchBtn = this.#boardContainer.querySelector('.search-btn');
    const addRecipeMainBtn = this.#boardContainer.querySelector('.add-recipe-main-btn');

    // Поиск
    if (searchInput && searchBtn) {
      const performSearch = () => {
        this.#currentSearch = searchInput.value.trim();
        console.log('🔍 Performing search:', this.#currentSearch);
        this.#renderRecipes();
      };

      searchBtn.addEventListener('click', performSearch);
      searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          performSearch();
        }
      });

      searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
          this.#currentSearch = '';
          this.#renderRecipes();
        }
      });
      
      console.log('✅ Search listeners added');
    }

    // Кнопка добавления рецепта
    if (addRecipeMainBtn) {
      addRecipeMainBtn.addEventListener('click', () => {
        console.log('➕ Add recipe main button clicked');
        this.#handleAddRecipe();
      });
      console.log('✅ Add recipe main button listener added');
    } else {
      console.error('❌ Add recipe main button not found!');
    }

    console.log('✅ All event listeners set up');
  }

  #setupRecipeEventListeners() {
    this.#boardContainer.querySelectorAll('.change').forEach(button => {
      button.addEventListener('click', (event) => {
        const recipeCard = event.target.closest('.popular-card');
        if (recipeCard) {
          const recipeId = recipeCard.dataset.recipeId;
          if (recipeId) {
            this.#handleEditRecipe(recipeId);
          }
        }
      });
    });

    this.#boardContainer.querySelectorAll('.delete').forEach(button => {
      button.addEventListener('click', (event) => {
        const recipeCard = event.target.closest('.popular-card');
        if (recipeCard) {
          const recipeId = recipeCard.dataset.recipeId;
          if (recipeId) {
            this.#handleDeleteRecipe(recipeId);
          }
        }
      });
    });
  }

  #handleAddRecipe() {
    this.#showAddRecipeForm();
  }

  #showAddRecipeForm() {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    const form = document.createElement('div');
    form.className = 'edit-form';
    form.innerHTML = this.#createAddRecipeFormHTML();

    modal.appendChild(form);
    document.body.appendChild(modal);

    this.#setupAddRecipeFormListeners(modal, form);
  }

  #createAddRecipeFormHTML() {
    return `
      <h2>Добавить новый рецепт</h2>
      
      <div>
        <label class="required-field">Название рецепта</label>
        <input type="text" id="addTitle" placeholder="Введите название рецепта" required>
      </div>

      <div>
        <label>Описание</label>
        <textarea id="addDescription" placeholder="Опишите рецепт..."></textarea>
      </div>

      <div>
        <label class="required-field">Время приготовления</label>
        <input type="text" id="addTime" placeholder="Например: 30 мин" required>
        <div class="form-hint">Примеры: 15 мин, 30 мин, 1 ч, 1 ч 30 мин</div>
      </div>

      <div>
        <label class="required-field">Сложность</label>
        <select id="addDifficulty" required>
          <option value="">Выберите сложность</option>
          <option value="👶 Начинающий">👶 Начинающий</option>
          <option value="👨‍🍳 Любитель">👨‍🍳 Любитель</option>
          <option value="🧑‍🍳 Профессионал">🧑‍🍳 Профессионал</option>
        </select>
      </div>

      <div>
        <label class="required-field">Кухня</label>
        <select id="addCuisine" required>
          <option value="">Выберите кухню</option>
          <option value="🇷🇺 Русская">🇷🇺 Русская</option>
          <option value="🇮🇹 Итальянская">🇮🇹 Итальянская</option>
          <option value="🇫🇷 Французская">🇫🇷 Французская</option>
          <option value="🇨🇳 Китайская">🇨🇳 Китайская</option>
          <option value="🇯🇵 Японская">🇯🇵 Японская</option>
          <option value="🇲🇽 Мексиканская">🇲🇽 Мексиканская</option>
          <option value="🇬🇷 Греческая">🇬🇷 Греческая</option>
          <option value="🇮🇳 Индийская">🇮🇳 Индийская</option>
          <option value="🇻🇳 Вьетнамская">🇻🇳 Вьетнамская</option>
          <option value="🇪🇸 Испанская">🇪🇸 Испанская</option>
        </select>
      </div>

      <div>
        <label class="required-field">Тип блюда</label>
        <select id="addCategory" required>
          <option value="">Выберите тип блюда</option>
          <option value="Закуски">🥗 Закуски</option>
          <option value="Супы">🍲 Супы</option>
          <option value="Основные">🍛 Основные блюда</option>
          <option value="Десерты">🍰 Десерты</option>
          <option value="Завтраки">🥞 Завтраки</option>
          <option value="Напитки">🍹 Напитки</option>
          <option value="Салаты">🥙 Салаты</option>
          <option value="Выпечка">🥖 Выпечка</option>
        </select>
      </div>

      <div>
        <label>Теги (через запятую)</label>
        <input type="text" id="addTags" placeholder="Например: Быстро, Вегетарианские, Здоровые">
        <div class="form-hint">Необязательное поле</div>
      </div>

      <div class="edit-button-group">
        <button type="button" class="cancel-btn">Отмена</button>
        <button type="button" class="save-btn">Добавить рецепт</button>
      </div>
    `;
  }

  #setupAddRecipeFormListeners(modal, form) {
    const cancelBtn = form.querySelector('.cancel-btn');
    const saveBtn = form.querySelector('.save-btn');

    const closeModal = () => document.body.removeChild(modal);

    cancelBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', async () => {
      const title = form.querySelector('#addTitle').value.trim();
      const description = form.querySelector('#addDescription').value.trim();
      const time = form.querySelector('#addTime').value.trim();
      const difficulty = form.querySelector('#addDifficulty').value;
      const cuisine = form.querySelector('#addCuisine').value;
      const category = form.querySelector('#addCategory').value;
      const tagsInput = form.querySelector('#addTags').value.trim();

      if (!title) {
        alert('Название рецепта обязательно для заполнения!');
        form.querySelector('#addTitle').focus();
        return;
      }

      if (!time) {
        alert('Время приготовления обязательно для заполнения!');
        form.querySelector('#addTime').focus();
        return;
      }

      if (!difficulty) {
        alert('Выберите сложность рецепта!');
        form.querySelector('#addDifficulty').focus();
        return;
      }

      if (!cuisine) {
        alert('Выберите кухню рецепта!');
        form.querySelector('#addCuisine').focus();
        return;
      }

      if (!category) {
        alert('Выберите тип блюда!');
        form.querySelector('#addCategory').focus();
        return;
      }

      let difficultyLevel = 'medium';
      if (difficulty.includes('Начинающий')) difficultyLevel = 'easy';
      if (difficulty.includes('Профессионал')) difficultyLevel = 'hard';

      let cookingTime = 'medium';
      const timeMinutes = this.#extractTimeMinutes(time);
      if (timeMinutes <= 20) cookingTime = 'fast';
      else if (timeMinutes <= 30) cookingTime = 'short';
      else if (timeMinutes > 60) cookingTime = 'long';

      const newRecipe = {
        title,
        time,
        difficulty,
        description: description || `${title} - вкусный рецепт`,
        tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [category],
        cuisine,
        cookingTime,
        difficultyLevel,
        category
      };

      try {
        // Показываем индикатор загрузки при добавлении
        saveBtn.disabled = true;
        saveBtn.textContent = 'Добавляем...';
        
        await this.#recipeModel.addRecipe(newRecipe);
        
        alert(`Рецепт "${title}" успешно добавлен!`);
        closeModal();
      } catch (error) {
        console.error('❌ Error adding recipe:', error);
        alert('Ошибка при добавлении рецепта. Пожалуйста, попробуйте снова.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Добавить рецепт';
      }
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', function closeOnEscape(event) {
      if (event.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', closeOnEscape);
      }
    });

    form.querySelector('#addTitle').focus();
  }

  #showEditRecipeForm(recipe) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    
    const form = document.createElement('div');
    form.className = 'edit-form';
    form.innerHTML = this.#createEditRecipeFormHTML(recipe);

    modal.appendChild(form);
    document.body.appendChild(modal);

    this.#setupEditRecipeFormListeners(modal, form, recipe);
  }

  #createEditRecipeFormHTML(recipe) {
    return `
      <h2>Редактировать рецепт</h2>
      
      <div>
        <label class="required-field">Название рецепта</label>
        <input type="text" id="editTitle" value="${recipe.title || ''}" required>
      </div>

      <div>
        <label>Описание</label>
        <textarea id="editDescription">${recipe.description || ''}</textarea>
      </div>

      <div>
        <label class="required-field">Время приготовления</label>
        <input type="text" id="editTime" value="${recipe.time || ''}" required>
        <div class="form-hint">Примеры: 15 мин, 30 мин, 1 ч, 1 ч 30 мин</div>
      </div>

      <div>
        <label class="required-field">Сложность</label>
        <select id="editDifficulty" required>
          <option value="👶 Начинающий" ${recipe.difficulty && recipe.difficulty.includes('Начинающий') ? 'selected' : ''}>👶 Начинающий</option>
          <option value="👨‍🍳 Любитель" ${recipe.difficulty && recipe.difficulty.includes('Любитель') ? 'selected' : ''}>👨‍🍳 Любитель</option>
          <option value="🧑‍🍳 Профессионал" ${recipe.difficulty && recipe.difficulty.includes('Профессионал') ? 'selected' : ''}>🧑‍🍳 Профессионал</option>
        </select>
      </div>

      <div>
        <label class="required-field">Кухня</label>
        <select id="editCuisine" required>
          <option value="🇷🇺 Русская" ${recipe.cuisine && recipe.cuisine.includes('Русская') ? 'selected' : ''}>🇷🇺 Русская</option>
          <option value="🇮🇹 Итальянская" ${recipe.cuisine && recipe.cuisine.includes('Итальянская') ? 'selected' : ''}>🇮🇹 Итальянская</option>
          <option value="🇫🇷 Французская" ${recipe.cuisine && recipe.cuisine.includes('Французская') ? 'selected' : ''}>🇫🇷 Французская</option>
          <option value="🇨🇳 Китайская" ${recipe.cuisine && recipe.cuisine.includes('Китайская') ? 'selected' : ''}>🇨🇳 Китайская</option>
          <option value="🇯🇵 Японская" ${recipe.cuisine && recipe.cuisine.includes('Японская') ? 'selected' : ''}>🇯🇵 Японская</option>
          <option value="🇲🇽 Мексиканская" ${recipe.cuisine && recipe.cuisine.includes('Мексиканская') ? 'selected' : ''}>🇲🇽 Мексиканская</option>
          <option value="🇬🇷 Греческая" ${recipe.cuisine && recipe.cuisine.includes('Греческая') ? 'selected' : ''}>🇬🇷 Греческая</option>
          <option value="🇮🇳 Индийская" ${recipe.cuisine && recipe.cuisine.includes('Индийская') ? 'selected' : ''}>🇮🇳 Индийская</option>
          <option value="🇻🇳 Вьетнамская" ${recipe.cuisine && recipe.cuisine.includes('Вьетнамская') ? 'selected' : ''}>🇻🇳 Вьетнамская</option>
          <option value="🇪🇸 Испанская" ${recipe.cuisine && recipe.cuisine.includes('Испанская') ? 'selected' : ''}>🇪🇸 Испанская</option>
        </select>
      </div>

      <div>
        <label class="required-field">Тип блюда</label>
        <select id="editCategory" required>
          <option value="Закуски" ${recipe.category === 'Закуски' ? 'selected' : ''}>🥗 Закуски</option>
          <option value="Супы" ${recipe.category === 'Супы' ? 'selected' : ''}>🍲 Супы</option>
          <option value="Основные" ${recipe.category === 'Основные' ? 'selected' : ''}>🍛 Основные блюда</option>
          <option value="Десерты" ${recipe.category === 'Десерты' ? 'selected' : ''}>🍰 Десерты</option>
          <option value="Завтраки" ${recipe.category === 'Завтраки' ? 'selected' : ''}>🥞 Завтраки</option>
          <option value="Напитки" ${recipe.category === 'Напитки' ? 'selected' : ''}>🍹 Напитки</option>
          <option value="Салаты" ${recipe.category === 'Салаты' ? 'selected' : ''}>🥙 Салаты</option>
          <option value="Выпечка" ${recipe.category === 'Выпечка' ? 'selected' : ''}>🥖 Выпечка</option>
        </select>
      </div>

      <div>
        <label>Теги (через запятую)</label>
        <input type="text" id="editTags" value="${recipe.tags ? recipe.tags.join(', ') : ''}" placeholder="Например: Быстро, Вегетарианские, Здоровые">
        <div class="form-hint">Необязательное поле</div>
      </div>

      <div class="edit-button-group">
        <button type="button" class="cancel-btn">Отмена</button>
        <button type="button" class="save-btn">Сохранить изменения</button>
      </div>
    `;
  }

  #setupEditRecipeFormListeners(modal, form, recipe) {
    const cancelBtn = form.querySelector('.cancel-btn');
    const saveBtn = form.querySelector('.save-btn');

    const closeModal = () => document.body.removeChild(modal);

    cancelBtn.addEventListener('click', closeModal);

    saveBtn.addEventListener('click', async () => {
      const title = form.querySelector('#editTitle').value.trim();
      const description = form.querySelector('#editDescription').value.trim();
      const time = form.querySelector('#editTime').value.trim();
      const difficulty = form.querySelector('#editDifficulty').value;
      const cuisine = form.querySelector('#editCuisine').value;
      const category = form.querySelector('#editCategory').value;
      const tagsInput = form.querySelector('#editTags').value.trim();

      if (!title) {
        alert('Название рецепта обязательно для заполнения!');
        form.querySelector('#editTitle').focus();
        return;
      }

      if (!time) {
        alert('Время приготовления обязательно для заполнения!');
        form.querySelector('#editTime').focus();
        return;
      }

      if (!difficulty) {
        alert('Выберите сложность рецепта!');
        form.querySelector('#editDifficulty').focus();
        return;
      }

      if (!cuisine) {
        alert('Выберите кухню рецепта!');
        form.querySelector('#editCuisine').focus();
        return;
      }

      if (!category) {
        alert('Выберите тип блюда!');
        form.querySelector('#editCategory').focus();
        return;
      }

      let difficultyLevel = 'medium';
      if (difficulty.includes('Начинающий')) difficultyLevel = 'easy';
      if (difficulty.includes('Профессионал')) difficultyLevel = 'hard';

      let cookingTime = 'medium';
      const timeMinutes = this.#extractTimeMinutes(time);
      if (timeMinutes <= 20) cookingTime = 'fast';
      else if (timeMinutes <= 30) cookingTime = 'short';
      else if (timeMinutes > 60) cookingTime = 'long';

      const updatedData = {
        title,
        description: description || `${title} - вкусный рецепт`,
        time,
        difficulty,
        cuisine,
        category,
        tags: tagsInput ? tagsInput.split(',').map(tag => tag.trim()) : [category],
        cookingTime,
        difficultyLevel
      };

      try {
        // Показываем индикатор загрузки при обновлении
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохраняем...';
        
        await this.#recipeModel.updateRecipe(recipe.id, updatedData);
        
        alert(`Рецепт "${title}" успешно обновлен!`);
        closeModal();
      } catch (error) {
        console.error('❌ Error updating recipe:', error);
        alert('Ошибка при обновлении рецепта. Пожалуйста, попробуйте снова.');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить изменения';
      }
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', function closeOnEscape(event) {
      if (event.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', closeOnEscape);
      }
    });

    form.querySelector('#editTitle').focus();
  }

  #extractTimeMinutes(timeString) {
    if (!timeString) return 0;
    
    if (timeString.includes('ч')) {
      const hours = parseInt(timeString) || 0;
      const minutesMatch = timeString.match(/(\d+)\s*мин/);
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      return hours * 60 + minutes;
    } else {
      const minutesMatch = timeString.match(/(\d+)/);
      return minutesMatch ? parseInt(minutesMatch[1]) : 0;
    }
  }

  #handleEditRecipe(recipeId) {
    const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
    if (recipe) {
      console.log('✏️ Editing recipe:', recipe.title);
      this.#showEditRecipeForm(recipe);
    }
  }

  #handleDeleteRecipe(recipeId) {
    const recipe = this.#recipeModel.recipes.find(r => r.id === recipeId);
    if (recipe && confirm(`Удалить рецепт "${recipe.title}"?`)) {
      this.#recipeModel.deleteRecipe(recipeId)
        .then(() => {
          alert(`Рецепт "${recipe.title}" удален!`);
        })
        .catch(error => {
          console.error('❌ Error deleting recipe:', error);
          alert('Ошибка при удалении рецепта. Пожалуйста, попробуйте снова.');
        });
    }
  }

  #handleModelChange(event, payload) {
    console.log('🔄 Model changed:', event, payload);
    
    // Обновляем отображение при изменениях в модели
    if (event === 'INIT' || event === 'ADD' || event === 'UPDATE' || event === 'DELETE' || event === 'REORDER') {
      this.#renderRecipes();
    }
  }
}
