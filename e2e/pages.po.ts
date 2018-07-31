import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions
} from 'protractor';

export class PagesComponent {
  constructor() {
    browser.waitForAngularEnabled(false);
  }

  isVisible(el: ElementFinder) {
    const isVisible = ExpectedConditions.visibilityOf(el);
    return browser.wait(isVisible, 3000);
  }

  isClickable(el: ElementFinder) {
    const isClickable = ExpectedConditions.elementToBeClickable(el);
    return browser.wait(isClickable, 3000);
  }

  navigateTo() {
    return browser
      .get('/pages')
      .then(_ => this.isVisible(this.getPages().first()));
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getTitle() {
    return element(by.css('h1'));
  }

  getEditorPageTitle() {
    return element(by.css('h2'));
  }

  getPages() {
    return element.all(by.css('li'));
  }

  getPageNames() {
    return element.all(by.css('a'));
  }

  getPageLinks() {
    return element.all(by.css('a'));
  }

  getPageDeleteButtons() {
    return element.all(by.css('.remove'));
  }

  getPageArchiveButtons() {
    return element.all(by.css('.archive'));
  }

  getAddPageInput() {
    return element(by.css('#add-page'));
  }

  getFilterCurrentButton() {
    return element(by.css('#filter-current'));
  }

  getFilterArchivedButton() {
    return element(by.css('#filter-archived'));
  }
}
