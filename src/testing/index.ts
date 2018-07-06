export * from './firebaseapp';
export * from './angularfiredatabase';
export * from './server.service';
export * from './router';
export * from './page';
export * from './block';

export function newEvent(
  eventName: string,
  bubbles = false,
  cancelable = false
) {
  let evt = document.createEvent('CustomEvent');
  evt.initCustomEvent(eventName, bubbles, cancelable, null);
  return evt;
}
