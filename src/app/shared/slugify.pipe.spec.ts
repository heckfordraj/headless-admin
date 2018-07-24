import { SlugifyPipe } from './slugify.pipe';

describe('SlugifyPipe', () => {
  let pipe: SlugifyPipe;

  beforeEach(() => (pipe = new SlugifyPipe()));

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert spaces to dashes', () => {
    expect(pipe.transform('a b c')).toBe('a-b-c');
  });

  it('should convert multiple spaces to dashes', () => {
    expect(pipe.transform('a  b     c')).toBe('a-b-c');
  });

  it('should convert all letters to lowercase', () => {
    expect(pipe.transform('ABC')).toBe('abc');
  });

  it('should convert all words to lowercase', () => {
    expect(pipe.transform('A NEW TitLe')).toBe('a-new-title');
  });

  it('should remove whitespace from start', () => {
    expect(pipe.transform('   a')).toBe('a');
  });

  it('should remove whitespace from end', () => {
    expect(pipe.transform('a  ')).toBe('a');
  });

  it('should remove other characters', () => {
    expect(pipe.transform("*&;—</a)_'  @")).toBe('a');
  });

  it('should not remove existing dashes', () => {
    expect(pipe.transform('a-b')).toBe('a-b');
  });

  it('should not have multiple adjacent dashes', () => {
    expect(pipe.transform('a     b  c')).not.toContain('--');
  });
});
