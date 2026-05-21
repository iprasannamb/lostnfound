# ER Diagram & Relationships

- `users` (1) — (M) `lost_items` by `user_id`
- `users` (1) — (M) `found_items` by `user_id`
- `users` (1) — (M) `claims` by `user_id`
- `categories` (1) — (M) `lost_items` and `found_items` via `category_id`

Notes:
- `lost_items` and `found_items` are separate tables to model the domain clearly (date_lost vs date_found, different workflows).
- `claims` references `item_type` and `item_id` (polymorphic reference). In a strict relational design you can split claims into `lost_claims` and `found_claims`; the polymorphic approach keeps the UI simpler but requires careful validation and joins.
