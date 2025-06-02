## 📦 pc-marketplace

A fullstack web application for buying, selling, and building PCs.

This project supports:

* 🏪 Official store inventory (first-party products)
* 👤 User listings (third-party marketplace)
* 🧩 Custom PC builds from real products
* 🔄 Built with Django REST Framework & Next.js

---

### 🛠 Tech Stack

| Layer    | Tech                                                            |
| -------- | --------------------------------------------------------------- |
| Frontend | [Next.js](https://nextjs.org/)                                  |
| Backend  | [Django REST Framework](https://www.django-rest-framework.org/) |
| Auth     | Django User (JWT planned)                                       |
| Styling  | Tailwind CSS                                                    |
| API Comm | Axios                                                           |

---

### 🚀 Features

* Product listings: both official & user-submitted
* Categories and component types
* JSON-based specs for flexible product detail
* PC build creator with compatibility logic
* Admin panel for managing data

---

### 📂 Project Structure

```
pc-marketplace/
├── backend/       # Django API
│   ├── marketplace/  # App for products, builds, users
│   └── manage.py
├── frontend/      # Next.js frontend
│   ├── pages/
│   ├── components/
│   └── public/
```

---

### 🧪 Local Setup

#### Backend (Django)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
```

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

### 📌 API Endpoints (Sample)

| Method | Endpoint           | Description          |
| ------ | ------------------ | -------------------- |
| GET    | `/api/products/`   | List all products    |
| POST   | `/api/builds/`     | Create a PC build    |
| GET    | `/api/components/` | List component types |
| POST   | `/api/users/`      | Register a new user  |
