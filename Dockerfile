FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY package-lock.json* ./

# Install ALL dependencies (including dev dependencies needed for build)
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set NODE_ENV for build
ENV NODE_ENV=production

# Build the application (needs dev dependencies like ts-node)
RUN npm run build

# Expose port
EXPOSE 9000

# Start the application
CMD ["npm", "start"]

