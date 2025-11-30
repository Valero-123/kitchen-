const RenderPosition = {
  BEFOREBEGIN: 'beforebegin',
  AFTERBEGIN: 'afterbegin',
  BEFOREEND: 'beforeend',
  AFTEREND: 'afterend',
};

function createElement(template) {
  const newElement = document.createElement('div');
  newElement.innerHTML = template;
  return newElement.firstElementChild;
}

function render(component, container, place = RenderPosition.BEFOREEND) {
  // Проверяем, есть ли у компонента метод getElement
  if (component && typeof component.getElement === 'function') {
    const element = component.getElement();
    if (element && container) {
      container.insertAdjacentElement(place, element);
    }
  } else {
    console.error('Component does not have getElement method:', component);
  }
}

export { RenderPosition, createElement, render };