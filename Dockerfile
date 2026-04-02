# Dockerfile for Google Cloud Backend Deployment
FROM node:20-slim

# Install FFmpeg
RUN apt-get update && \
    apt-get install -y ffmpeg && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy backend files
COPY backend.package.json package.json
COPY package-lock.json .
COPY server.ts .
COPY server/ server/
COPY tsconfig.json .
COPY ethiopia_stations.json .
COPY metadata.json .

# Install dependencies
RUN npm ci --only=production

# Create recordings directory
RUN mkdir -p recordings logs

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "--import", "tsx", "server.ts"]
