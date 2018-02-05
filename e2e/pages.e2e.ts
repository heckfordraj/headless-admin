import { browser, ElementFinder, Key } from 'protractor';
import { PagesComponent } from './pages.po';

import * as FirebaseServer from 'firebase-server';
import * as rules from '../database.rules.json';
import * as data from '../src/testing/data.json';

describe('PagesComponent', () => {
  let server: FirebaseServer;
  let page: PagesComponent;

  beforeEach(() => {
    server = new FirebaseServer(5000, '127.0.1', data);
    server.setRules(rules);

    page = new PagesComponent();
    page.navigateTo();
    browser.sleep(3000);
    browser.waitForAngularEnabled(false);
  });

  afterEach(() => {
    server.close();
  });

  it('should display title', () => {
    expect(page.getTitle()).toContain('pages');
  });

  it('should display pages', () => {
    expect(page.getPages().count()).toBe(5);
  });

  it('should display page names', () => {
    expect(
      page
        .getPageNames()
        .get(0)
        .getText()
    ).toBe('Page 1');
    expect(
      page
        .getPageNames()
        .get(1)
        .getText()
    ).toBe('Page 2');
    expect(
      page
        .getPageNames()
        .get(2)
        .getText()
    ).toBe('Page 3');
    expect(
      page
        .getPageNames()
        .get(3)
        .getText()
    ).toBe('Page 4');
    expect(
      page
        .getPageNames()
        .get(4)
        .getText()
    ).toBe('Page 5');
  });

  it('should display page links', () => {
    expect(
      page
        .getPageLinks()
        .get(0)
        .getAttribute('href')
    ).toContain('/page/page-1');
    expect(
      page
        .getPageLinks()
        .get(1)
        .getAttribute('href')
    ).toContain('/page/page-2');
    expect(
      page
        .getPageLinks()
        .get(2)
        .getAttribute('href')
    ).toContain('/page/page-3');
    expect(
      page
        .getPageLinks()
        .get(3)
        .getAttribute('href')
    ).toContain('/page/page-4');
    expect(
      page
        .getPageLinks()
        .get(4)
        .getAttribute('href')
    ).toContain('/page/page-5');
  });

  describe('add page', () => {
    let addPage: ElementFinder;

    beforeEach(() => {
      addPage = page.getAddPageInput();
    });

    it('should display empty field on load', () => {
      expect(addPage.getAttribute('value')).toBeNaN;
    });

    it('should display page input value on type', () => {
      addPage.clear();
      addPage.sendKeys('test');

      expect(addPage.getAttribute('value')).toBe('test');
    });

    it('should add page to list on submit', () => {
      addPage.clear();
      addPage.sendKeys('Z Page', Key.ENTER);

      expect(page.getPages().count()).toBe(6);
    });

    it('should display new page name', () => {
      addPage.clear();
      addPage.sendKeys('Z Page', Key.ENTER);

      expect(
        page
          .getPageNames()
          .last()
          .getText()
      ).toBe('Z Page');
    });

    it('should display new page link', () => {
      addPage.clear();
      addPage.sendKeys('Z Page', Key.ENTER);

      expect(
        page
          .getPageLinks()
          .last()
          .getAttribute('href')
      ).toContain('/page/z-page');
    });

    it('should not add duplicate page to list on submit', () => {
      addPage.clear();
      addPage.sendKeys('Page 1', Key.ENTER);

      expect(page.getPages().count()).toBe(5);
    });

    it('should not modify existing page on duplicate submit', () => {
      addPage.clear();
      addPage.sendKeys('Page 1', Key.ENTER);

      expect(
        page
          .getPageDataIds()
          .first()
          .getText()
      ).toBe('1');
    });
  });

  describe('delete page', () => {
    let pageIndex = 2;

    beforeEach(() => {
      page
        .getPageDeleteButtons()
        .get(pageIndex)
        .click();
    });

    it('should remove page from list', () => {
      expect(page.getPages().count()).toBe(4);
    });

    it('should remove correct page name from list', () => {
      expect(
        page
          .getPageNames()
          .get(0)
          .getText()
      ).toBe('Page 1');
      expect(
        page
          .getPageNames()
          .get(1)
          .getText()
      ).toBe('Page 2');
      expect(
        page
          .getPageNames()
          .get(2)
          .getText()
      ).toBe('Page 4');
      expect(
        page
          .getPageNames()
          .get(3)
          .getText()
      ).toBe('Page 5');
    });

    it('should allow add new page to list with same name', () => {
      page.getAddPageInput().sendKeys('Page 3', Key.ENTER);

      expect(page.getPages().count()).toBe(5);
    });
  });

  describe('routing', () => {
    it('should navigate to page on click', () => {
      page
        .getPageLinks()
        .first()
        .click();

      expect(page.getUrl()).toContain('/page/page-1');
    });
  });
});
