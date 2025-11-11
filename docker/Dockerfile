FROM node:20-bullseye-slim AS base
WORKDIR /app

# Install all dependencies (dev + prod) for dev workflow
COPY package*.json ./
RUN npm install

# Install Playwright browser binaries and dependencies
RUN npx playwright install --with-deps chromium

# Copy source
COPY . .

ENV NODE_ENV=development
EXPOSE 3000
# For dev compose we run the Next.js dev server
CMD ["npm", "run", "dev"]
