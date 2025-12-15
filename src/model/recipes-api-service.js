import ApiService from '../framework/view/api-service.js';

const Method = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
};

export default class RecipesApiService extends ApiService {
  constructor(endPoint) {
    super(endPoint);
  }

  // Получить все рецепты
  get recipes() {
    return this._load({ url: '' })
      .then(ApiService.parseResponse);
  }

  // Добавить новый рецепт
  async addRecipe(recipe) {
    const response = await this._load({
      url: '',
      method: Method.POST,
      body: JSON.stringify(recipe),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    return ApiService.parseResponse(response);
  }

  // Обновить рецепт
  async updateRecipe(id, updatedData) {
    const response = await this._load({
      url: `${id}`,
      method: Method.PUT,
      body: JSON.stringify(updatedData),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    });

    return ApiService.parseResponse(response);
  }

  // Удалить рецепт
  async deleteRecipe(id) {
    const response = await this._load({
      url: `${id}`,
      method: Method.DELETE,
    });

    return response;
  }
}