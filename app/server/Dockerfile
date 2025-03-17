FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Install netcat for database connection check
RUN apk add --no-cache netcat-openbsd

# Make the startup script executable
RUN chmod +x ./startup.sh

EXPOSE 3000

# Run the startup script
CMD ["./startup.sh"] 