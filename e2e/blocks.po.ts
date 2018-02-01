import { browser, by, element, ElementArrayFinder } from 'protractor';

export class BlocksComponent {
  navigateTo(url: string = '/page/page-1') {
    return browser.get(url);
  }

  getBaseBlocks() {
    return element.all(by.css('.add-block'));
  }

  getBaseBlockText() {
    return element(by.id('add-text'));
  }

  getBaseBlockImage() {
    return element(by.id('add-image'));
  }

  getBlocks() {
    return element.all(by.css('li'));
  }

  getBlockTypes() {
    return element.all(by.css('b'));
  }

  getBlockOrderUpButtons() {
    return element.all(by.css('.order-up'));
  }

  getBlockOrderDownButtons() {
    return element.all(by.css('.order-down'));
  }

  getBlockRemoveButtons() {
    return element.all(by.css('.block-remove'));
  }
}
