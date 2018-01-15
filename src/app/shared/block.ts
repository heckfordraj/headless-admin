export namespace Block {
  export namespace Data {
    export interface TextData {
      text: string;
    }

    export interface ImageData {
      xs: string;
      sm: string;
      md: string;
      lg: string;
    }
  }

  export interface Base {
    readonly id: string;
    type: string;
    data: any[];
  }

  export interface Text extends Base {
    data: Data.TextData[];
  }

  export interface Image extends Base {
    data: Data.ImageData[];
  }
}

export const Blocks = {
  data: [
    <Block.Text>{ type: 'text', id: null, data: null },
    <Block.Image>{ type: 'image', id: null, data: null }
  ]
};
