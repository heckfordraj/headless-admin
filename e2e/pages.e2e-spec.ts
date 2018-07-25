import { ElementFinder, Key } from 'protractor';
import { PagesComponent } from './pages.po';

const FirebaseServer = require('firebase-server');
import * as rules from '../database.rules.json';
import * as data from '../src/testing/data.json';

describe('PagesComponent', () => {
  let server: any;
  let page: PagesComponent;

  beforeEach(() => {
    server = new FirebaseServer(5000, '127.0.1', data);
    server.setRules(rules);

    page = new PagesComponent();
    page.navigateTo();
  });

  afterEach(() => server.close());

  it('should display title', () => {
    expect(page.getTitle().getText()).toContain('pages');
  });

  it('should display pages', () => {
    expect(page.getPages().count()).toBe(5);
  });

  describe('page', () => {
    it('should display page name', () => {
      expect(
        page
          .getPageNames()
          .first()
          .getText()
      ).toBe('Page 5');
    });

    it('should set page link', () => {
      expect(
        page
          .getPageLinks()
          .first()
          .getAttribute('href')
      ).toContain('/page/page-5');
    });

    it('should navigate to page on click', () => {
      const el = page.getPageLinks().first();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getEditorPageTitle()))
        .then(_ => expect(page.getUrl()).toContain('/page/page-5'));
    });
  });

  describe('add page', () => {
    let addPageInput: ElementFinder;

    beforeEach(() => {
      addPageInput = page.getAddPageInput();
      addPageInput.clear();
    });

    it('should display empty field', () => {
      expect(addPageInput.getAttribute('value')).toBe('');
    });

    it('should display input value on type', () => {
      addPageInput.sendKeys('Test');

      expect(addPageInput.getAttribute('value')).toBe('Test');
    });

    it('should add page to page list on submit', () => {
      addPageInput.sendKeys('Page Title', Key.ENTER);

      expect(page.getPages().count()).toBe(6);
    });

    it('should display new page name', () => {
      addPageInput.sendKeys('Page Title', Key.ENTER);

      expect(
        page
          .getPageNames()
          .first()
          .getText()
      ).toBe('Page Title');
    });

    it('should display new page link', () => {
      addPageInput.sendKeys('Page Title', Key.ENTER);

      expect(
        page
          .getPageLinks()
          .first()
          .getAttribute('href')
      ).toContain('/page/page-title');
    });

    it('should reject duplicate page name', () => {
      addPageInput.sendKeys('Page 1', Key.ENTER);

      expect(page.getPages().count()).toBe(5);
    });
  });

  describe('delete page', () => {
    beforeEach(() => {
      const el = page.getPageDeleteButtons().get(2);

      page.isClickable(el).then(_ => el.click());
    });

    it('should remove page from page list', () => {
      page
        .getPageNames()
        .map(pageName => expect(pageName.getText()).not.toContain('Page 3'));
    });

    it('should not reject deleted page name', () => {
      page.getAddPageInput().sendKeys('Page 3', Key.ENTER);

      expect(page.getPages().count()).toBe(5);
    });
  });
});
