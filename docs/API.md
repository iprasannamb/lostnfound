# API Documentation

Base URL: `/api`

Auth
- POST `/auth/register` — body: `{name,email,password}`
- POST `/auth/login` — body: `{email,password}` → returns `{token}`

Lost Items
- GET `/lost-items` — list (query: `page`, `limit`, `category`)
- POST `/lost-items` — auth required; form-data: `title,description,category_id,date_lost,location_lost,contact_info,image`

Found Items
- GET `/found-items` — list (query: `page`, `limit`, `category`)
- POST `/found-items` — auth required; form-data: `title,description,category_id,date_found,location_found,contact_info,image`

Claims
- POST `/claims` — auth required; form-data: `item_type ('lost'|'found'), item_id, details, proof`

Authentication: send header `Authorization: Bearer <token>`

Errors: JSON `{message: '...'}` with appropriate HTTP status codes
