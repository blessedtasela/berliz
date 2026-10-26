/** Mirrors the backend `OrderDetailsRequest`. */
export interface OrderDetailsRequest {
  productId: number;
  quantity: number;
}

/** Mirrors the backend `OrderRequest`. */
export interface OrderRequest {
  id?: number;
  uuid?: string;
  name: string;
  email: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  postalCode: number;
  address: string;
  paymentMethod: string;
  orderDetails: OrderDetailsRequest[];
}

/** Mirrors the backend `OrderDetailsResponse`. */
export interface OrderDetailsResponse {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  subTotal: number;
}

/** Mirrors the backend `OrderResponse`. */
export interface OrderResponse {
  id: number;
  uuid: string;

  userId: number;
  userFirstname: string;
  userLastname: string;
  userEmail: string;

  orderDetails: OrderDetailsResponse[];

  name: string;
  email: string;
  contact: string;
  country: string;
  state: string;
  city: string;
  postalCode: number;
  address: string;
  paymentMethod: string;

  totalAmount: number;
  status: string;
  date: Date;
  lastUpdate: Date;

  /** null (never checked out) | UNPAID | PAID | REFUNDED. */
  paymentStatus: string | null;
  amountPaid: number | null;

  message?: string;
}
