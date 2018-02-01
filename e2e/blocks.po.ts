import { browser, by, element } from 'protractor';

export class BlocksComponent {
  navigateTo(url: string = '/page/page-1') {
    return browser.get(url);
  }

  getBaseBlocks() {
    return element.all(by.css('.add-block'));
  }

  getBlocks() {
    return element.all(by.css('li'));
  }

  getBlockTypes() {
    return element.all(by.css('b'));
  }
}
