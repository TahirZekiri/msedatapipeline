# //homework4/Dockerfile
FROM node:18 as builder

WORKDIR /usr/src/app

# Installing dependencies for the front-end
COPY frontEnd/package*.json ./frontEnd/
RUN cd frontEnd && npm install --legacy-peer-deps

COPY frontEnd ./frontEnd/
RUN cd frontEnd && npm run build

# Stage 2: Serving the front-end and microservices
FROM node:18

WORKDIR /usr/src/app

# Installing dependencies for microservices
COPY package*.json ./
RUN npm install

COPY --from=builder /usr/src/app/frontEnd/out ./frontEnd/out

COPY microservices ./microservices

# Exposing the ports for front-end and microservices
EXPOSE 3013 5011 5012

ENV NEXT_PUBLIC_API_URL=http://mstock-operations:5011/api
ENV NEXT_PUBLIC_PIPELINE_URL=http://data-pipeline:5012/api

CMD ["npm", "start"]