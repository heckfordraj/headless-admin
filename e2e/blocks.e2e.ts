import { browser, ElementFinder, Key } from 'protractor';
import { BlocksComponent } from './blocks.po';

import * as FirebaseServer from 'firebase-server';
import * as rules from '../database.rules.json';
import * as data from '../src/testing/data.json';

describe('BlocksComponent', () => {
  let server: FirebaseServer;
  let page: BlocksComponent;

  beforeEach(() => {
    server = new FirebaseServer(5000, '127.0.1', data);
    server.setRules(rules);

    page = new BlocksComponent();
    page.navigateTo();
    browser.sleep(3000);
    browser.waitForAngularEnabled(false);
  });

  afterEach(() => {
    server.close();
  });

  it('should display base block buttons', () => {
    expect(page.getBaseBlocks().count()).toBe(2);
  });

  it('should display initial blocks', () => {
    expect(page.getBlocks().count()).toBe(3);
  });

  it('should display correct initial blocks', () => {
    expect(
      page
        .getBlockTypes()
        .get(0)
        .getText()
    ).toBe('text');
    expect(
      page
        .getBlockTypes()
        .get(1)
        .getText()
    ).toBe('image');
    expect(
      page
        .getBlockTypes()
        .get(2)
        .getText()
    ).toBe('text');
  });

  it('should display new blocks', () => {
    page.navigateTo('/page/page-2');
    browser.sleep(3000);

    expect(page.getBlocks().count()).toBe(3);
  });

  it('should display correct new blocks', () => {
    page.navigateTo('/page/page-2');
    browser.sleep(3000);

    expect(
      page
        .getBlockTypes()
        .get(0)
        .getText()
    ).toBe('image');
    expect(
      page
        .getBlockTypes()
        .get(1)
        .getText()
    ).toBe('text');
    expect(
      page
        .getBlockTypes()
        .get(2)
        .getText()
    ).toBe('image');
  });

  describe('add block', () => {
    it('should add to list', () => {
      page.getBaseBlockImage().click();

      expect(page.getBlocks().count()).toBe(4);
    });

    it('should add block to bottom of list', () => {
      page.getBaseBlockImage().click();

      expect(
        page
          .getBlockTypes()
          .get(3)
          .getText()
      ).toBe('image');
    });

    it('should add image block', () => {
      page.getBaseBlockImage().click();

      expect(
        page
          .getBlockTypes()
          .get(3)
          .getText()
      ).toBe('image');
    });

    it('should add text block', () => {
      page.getBaseBlockText().click();

      expect(
        page
          .getBlockTypes()
          .get(3)
          .getText()
      ).toBe('text');
    });

    it('should add multiple blocks to list', () => {
      page.getBaseBlockText().click();
      page.getBaseBlockImage().click();

      expect(page.getBlocks().count()).toBe(5);
    });

    it('should add multiple blocks with correct type', () => {
      page.getBaseBlockText().click();
      page.getBaseBlockImage().click();

      expect(
        page
          .getBlockTypes()
          .get(3)
          .getText()
      ).toBe('text');
      expect(
        page
          .getBlockTypes()
          .get(4)
          .getText()
      ).toBe('image');
    });
  });

  describe('block remove', () => {
    it('should remove block from list', () => {
      page
        .getBlockRemoveButtons()
        .get(1)
        .click();

      expect(page.getBlocks().count()).toBe(2);
    });

    it('should not display removed block', () => {
      page
        .getBlockRemoveButtons()
        .get(1)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(0)
          .getText()
      ).toBe('text');
      expect(
        page
          .getBlockTypes()
          .get(1)
          .getText()
      ).toBe('text');
    });

    it('should not remove other block with same block type', () => {
      page.getBaseBlockImage().click();
      page
        .getBlockRemoveButtons()
        .get(1)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(2)
          .getText()
      ).toBe('image');
    });
  });

  describe('order block', () => {
    beforeEach(() => {
      page.getBaseBlockImage().click();
    });

    it('should move block up on up click', () => {
      expect(
        page
          .getBlockTypes()
          .get(1)
          .getText()
      ).toBe('image');

      page
        .getBlockOrderUpButtons()
        .get(2)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(1)
          .getText()
      ).toBe('text');
    });

    it('should move block down on down click', () => {
      expect(
        page
          .getBlockTypes()
          .get(2)
          .getText()
      ).toBe('text');

      page
        .getBlockOrderDownButtons()
        .get(1)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(2)
          .getText()
      ).toBe('image');
    });

    it('should not move top block on up click', () => {
      expect(
        page
          .getBlockTypes()
          .first()
          .getText()
      ).toBe('text');

      page
        .getBlockOrderUpButtons()
        .first()
        .click();

      expect(
        page
          .getBlockTypes()
          .first()
          .getText()
      ).toBe('text');
    });

    it('should not move bottom block on down click', () => {
      expect(
        page
          .getBlockTypes()
          .last()
          .getText()
      ).toBe('image');

      page
        .getBlockOrderDownButtons()
        .last()
        .click();

      expect(
        page
          .getBlockTypes()
          .last()
          .getText()
      ).toBe('image');
    });

    it('should move block to original position on down and up click', () => {
      expect(
        page
          .getBlockTypes()
          .get(1)
          .getText()
      ).toBe('image');

      page
        .getBlockOrderDownButtons()
        .get(1)
        .click();
      page
        .getBlockOrderUpButtons()
        .get(2)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(1)
          .getText()
      ).toBe('image');
    });

    it('should move block to top', () => {
      expect(
        page
          .getBlockTypes()
          .first()
          .getText()
      ).toBe('text');

      page
        .getBlockOrderUpButtons()
        .get(3)
        .click();
      page
        .getBlockOrderUpButtons()
        .get(2)
        .click();
      page
        .getBlockOrderUpButtons()
        .get(1)
        .click();

      expect(
        page
          .getBlockTypes()
          .first()
          .getText()
      ).toBe('image');
    });

    it('should move block to bottom', () => {
      expect(
        page
          .getBlockTypes()
          .last()
          .getText()
      ).toBe('image');

      page
        .getBlockOrderDownButtons()
        .get(0)
        .click();
      page
        .getBlockOrderDownButtons()
        .get(1)
        .click();
      page
        .getBlockOrderDownButtons()
        .get(2)
        .click();

      expect(
        page
          .getBlockTypes()
          .last()
          .getText()
      ).toBe('text');
    });

    it('should move blocks correctly with middle block removed', () => {
      page.getBaseBlockImage().click();
      page.getBaseBlockText().click();

      browser.sleep(1000);

      page
        .getBlockRemoveButtons()
        .get(4)
        .click();
      page
        .getBlockOrderUpButtons()
        .get(4)
        .click();

      expect(
        page
          .getBlockTypes()
          .get(3)
          .getText()
      ).toBe('text');
      expect(
        page
          .getBlockTypes()
          .get(4)
          .getText()
      ).toBe('image');
    });
  });
});
