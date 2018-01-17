export namespace Block {
  export namespace Data {
    export interface Base {
      readonly id: string;
    }

    export interface TextData extends Base {
      text: string;
    }

    export interface ImageData extends Base {
      url: string;
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
    <Block.Text>{ type: 'text', data: [] },
    <Block.Image>{ type: 'image', data: [] }
  ]
};
