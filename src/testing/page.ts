export { Page } from 'shared';
import { Page } from 'shared';

export function isPage(page: any): page is Page {
  return (
    page.id &&
    (page.id instanceof String || typeof page.id === 'string') &&
    page.name &&
    (page.name instanceof String || typeof page.name === 'string') &&
    page.dataId &&
    (page.dataId instanceof String || typeof page.dataId === 'string') &&
    page.revisions &&
    page.revisions.currentId &&
    (page.revisions.currentId instanceof String ||
      typeof page.revisions.currentId === 'string')
  );
}
