## 📦 pc-marketplace

A fullstack web application for buying, selling, and building PCs.

This project supports:

* 🏪 Official store inventory and 👤 community listings in one marketplace
* 🧩 A slot-based PC builder with live compatibility checking (socket, memory, power)
* 🛠 Admin-driven content: homepage sections, site settings, categories, and products
* 💬 Buyer/seller messaging and saveable builds per user
* 🔐 JWT authentication

---

### 🧱 Tech Stack

| Layer    | Tech                                              |
| -------- | ------------------------------------------------- |
| Frontend | Next.js 15 (App Router), Tailwind CSS v4, Axios   |
| Backend  | Django 4.2, Django REST Framework                 |
| Auth     | SimpleJWT (access / refresh tokens)               |
| Database | SQLite (development)                              |

---

### 🚀 Features

* **Dynamic storefront** — products, categories, and component slots served from the API with search, price, seller, and slot filters plus pagination.
* **PC Builder** — one part per slot with a live system check that flags CPU/motherboard socket mismatches, memory-type conflicts, case fit, and power-supply headroom, then totals price and estimated wattage. Builds save to your profile.
* **Admin-editable content** — the homepage hero, promo sections, site settings, categories, component types, and the full product catalog are all managed from the Django admin. Nothing on the storefront is hardcoded.
* **User listings** — post a part for sale, including optional compatibility data so it works in the builder.
* **Messaging** — threaded conversations between buyers and sellers about a listing.

---

### 📂 Project Structure

```
pc-marketplace/
├── backend/                     # Django API
│   └── marketplace/
│       ├── models.py            # Catalog, builds, messages, site content
│       ├── compatibility.py     # Builder compatibility engine
│       ├── serializers.py
│       ├── views.py             # ViewSets + build validation endpoint
│       ├── permissions.py       # Owner-scoped write access
│       └── management/commands/seed.py
└── frontend/                    # Next.js App Router
    ├── app/                     # /, /products, /products/[slug], /builder,
    │                            # /listings/new, /messages, /profile, /login, /register
    ├── components/              # Navbar, Footer, ProductCard, states
    └── lib/                     # api client, Auth / Site / Build contexts
```

---

### 🧪 Local Setup

#### Backend (Django)

Requires Python 3.10+ (the admin uses [django-unfold](https://github.com/unfoldadmin/django-unfold)).

```bash
cd backend
python -m venv venv
venv\Scripts\activate            # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed            # load catalog, homepage, and site settings
python manage.py createsuperuser # for the admin at /admin
python manage.py runserver
```

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend reads the API base URL from `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_MEDIA_URL=http://127.0.0.1:8000
```

---

### 🔌 API Endpoints

| Method | Endpoint                     | Description                          |
| ------ | ---------------------------- | ------------------------------------ |
| GET    | `/api/products/`             | List products (filters + pagination) |
| GET    | `/api/products/{slug}/`      | Product detail                       |
| GET    | `/api/categories/`           | Categories                           |
| GET    | `/api/components/`           | Component types (with builder slots) |
| POST   | `/api/builds/validate/`      | Compatibility check for a part set   |
| GET/POST | `/api/builds/`             | Saved builds (auth)                  |
| GET/POST | `/api/messages/`           | Messages (auth)                      |
| GET    | `/api/site-settings/`        | Site settings singleton              |
| GET    | `/api/homepage-sections/`    | Homepage sections                    |
| POST   | `/api/token/`                | Obtain JWT access/refresh            |
| POST   | `/api/users/`                | Register a new user                  |

---

### 🛠 Admin

Everything the storefront displays is editable at `/admin`: site settings, homepage
sections, categories, component types (and their builder slot), and products. Changes
appear on the frontend on next load.
