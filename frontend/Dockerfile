# Use Node.js LTS version for building React app
FROM node:18 AS build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend code
COPY . .

# Build the React app
RUN npm run build

# Use Nginx for serving the production build
FROM nginx:alpine

# Copy the build output to Nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy custom Nginx configuration (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose frontend port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
