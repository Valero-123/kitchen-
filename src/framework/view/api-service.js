export default class ApiService {
  constructor(endPoint) {
    this._endPoint = endPoint;
  }

  async _load({
    url,
    method = 'GET',
    body = null,
    headers = new Headers(),
  }) {
    try {
      const response = await fetch(
        `${this._endPoint}/${url}`,
        { method, body, headers },
      );

      ApiService.checkStatus(response);
      return response;
    } catch (err) {
      ApiService.catchError(err);
    }
  }

  static parseResponse(response) {
    return response.json();
  }

  static checkStatus(response) {
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
  }

  static catchError(err) {
    console.error('API Error:', err);
    throw err;
  }
}