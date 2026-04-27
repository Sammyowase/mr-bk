export interface BPAPIResponse<T> {
  status: boolean;
  message: string;
  responseCode: number;
  data: T;
}
