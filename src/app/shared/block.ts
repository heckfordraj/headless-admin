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
    readonly timestamp: string;
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
    <Block.Text>{ type: 'text', data: [] },
    <Block.Image>{ type: 'image', data: [] }
  ]
};
