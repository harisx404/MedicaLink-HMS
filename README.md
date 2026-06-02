# MedicaLink HMS

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

An enterprise-grade, multi-tenant Hospital Management System (SaaS) engineered to streamline clinical, administrative, and patient workflows. Built with a highly scalable Turborepo architecture.

## 🚀 Architecture

This project is built utilizing a modern MERN stack monorepo architecture:

- **Frontend (`apps/web`)**: React 18, Vite, Redux Toolkit, React Router v7, Tailwind CSS v3, and shadcn/ui.
- **Backend (`apps/api`)**: Node.js, Express, strict TypeScript, Mongoose, and Redis for caching.
- **Shared Packages (`packages/shared`)**: Shared TypeScript interfaces, types, and configurations across the monorepo to ensure end-to-end type safety.

## ✨ Core Features

- **Multi-Tenant SaaS**: Complete data isolation for individual hospitals (tenants).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for Super Admins, Doctors, Nurses, Receptionists, and Patients.
- **Real-time Engine**: WebSocket integration via Socket.io for instant notifications and live messaging.
- **Performance Optimized**: Redis caching layer and Turborepo remote build caching.
- **Modern UI/UX**: Professionally designed interface using Tailwind CSS and Radix UI primitives.

## 🛠️ Local Development Setup

### Prerequisites
- Node.js (v20+)
- [pnpm](https://pnpm.io/) (v9+)
- Docker & Docker Compose

### Getting Started

1. **Start the Infrastructure**  
   Spin up the local MongoDB and Redis instances using Docker:
   ```bash
   docker-compose up -d
   ```

2. **Install Dependencies**  
   Install all monorepo dependencies from the root directory:
   ```bash
   pnpm install
   ```

3. **Start the Development Servers**  
   Run both the frontend and backend concurrently:
   ```bash
   pnpm run dev
   ```

- The React frontend will be available at `http://localhost:3000`
- The Express API will be available at `http://localhost:5000`

---
*Built with modern engineering standards for high availability and strict type safety.*
