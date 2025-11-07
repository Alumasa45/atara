FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend with production environment variables
WORKDIR /app/frontend
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm install --frozen-lockfile
RUN pnpm build

# Copy built frontend to backend public directory
WORKDIR /app
RUN mkdir -p /app/public
RUN cp -r /app/frontend/dist/* /app/public/

# Create logs directory
RUN mkdir -p /app/applogs

# Build the backend application
RUN pnpm build

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

# Use startup script that runs migrations then starts app
CMD ["./start.sh"]