import { browser, ElementFinder, Key } from 'protractor';
import { PagesPage } from './pages.po';

import * as FirebaseServer from 'firebase-server';
import * as data from '../src/testing/data.json';

describe('Pages Page', () => {
  let server: FirebaseServer;
  let page: PagesPage;

  beforeEach(() => {
    server = new FirebaseServer(5000, '127.0.1', data);

    page = new PagesPage();
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

  describe('update page', () => {
    let pageIndex = 3;
    let input: ElementFinder;

    beforeEach(() => {
      input = page.getPageInputs().get(pageIndex);
    });

    it('should display initial page name', () => {
      expect(
        page
          .getPageNames()
          .get(pageIndex)
          .getText()
      ).toBe('Page 4');
    });

    it('should display initial page name in input', () => {
      expect(
        page
          .getPageInputs()
          .get(pageIndex)
          .getAttribute('value')
      ).toBe('Page 4');
    });

    it('should display page input value on type', () => {
      input.sendKeys('4');
      expect(
        page
          .getPageInputs()
          .get(pageIndex)
          .getAttribute('value')
      ).toBe('Page 44');
      input.clear();
      input.sendKeys('Name');
      expect(
        page
          .getPageInputs()
          .get(pageIndex)
          .getAttribute('value')
      ).toBe('Name');
    });

    it('should display updated page name on submit', () => {
      input.clear();
      input.sendKeys('Page Update', Key.ENTER);

      expect(
        page
          .getPageNames()
          .last()
          .getText()
      ).toBe('Page Update');
    });
  });
});
