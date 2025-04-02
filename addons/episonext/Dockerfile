FROM node:16-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY dist/ ./dist/
COPY src/main/js/ ./src/main/js/

# Create config directory
RUN mkdir -p config

# Create logs directory
RUN mkdir -p logs

# Expose ports
EXPOSE 7000
EXPOSE 7001

# Set environment variables
ENV NODE_ENV=production
ENV APP_NAME=EpisoNext

# Set up healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7000/health || exit 1

# Run the application
CMD ["node", "dist/server.js"] 