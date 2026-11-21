# ==========================================
# Multi-stage Production Dockerfile
# ==========================================

# Step 1: Build React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /build/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Step 2: Production Node Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Install backend dependencies (production only)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy backend application source
COPY backend/src ./backend/src

# Copy compiled frontend assets from builder stage
COPY --from=frontend-builder /build/frontend/dist ./frontend/dist

# Expose backend port
EXPOSE 5000

# Working directory set to backend
WORKDIR /app/backend

# Start backend server
CMD ["node", "src/server.js"]
