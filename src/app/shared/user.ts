export interface TextUserData {
  index?: number;
  length?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  width?: number;
  height?: number;
}

export interface User {
  id: string;
  colour: string;
  current?: {
    pageId?: string;
    blockId?: string;
    data?: TextUserData;
  };
}
