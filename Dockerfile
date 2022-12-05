FROM node:16

WORKDIR /app

COPY . .

RUN npm i --legacy-peer-deps

#RUN mkdir logs -p && mkdir logs/bot -p

#RUN mkdir logs && chmod -R 777 logs/

# for debugging
RUN apt-get update && apt-get install nano curl -y

# start programm
CMD npm start
