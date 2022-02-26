FROM node:16
RUN mkdir /my_app
COPY build /my_app
COPY package.json /my_app
WORKDIR /my_app
RUN npm install
EXPOSE 4000
CMD node index.js
