-- Convert existing catalog rows to the platform's NGN denomination.
-- Product/order amounts already use two-decimal minor units (kobo); this changes
-- the currency code only. Historical Order.currency values are intentionally kept.
UPDATE products
SET currency = 'NGN'
WHERE currency IS DISTINCT FROM 'NGN';
