# E-commerce Platform

A full-featured shopping cart e-commerce system with responsive PWA frontend, microservices backend, management portal, and Docker deployment.

## Features

### Customer Features
- 🛍️ Product browsing with search and filters
- 🛒 Shopping cart with real-time updates
- 💳 Secure checkout with Stripe integration
- 📦 Order tracking and history
- 👤 User accounts and profiles
- 📱 Progressive Web App (PWA) - installable and offline-capable
- 📱 Fully responsive design

### Admin Features
- 📊 Analytics dashboard with sales metrics
- 📦 Product management (CRUD operations)
- 🛍️ Order management with status updates
- 🚚 Delivery tracking and courier assignment
- 💰 Accounting and financial reports
- 👥 Customer management
- ⚙️ System settings and configuration

## Technology Stack

### Frontend
- **Customer PWA**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Admin Portal**: Next.js 15, React 19, TypeScript, TailwindCSS

### Backend
- **API**: FastAPI (Python)
- **Architecture**: Microservices
  - Auth Service
  - Product Service
  - Cart Service
  - Order Service
  - Payment Service
  - Delivery Service

### Infrastructure
- **Database**: PostgreSQL
- **Cache**: Redis
- **Reverse Proxy**: NGINX
- **Containerization**: Docker & Docker Compose

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Ecom
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start all services with Docker**
```bash
docker-compose up --build
```

4. **Access the applications**
- Customer Frontend: http://localhost:3100
- Admin Portal: http://localhost:3101
- API Gateway: http://localhost:8080/api

### Development Setup

#### Backend Services
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Admin Portal
```bash
cd admin
npm install
npm run dev
```

## Project Structure

```
Ecom/
├── frontend/           # Customer PWA (Next.js)
├── admin/             # Admin Portal (Next.js)
├── backend/           # Microservices (FastAPI)
│   ├── auth_service/
│   ├── product_service/
│   ├── cart_service/
│   ├── order_service/
│   ├── payment_service/
│   ├── delivery_service/
│   └── shared/        # Shared utilities
├── nginx/             # NGINX configuration
├── database/          # Database initialization scripts
├── docker-compose.yml
└── .env.example
```

## API Documentation

Once the services are running, access the interactive API documentation:
- Auth Service: http://localhost:8080/api/auth/docs
- Product Service: http://localhost:8080/api/products/docs
- Cart Service: http://localhost:8080/api/cart/docs
- Order Service: http://localhost:8080/api/orders/docs
- Payment Service: http://localhost:8080/api/payment/docs
- Delivery Service: http://localhost:8080/api/delivery/docs

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v --cov=.
```

### Frontend Tests
```bash
cd frontend
npm run test
npm run test:e2e
```

## Deployment

### Production Build
```bash
docker-compose -f docker-compose.prod.yml up --build -d
```

### Environment Configuration
Ensure you update the following in production:
- Database credentials
- JWT secret keys
- Stripe API keys
- SMTP configuration
- CORS origins
- SSL certificates for NGINX

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
