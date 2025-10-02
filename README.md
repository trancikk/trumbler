# Trumbler

A platform to sell image and video-oriented content with support for multiple user roles, subscriptions, and various payment methods.

## Features

### User Roles
- **Content Creators**: Upload video/image content, set prices, manage tags/categories, configure payout methods
- **Viewers**: Purchase individual content or monthly subscriptions
- **Anonymous Users**: Browse and preview content (must register to purchase)

### Key Capabilities
- Content upload with preview generation
- Tag and category management
- Individual content purchases
- Monthly subscription model
- Payment processing via Stripe (cards) and crypto
- Creator payout configuration (PayPal, crypto addresses)

## Tech Stack

### Backend
- Node.js + Express + TypeScript
- Prisma ORM with PostgreSQL
- JWT authentication
- Stripe payment integration
- Multer for file uploads

### Frontend
- React + TypeScript
- Vite for build tooling
- React Router for navigation
- Axios for API calls

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payment processing)

### Installation

1. Clone the repository
```bash
git clone https://github.com/trancikk/trumbler.git
cd trumbler
```

2. Install dependencies
```bash
npm install
```

3. Set up the database
```bash
cd packages/backend
cp .env.example .env
# Edit .env with your database credentials and API keys
npm run prisma:generate
npm run prisma:migrate
```

4. Start the development servers
```bash
# From the root directory
npm run dev
```

The backend will run on http://localhost:3001 and the frontend on http://localhost:3000.

## Project Structure

```
trumbler/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   └── App.tsx
│       └── package.json
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Content
- `GET /api/content` - List all content (with filters)
- `GET /api/content/:id` - Get content details
- `POST /api/content` - Upload content (creators only)
- `PUT /api/content/:id` - Update content (creators only)
- `DELETE /api/content/:id` - Delete content (creators only)

### Purchases
- `POST /api/purchases` - Purchase content
- `GET /api/purchases/my-purchases` - Get user purchases

### Subscriptions
- `POST /api/subscriptions` - Create subscription
- `GET /api/subscriptions/my-subscription` - Get user subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile/creator` - Update creator profile

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/trumbler"
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
UPLOAD_DIR="./uploads"
```

## License

MIT