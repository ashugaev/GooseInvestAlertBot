FROM node:15

WORKDIR /app

COPY dist/ ./dist
COPY locales/ ./locales
COPY package.json .
# only for local start
COPY *.env .

RUN npm i --legacy-peer-deps

# Add volume
VOLUME ["/app/logs"]

#RUN mkdir logs -p && mkdir logs/bot -p

#RUN mkdir logs && chmod -R 777 logs/

# for debugging
RUN apt-get update && apt-get install nano curl -y

# start programm
CMD npm start
