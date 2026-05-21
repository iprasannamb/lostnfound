# Sample SQL Queries for Demo / Viva

1) List all items (lost + found) using the view:

```sql
SELECT * FROM vw_items ORDER BY created_at DESC LIMIT 20;
```

2) Find matching found items by category and location (simple example):

```sql
SELECT fi.* FROM found_items fi
JOIN categories c ON fi.category_id = c.id
WHERE c.name = 'Keys' AND fi.location_found LIKE '%Cafeteria%';
```

3) Aggregate: items reported per category:

```sql
SELECT c.name, COUNT(li.id) AS lost_count
FROM categories c
LEFT JOIN lost_items li ON li.category_id = c.id
GROUP BY c.id, c.name;
```

4) Transaction example: accept a claim and mark found item as claimed

```sql
START TRANSACTION;
UPDATE claims SET status='accepted' WHERE id = 5;
UPDATE found_items SET status='claimed' WHERE id = 7;
COMMIT;
```

5) Nested query: show users who have more than one report:

```sql
SELECT u.id,u.name, (
  SELECT COUNT(*) FROM lost_items li WHERE li.user_id=u.id
) as lost_count
FROM users u
HAVING lost_count > 1;
```
