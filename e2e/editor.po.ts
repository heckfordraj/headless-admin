import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions
} from 'protractor';

export class EditorComponent {
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
      .get('/page/page-1')
      .then(_ => this.isVisible(this.getPageName()));
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getPageName() {
    return element(by.css('h2'));
  }

  getPagesPageTitle() {
    return element(by.css('h1'));
  }

  getPageInput() {
    return element(by.css('.page-input'));
  }

  getPagePublishButton() {
    return element(by.css('#publish'));
  }

  getPageArchiveButton() {
    return element(by.css('#archive'));
  }

  getBlocks() {
    return element(by.css('app-blocks')).all(by.css('app-text, app-image'));
  }
}
