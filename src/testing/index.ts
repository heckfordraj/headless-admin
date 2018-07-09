export * from './firebaseapp';
export * from './angularfiredatabase';
export * from './image.service.mock';
export * from './logger.service.mock';
export * from './server.service.mock';
export * from './router';
export * from './page';
export * from './block';
export * from './data';

export function newEvent(
  eventName: string,
  bubbles = false,
  cancelable = false
) {
  const evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}
