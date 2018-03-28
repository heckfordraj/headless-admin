export namespace Block {
  export namespace Data {
    export interface Base {
      readonly id: string;
      [data: string]: any;
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
    order: number;
  }

  export interface Text extends Base {
    data: Data.TextData[];
  }
}

export const Blocks = {
  data: [<Block.Text>{ type: 'text', data: [] }, <Block.Base>{ type: 'image' }]
};
