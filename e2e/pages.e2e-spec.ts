import { ElementFinder, Key } from 'protractor';
import { PagesComponent } from './pages.po';
import { Data } from './data';

const FirebaseServer = require('firebase-server');
import * as rules from '../database.rules.json';

describe('PagesComponent', () => {
  let server: any;
  let page: PagesComponent;

  beforeEach(() => {
    server = new FirebaseServer(
      5000,
      '127.0.1',
      JSON.parse(JSON.stringify(Data))
    );
    server.setRules(rules);

    page = new PagesComponent();
    page.navigateTo();
  });

  afterEach(() => server.close());

  it('should display title', () => {
    expect(page.getTitle().getText()).toContain('pages');
  });

  it('should display draft and published pages', () => {
    expect(page.getPages().count()).toBe(3);
  });

  describe('page', () => {
    it('should display page name', () => {
      expect(
        page
          .getPageNames()
          .first()
          .getText()
      ).toBe('Page 3');
    });

    it('should set page link', () => {
      expect(
        page
          .getPageLinks()
          .first()
          .getAttribute('href')
      ).toContain('/page/page-3');
    });

    it('should navigate to page on click', () => {
      const el = page.getPageLinks().first();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getEditorPageTitle()))
        .then(_ => expect(page.getUrl()).toContain('/page/page-3'));
    });
  });

  describe('filter pages', () => {
    describe('current', () => {
      beforeEach(() => {
        const currentEl = page.getFilterCurrentButton();
        const archivedEl = page.getFilterArchivedButton();

        page
          .isClickable(archivedEl)
          .then(() => archivedEl.click())
          .then(() => page.isClickable(currentEl))
          .then(() => currentEl.click())
          .then(_ => page.isVisible(page.getPages().first()));
      });

      it('should display draft and published pages', () => {
        const pageNames = page.getPageNames().map(name => name.getText());

        expect(pageNames).toEqual(['Page 3', 'Page 2', 'Page 1']);
      });
    });

    describe('archived', () => {
      beforeEach(() => {
        const currentEl = page.getFilterCurrentButton();
        const archivedEl = page.getFilterArchivedButton();

        page
          .isClickable(currentEl)
          .then(() => currentEl.click())
          .then(() => page.isClickable(archivedEl))
          .then(() => archivedEl.click())
          .then(_ => page.isVisible(page.getPages().first()));
      });

      it('should display archived pages', () => {
        const pageNames = page.getPageNames().map(name => name.getText());

        expect(pageNames).toEqual(['Page 5', 'Page 4']);
      });
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

      expect(page.getPages().count()).toBe(4);
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

      expect(page.getPages().count()).toBe(3);
    });
  });

  describe('archive page', () => {
    beforeEach(() => {
      const el = page.getPageArchiveButtons().last();

      page.isClickable(el).then(_ => el.click());
    });

    it('should remove page from current page list', () => {
      const el = page.getFilterCurrentButton();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getPages().first()))
        .then(_ =>
          page
            .getPageNames()
            .map(pageName => expect(pageName.getText()).not.toContain('Page 1'))
        );
    });

    it('should add page to archive page list', () => {
      const el = page.getFilterArchivedButton();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getPages().first()))
        .then(_ => {
          const pageNames = page.getPageNames().map(name => name.getText());

          expect(pageNames).toContain('Page 1');
        });
    });

    it('should reject archived page name', () => {
      page.getAddPageInput().sendKeys('Page 1', Key.ENTER);

      expect(page.getPages().count()).toBe(2);
    });
  });

  describe('delete page', () => {
    beforeEach(() => {
      const el = page.getPageDeleteButtons().last();

      page.isClickable(el).then(_ => el.click());
    });

    it('should remove page from current page list', () => {
      const el = page.getFilterCurrentButton();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getPages().first()))
        .then(_ =>
          page
            .getPageNames()
            .map(pageName => expect(pageName.getText()).not.toContain('Page 1'))
        );
    });

    it('should not add page to archive page list', () => {
      const el = page.getFilterArchivedButton();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.isVisible(page.getPages().first()))
        .then(_ =>
          page
            .getPageNames()
            .map(pageName => expect(pageName.getText()).not.toContain('Page 1'))
        );
    });

    it('should not reject deleted page name', () => {
      page.getAddPageInput().sendKeys('Page 1', Key.ENTER);

      expect(page.getPages().count()).toBe(3);
    });
  });
});
