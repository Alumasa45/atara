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

# Create logs directory
RUN mkdir -p /app/applogs

# Build the application
RUN pnpm build

# Copy start script
COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 3000

# Use startup script that runs migrations then starts app
CMD ["./start.sh"]