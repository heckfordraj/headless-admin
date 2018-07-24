import { ElementFinder, Key } from 'protractor';
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
    page
      .navigateTo('/page/page-1')
      .then(_ => page.isVisible(page.getBlocks().first()));
  });

  afterEach(() => server.close());

  it('should display base block buttons', () => {
    expect(page.getBaseBlocksButtons().count()).toBe(2);
  });

  describe('initial page', () => {
    it('should display blocks', () => {
      const blockNames = page.getBlockTypes().map(block => block.getText());

      expect(blockNames).toEqual(['text', 'image', 'text']);
    });
  });

  describe('new page', () => {
    beforeEach(() =>
      page
        .navigateTo('/page/page-2')
        .then(_ => page.isVisible(page.getBlocks().first()))
    );

    it('should display blocks', () => {
      const blockNames = page.getBlockTypes().map(block => block.getText());

      expect(blockNames).toEqual(['image', 'text', 'image']);
    });
  });

  describe('add block', () => {
    it('should add image block', () => {
      const el = page.getBaseBlockImage();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(_ =>
          expect(
            page
              .getBlockTypes()
              .get(3)
              .getText()
          ).toBe('image')
        );
    });

    it('should add text block', () => {
      const el = page.getBaseBlockText();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(_ =>
          expect(
            page
              .getBlockTypes()
              .get(3)
              .getText()
          ).toBe('text')
        );
    });
  });

  describe('block remove', () => {
    it('should remove text block', () => {
      const el = page.getBlockRemoveButtons().first();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames => expect(blockNames).toEqual(['image', 'text']));
    });

    it('should remove image block', () => {
      const el = page.getBlockRemoveButtons().get(1);

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames => expect(blockNames).toEqual(['text', 'text']));
    });
  });

  describe('order block', () => {
    it('should move middle block up on up click', () => {
      const el = page.getBlockOrderUpButtons().get(1);

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['image', 'text', 'text'])
        );
    });

    it('should move middle block down on down click', () => {
      const el = page.getBlockOrderDownButtons().get(1);

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['text', 'text', 'image'])
        );
    });

    it('should not move top block on up click', () => {
      const el = page.getBlockOrderUpButtons().first();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['text', 'image', 'text'])
        );
    });

    it('should not move bottom block on down click', () => {
      const el = page.getBlockOrderDownButtons().last();

      page
        .isClickable(el)
        .then(() => el.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['text', 'image', 'text'])
        );
    });

    it('should move block to original position on down and up click', () => {
      const elUp = page.getBlockOrderUpButtons().last();
      const elDown = page.getBlockOrderDownButtons().get(1);

      page
        .isClickable(elDown)
        .then(() => elDown.click())
        .then(() => page.isClickable(elUp))
        .then(() => elUp.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['text', 'image', 'text'])
        );
    });

    it('should move bottom block to top', () => {
      page.getBaseBlockImage().click();

      const el = page.getBlockOrderUpButtons();

      page
        .isClickable(el.last())
        .then(() => el.last().click())
        .then(() => page.isClickable(el.get(2)))
        .then(() => el.get(2).click())
        .then(() => page.isClickable(el.get(1)))
        .then(() => el.get(1).click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['image', 'text', 'image', 'text'])
        );
    });

    it('should move top block to bottom', () => {
      page.getBaseBlockImage().click();

      const el = page.getBlockOrderDownButtons();

      page
        .isClickable(el.first())
        .then(() => el.first().click())
        .then(() => page.isClickable(el.get(1)))
        .then(() => el.get(1).click())
        .then(() => page.isClickable(el.get(2)))
        .then(() => el.get(2).click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['image', 'text', 'image', 'text'])
        );
    });

    it('should move blocks correctly with middle block removed', () => {
      page.getBaseBlockText().click();
      page.getBaseBlockImage().click();

      const elRemove = page.getBlockRemoveButtons().get(3);
      const elUp = page.getBlockOrderUpButtons().last();

      page
        .isClickable(elRemove)
        .then(() => elRemove.click())
        .then(() => page.isClickable(elUp))
        .then(() => elUp.click())
        .then(() => page.getBlockTypes().map(block => block.getText()))
        .then(blockNames =>
          expect(blockNames).toEqual(['text', 'image', 'image', 'text'])
        );
    });
  });
});
