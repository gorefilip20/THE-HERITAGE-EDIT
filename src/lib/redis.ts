import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

const CART_PREFIX = "cart:";
const CART_TTL = 60 * 60 * 24 * 7; // 7 days

export async function getCartFromRedis(cartId: string): Promise<string | null> {
  return redis.get(`${CART_PREFIX}${cartId}`);
}

export async function setCartInRedis(
  cartId: string,
  data: string,
): Promise<void> {
  await redis.set(`${CART_PREFIX}${cartId}`, data, "EX", CART_TTL);
}

export async function deleteCartFromRedis(cartId: string): Promise<void> {
  await redis.del(`${CART_PREFIX}${cartId}`);
}
