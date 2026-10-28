FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# These tests use fixtures/mocks and never connect to a database.
RUN node tests/selector.test.js && npm run test:currency

# Expose the backend port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
