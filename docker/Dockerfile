FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies separately for better layer caching
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY . .

# Build (Next.js standalone output could be configured later)
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
