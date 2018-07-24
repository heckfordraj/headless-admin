import { ElementFinder, Key } from 'protractor';
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
  });

  afterEach(() => server.close());

  it('should display page name', () => {
    expect(page.getPageName().getText()).toBe('Page 1');
  });

  describe('page update', () => {
    let updatePageInput: ElementFinder;

    beforeEach(() => (updatePageInput = page.getPageInput()));

    it('should display slugified initial page name in input', () => {
      expect(updatePageInput.getAttribute('value')).toBe('page-1');
    });

    it('should display input value on type', () => {
      updatePageInput.clear();
      updatePageInput.sendKeys('test');

      expect(updatePageInput.getAttribute('value')).toBe('test');
    });

    it('should display slugified input value on type', () => {
      updatePageInput.clear();
      updatePageInput.sendKeys('Test Page');

      expect(updatePageInput.getAttribute('value')).toBe('test-page');
    });

    it('should route to updated page on submit', () => {
      updatePageInput.clear();

      updatePageInput
        .sendKeys('New Page', Key.ENTER)
        .then(() => page.isVisible(page.getPageName()))
        .then(_ => expect(page.getUrl()).toContain('/page/new-page'));
    });

    it('should display updated page name', () => {
      updatePageInput.clear();

      updatePageInput
        .sendKeys('New Page', Key.ENTER)
        .then(() => page.isVisible(page.getPageName()))
        .then(_ => expect(page.getPageName().getText()).toBe('New Page'));
    });

    it('should not route to duplicate page name on submit', () => {
      updatePageInput.clear();

      updatePageInput
        .sendKeys('Page 2', Key.ENTER)
        .then(() => page.isVisible(page.getPageName()))
        .then(_ => expect(page.getUrl()).not.toContain('/page-2'));
    });
  });

  describe('page publish', () => {
    beforeEach(() => {
      const el = page.getPagePublishButton();

      page.isClickable(el).then(_ => el.click());
    });

    it('should not modify blocks', () => {
      expect(page.getBlocks().count()).toBe(3);
    });
  });

  describe('page remove', () => {
    beforeEach(() => {
      const el = page.getPageDeleteButton();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(_ => page.isVisible(page.getPagesPageTitle()));
    });

    it('should route to pages', () => {
      expect(page.getUrl()).toContain('/pages');
    });
  });
});
