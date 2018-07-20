import { HumanizePipe } from './humanize.pipe';

describe('HumanizePipe', () => {
  let pipe: HumanizePipe;

  beforeEach(() => (pipe = new HumanizePipe()));

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  it('should convert dashes to spaces', () => {
    expect(pipe.transform('a-bc-d—e')).not.toContain('-');
  });

  it('should convert multiple dashes to spaces', () => {
    expect(pipe.transform('a-bc--d—--e')).not.toContain('-');
  });

  it('should capitalise every word with spaces', () => {
    expect(pipe.transform('a title')).toBe('A Title');
  });

  it('should capitalise every word with dashes', () => {
    expect(pipe.transform('a-new-title')).toBe('A New Title');
  });

  it('should remove whitespace from start', () => {
    expect(pipe.transform(' A')).toBe('A');
  });

  it('should remove whitespace from end', () => {
    expect(pipe.transform('A ')).toBe('A');
  });

  it('should remove dash from start', () => {
    expect(pipe.transform('-A')).toBe('A');
  });

  it('should remove dash from end', () => {
    expect(pipe.transform('A-')).toBe('A');
  });

  it('should not have double spaces', () => {
    expect(pipe.transform('a----b--c--d----')).not.toContain('  ');
  });
});
