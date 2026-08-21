const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const shopifyEndpoint = `https://${domain}/api/2024-01/graphql.json`;

async function shopifyFetch<T>(query: string, variables = {}): Promise<T> {
  const response = await fetch(shopifyEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const json = await response.json();

  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

export async function getProducts(first = 50, after?: string, query?: string) {
  const gqlQuery = `
    query GetProducts($first: Int!, $after: String, $query: String) {
      products(first: $first, after: $after, query: $query) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            description
            images(first: 1) {
              edges {
                node {
                  id
                  url
                  altText
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  weight
                  weightUnit
                }
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            casNumber: metafield(namespace: "custom", key: "cas_number") {
              value
            }
            hsnCode: metafield(namespace: "custom", key: "hsn_code") {
              value
            }
          }
        }
      }
    }
  `;

  return shopifyFetch<any>(gqlQuery, { first, after, query });
}

export async function createCart() {
  const mutation = `
    mutation CreateCart {
      cartCreate {
        cart {
          id
          checkoutUrl
          totalQuantity
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation);
}

export async function addToCart(cartId: string, merchandiseId: string, quantity: number) {
  const mutation = `
    mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
          estimatedCost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation, {
    cartId,
    lines: [{ merchandiseId, quantity }],
  });
}

export async function getCart(cartId: string) {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    handle
                  }
                  price {
                    amount
                    currencyCode
                  }
                  weight
                  weightUnit
                }
              }
            }
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  return shopifyFetch<any>(query, { cartId });
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  const mutation = `
    mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          totalQuantity
          lines(first: 100) {
            edges {
              node {
                id
                quantity
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
}

export async function removeFromCart(cartId: string, lineId: string) {
  const mutation = `
    mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          totalQuantity
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation, {
    cartId,
    lineIds: [lineId],
  });
}

export async function customerLogin(email: string, password: string) {
  const mutation = `
    mutation CustomerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation, {
    input: { email, password },
  });
}

export async function customerCreate(email: string, password: string, firstName: string, lastName: string, phone: string) {
  const mutation = `
    mutation CustomerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
          firstName
          lastName
          phone
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `;

  return shopifyFetch<any>(mutation, {
    input: {
      email,
      password,
      firstName,
      lastName,
      phone,
      acceptsMarketing: false,
    },
  });
}

export async function getCustomer(accessToken: string) {
  const query = `
    query GetCustomer($accessToken: String!) {
      customer(customerAccessToken: $accessToken) {
        id
        email
        firstName
        lastName
        phone
        defaultAddress {
          id
          address1
          address2
          city
          province
          country
          zip
        }
      }
    }
  `;

  return shopifyFetch<any>(query, { accessToken });
}
