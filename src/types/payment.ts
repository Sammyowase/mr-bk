export interface CreatePaymentSplitDto {
  name: string;
  split_code: string;
  propertyId: string;
}

export interface CreateFeeDto {
  type: string;
  rate: number;
}

export type UpdateFeeDto = {
  rate?: number | undefined;
};

export interface ResolvePendingResponse {
  total: number;
  success: number;
  failed: number;
  abandoned: number;
}
