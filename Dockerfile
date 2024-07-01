# Use a base image with Node.js pre-installed
FROM node:18

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install backend dependencies
RUN npm install --production

# Copy the rest of the backend code
COPY . .

# Expose the port your backend app runs on
EXPOSE 80

# Command to run your backend server
CMD ["npm", "run", "start"]