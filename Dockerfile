# Use Node.js as the base image
FROM node:24-alpine

# Set the working directory
WORKDIR /app

# Copy only the build output folder
COPY build/ ./build/

# Set the working directory to the build folder
WORKDIR /app/build

# Expose the port the app runs on
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]
