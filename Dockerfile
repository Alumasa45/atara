FROM node:20-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install backend dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build the backend application
RUN pnpm build

# Create required directories
RUN mkdir -p /app/public /app/applogs

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

# Use startup script that runs migrations then starts app
CMD ["./start.sh"]