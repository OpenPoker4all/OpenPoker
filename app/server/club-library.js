// SPDX-License-Identifier: AGPL-3.0-only
export function clubLibrary(db, owner, now = new Date().toISOString()) {
  return db.prepare(`SELECT p.id,p.name,p.summary,p.category FROM marketplace_products p
    WHERE EXISTS (SELECT 1 FROM marketplace_entitlements e WHERE e.product_id=p.id AND e.user_id=?
      AND e.status='active' AND (e.expires_at IS NULL OR e.expires_at>?))
    OR EXISTS (SELECT 1 FROM marketplace_paid_access a JOIN marketplace_orders o ON o.id=a.order_id
      WHERE a.product_id=p.id AND a.user_id=? AND a.status='active' AND o.status='paid'
      AND a.starts_at<=? AND (a.expires_at IS NULL OR a.expires_at>?))
    ORDER BY p.name,p.id`).all(owner,now,owner,now,now);
}
export function clubOrders(db,owner){
  return db.prepare(`SELECT o.id,p.name,o.status,o.price_cents,o.currency,o.created_at FROM marketplace_orders o
    JOIN marketplace_products p ON p.id=o.product_id WHERE o.buyer_user_id=? ORDER BY o.created_at DESC,o.id DESC`).all(owner);
}
