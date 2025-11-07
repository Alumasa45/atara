FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install backend dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the backend application
RUN pnpm build

# Build frontend
WORKDIR /app/frontend

# Install frontend dependencies
RUN pnpm install --frozen-lockfile

# Build frontend with production environment
RUN VITE_API_BASE_URL=https://atara-dajy.onrender.com/api pnpm build

# Copy built frontend to backend public directory
WORKDIR /app
RUN mkdir -p /app/public
RUN if [ -d "/app/frontend/dist" ]; then cp -r /app/frontend/dist/* /app/public/; else echo "Frontend dist not found"; fi

# Create logs directory
RUN mkdir -p /app/applogs

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

# Use startup script that runs migrations then starts app
CMD ["./start.sh"]