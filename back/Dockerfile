FROM node:14.4.0
WORKDIR '/app'

RUN wget -O /tmp/phantomjs-2.1.1-linux-x86_64.tar.bz2 https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
RUN mkdir /tmp/phantomjs && mkdir -p /usr/local/lib/node_modules/phantomjs/lib/phantom/
RUN tar xvjf /tmp/phantomjs-2.1.1-linux-x86_64.tar.bz2 -C /tmp/phantomjs
RUN mv /tmp/phantomjs/phantomjs-2.1.1-linux-x86_64/* /usr/local/lib/node_modules/phantomjs/lib/phantom/
RUN rm -rf /tmp/phantomjs-2.1.1-linux-x86_64.tar.bz && rm -rf /tmp/phantomjs

COPY ./fonts /usr/share/fonts
COPY ./fonts /usr/local/share/fonts

COPY ./package.json ./
RUN npm install
COPY src .
RUN ls
CMD ["npm", "start"]