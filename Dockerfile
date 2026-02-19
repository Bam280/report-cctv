FROM node:18

WORKDIR /app

COPY package*.json ./
# Use --legacy-peer-deps to bypass React 19 vs React 18 peer dependency conflicts
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
