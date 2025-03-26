# Use official Node.js image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port Cloud Run (or Docker) will use
EXPOSE 8080

# Start the app
CMD ["node", "index.js"]
