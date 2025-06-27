# Dockerfile
FROM node:18-slim

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Run the application
CMD ["node", "server.js"]