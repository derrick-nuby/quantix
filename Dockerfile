# Use Node.js LTS (Long Term Support) as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install yarn
RUN apk add --no-cache yarn

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the Next.js application
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["yarn", "start"]