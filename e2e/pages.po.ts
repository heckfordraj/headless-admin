import { browser, by, element } from 'protractor';

export class PagesPage {
  navigateTo() {
    return browser.get('/pages');
  }

  getPageTitle() {
    return element(by.css('h1')).getText();
  }

  getPages() {
    return element.all(by.css('li'));
  }
}
