import { browser, by, element } from 'protractor';

export class EditorComponent {
  navigateTo() {
    return browser.get('/page/page-1');
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getPageName() {
    return element(by.css('h1')).getText();
  }

  getPageInput() {
    return element(by.css('.page-input'));
  }
}
