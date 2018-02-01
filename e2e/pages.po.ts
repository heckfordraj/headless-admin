import { browser, by, element } from 'protractor';

export class PagesPage {
  navigateTo() {
    return browser.get('/pages');
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

  getPageInputs() {
    return element.all(by.css('.page-input'));
  }

  getPageLinks() {
    return element.all(by.css('a'));
  }

  getAddPageInput() {
    return element(by.css('#add-page'));
  }
}
