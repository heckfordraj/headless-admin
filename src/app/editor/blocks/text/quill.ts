import * as Quill from 'quill';

const Block = Quill.import('blots/block');

export class TitleBlock extends Block {
  formatAt(_index, _length, name, value) {
    if (name !== 'title') return;

    super.format(name, value);
  }
}
TitleBlock.blotName = 'title';
TitleBlock.tagName = ['H3'];
