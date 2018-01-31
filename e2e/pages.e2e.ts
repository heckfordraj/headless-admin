import { browser } from 'protractor';
import { PagesPage } from './pages.po';

describe('Pages Page', () => {
  let page: PagesPage;

  beforeEach(() => {
    page = new PagesPage();
    page.navigateTo();
    browser.sleep(3000);
    browser.waitForAngularEnabled(false);
  });

  it('should display title', () => {
    expect(page.getPageTitle()).toContain('pages');
  });

  it('should display pages', () => {
    expect(page.getPages().count()).toBeGreaterThan(1);
  });
});
