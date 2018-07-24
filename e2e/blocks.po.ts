import {
  browser,
  by,
  element,
  ElementFinder,
  ExpectedConditions
} from 'protractor';

export class BlocksComponent {
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

  navigateTo(url: string) {
    return browser.get(url);
  }

  getBaseBlocksButtons() {
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
