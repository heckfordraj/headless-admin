import { browser, by, element } from 'protractor';

export class PagesComponent {
  navigateTo() {
    return browser.get('/pages');
  }

  getUrl() {
    return browser.getCurrentUrl();
  }

  getTitle() {
    return element(by.css('h1')).getText();
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

  getPageDataIds() {
    return element.all(by.css('small'));
  }

  getPageDeleteButtons() {
    return element.all(by.css('button'));
  }

  getAddPageInput() {
    return element(by.css('#add-page'));
  }
}
