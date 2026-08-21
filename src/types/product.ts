export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  casNumber: string;
  hsnCode: string;
  images: {
    id: string;
    url: string;
    altText: string | null;
  }[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
}

export interface ProductVariant {
  id: string;
  title: string;
  price: {
    amount: string;
    currencyCode: string;
  };
  availableForSale: boolean;
  quantityAvailable: number;
  weight: number;
  weightUnit: string;
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: CartLine[];
  cost: {
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
  };
  estimatedTotalWeight: number;
}

export interface CartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: {
      title: string;
      handle: string;
    };
    price: {
      amount: string;
      currencyCode: string;
    };
  };
}
