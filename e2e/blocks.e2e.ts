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
});
