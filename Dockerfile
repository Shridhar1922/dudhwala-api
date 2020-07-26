FROM keymetrics/pm2:latest-stretch

COPY src /api/src

COPY public /api/public/

COPY *.json /api/

COPY ecosystem.config.js /api/

WORKDIR /api

ENV NPM_CONFIG_LOGLEVEL warn

RUN npm install

RUN npm run build

# RUN apk update && apk add bash

RUN ls -al

EXPOSE 3000

CMD [ "pm2-runtime", "start", "ecosystem.config.js" ]
