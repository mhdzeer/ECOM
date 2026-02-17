#!/bin/bash

# E-commerce Platform Quick Start Script

echo "========================================="
echo "E-commerce Platform - Quick Start"
echo "========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before proceeding"
    echo "   Especially update:"
    echo "   - POSTGRES_PASSWORD"
    echo "   - JWT_SECRET"
    echo "   - STRIPE_SECRET_KEY"
    echo ""
    read -p "Press Enter to continue after editing .env file..."
fi

echo "🚀 Starting E-commerce Platform..."
echo ""

# Build and start all services
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "========================================="
echo "✅ E-commerce Platform is running!"
echo "========================================="
echo ""
echo "🌐 Access the applications:"
echo "   Customer Frontend: http://localhost:3100"
echo "   Admin Portal:      http://localhost:3101"
echo "   API Gateway:       http://localhost:8080/api"
echo ""
echo "📚 API Documentation:"
echo "   Auth Service:      http://localhost:8080/api/auth/docs"
echo "   Product Service:   http://localhost:8080/api/products/docs"
echo "   Cart Service:      http://localhost:8080/api/cart/docs"
echo "   Order Service:     http://localhost:8080/api/orders/docs"
echo "   Payment Service:   http://localhost:8080/api/payment/docs"
echo "   Delivery Service:  http://localhost:8080/api/delivery/docs"
echo ""
echo "👤 Default Admin Credentials:"
echo "   Email:    admin@ecommerce.com"
echo "   Password: admin123"
echo ""
echo "📝 View logs: docker-compose logs -f [service-name]"
echo "🛑 Stop all:  docker-compose down"
echo ""
