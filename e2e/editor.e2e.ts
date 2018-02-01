import { browser, ElementFinder, Key } from 'protractor';
import { EditorComponent } from './editor.po';

import * as FirebaseServer from 'firebase-server';
import * as rules from '../database.rules.json';
import * as data from '../src/testing/data.json';

describe('EditorComponent', () => {
  let server: FirebaseServer;
  let page: EditorComponent;

  beforeEach(() => {
    server = new FirebaseServer(5000, '127.0.1', data);
    server.setRules(rules);

    page = new EditorComponent();
    page.navigateTo();
    browser.sleep(3000);
    browser.waitForAngularEnabled(false);
  });

  afterEach(() => {
    server.close();
  });

  it('should display page name', () => {
    expect(page.getPageName()).toBe('Page 1');
  });

  describe('page update', () => {
    let updatePage: ElementFinder;

    beforeEach(() => {
      updatePage = page.getPageInput();
    });

    it('should display initial page name in input', () => {
      expect(updatePage.getAttribute('value')).toBe('Page 1');
    });

    it('should display page input value on type', () => {
      updatePage.clear();
      updatePage.sendKeys('test');

      expect(updatePage.getAttribute('value')).toBe('test');
    });

    it('should route to updated page name on submit', () => {
      updatePage.clear();
      updatePage.sendKeys('New Page', Key.ENTER);

      expect(page.getUrl()).toContain('/page/new-page');
    });

    it('should display updated page name', () => {
      updatePage.clear();
      updatePage.sendKeys('New Page', Key.ENTER);

      browser.sleep(1000);

      expect(page.getPageName()).toBe('New Page');
    });

    xit('should not route to duplicate page name on submit', () => {});
  });

  xdescribe('page publish', () => {});

  describe('page remove', () => {
    beforeEach(() => {
      page.getPageDeleteButton().click();
    });

    it('should not display page name', () => {
      expect(page.getPageName()).toBe('');
    });

    xit('should route to pages', () => {});
  });
});
