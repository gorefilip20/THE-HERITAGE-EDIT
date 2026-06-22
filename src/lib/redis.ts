import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | null;
  redisAvailable: boolean;
};

let redisAvailable = globalForRedis.redisAvailable ?? true;

function createRedisClient(): Redis | null {
  try {
    const client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 2) {
          redisAvailable = false;
          globalForRedis.redisAvailable = false;
          console.warn(
            "[Redis] Connection failed after retries — falling back to direct database queries.",
          );
          return null;
        }
        return Math.min(times * 200, 1000);
      },
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 3000,
    });

    client.on("error", (err) => {
      if (redisAvailable) {
        redisAvailable = false;
        globalForRedis.redisAvailable = false;
        console.warn(
          `[Redis] Connection unavailable (${err.message}) — all cache operations will be skipped.`,
        );
      }
    });

    client.on("connect", () => {
      if (!redisAvailable) {
        console.info("[Redis] Connection restored — cache operations resumed.");
      }
      redisAvailable = true;
      globalForRedis.redisAvailable = true;
    });

    return client;
  } catch {
    console.warn("[Redis] Failed to initialize client — running without cache.");
    redisAvailable = false;
    globalForRedis.redisAvailable = false;
    return null;
  }
}

const redisClient: Redis | null = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redisClient;
  globalForRedis.redisAvailable = redisAvailable;
}

export function isRedisAvailable(): boolean {
  return redisAvailable && redisClient !== null;
}

export async function safeRedisGet(key: string): Promise<string | null> {
  if (!isRedisAvailable() || !redisClient) return null;
  try {
    return await redisClient.get(key);
  } catch {
    return null;
  }
}

export async function safeRedisSet(
  key: string,
  value: string,
  ttlSeconds: number,
): Promise<void> {
  if (!isRedisAvailable() || !redisClient) return;
  try {
    await redisClient.set(key, value, "EX", ttlSeconds);
  } catch {
    /* skip silently */
  }
}

export async function safeRedisDel(...keys: string[]): Promise<void> {
  if (!isRedisAvailable() || !redisClient || keys.length === 0) return;
  try {
    await redisClient.del(...keys);
  } catch {
    /* skip silently */
  }
}

export async function safeRedisKeys(pattern: string): Promise<string[]> {
  if (!isRedisAvailable() || !redisClient) return [];
  try {
    return await redisClient.keys(pattern);
  } catch {
    return [];
  }
}

export const redis = redisClient;

const CART_PREFIX = "cart:";
const CART_TTL = 60 * 60 * 24 * 7; // 7 days

export async function getCartFromRedis(cartId: string): Promise<string | null> {
  return safeRedisGet(`${CART_PREFIX}${cartId}`);
}

export async function setCartInRedis(
  cartId: string,
  data: string,
): Promise<void> {
  await safeRedisSet(`${CART_PREFIX}${cartId}`, data, CART_TTL);
}

export async function deleteCartFromRedis(cartId: string): Promise<void> {
  await safeRedisDel(`${CART_PREFIX}${cartId}`);
}
