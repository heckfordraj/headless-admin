export interface TextData {
  user: string;
  ops: Quill.DeltaOperation[];
}

export interface Content {
  readonly id: string;
  title: string;
  data: TextData[];
}
