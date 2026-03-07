/**
 * Order-related constants.
 */

export const OrderStatus = {
  PENDING: 'pending',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
  PARTIALLY_FILLED: 'partially_filled'
} as const;

export const OrderSide = {
  BUY: 'buy',
  SELL: 'sell'
} as const;

export const OrderType = {
  MARKET: 'market',
  LIMIT: 'limit'
} as const;

export type OrderStatusType = (typeof OrderStatus)[keyof typeof OrderStatus];
export type OrderSideType = (typeof OrderSide)[keyof typeof OrderSide];
export type OrderTypeType = (typeof OrderType)[keyof typeof OrderType];
