FROM jcrugzz/s6-node-alpine:12.16.1-native
# create a user that can run the application
# and define the maximum open files at 16k
RUN ulimit -n 65536 && \
    addgroup -g 9999 app && \
    adduser -D  -G app -s /bin/false -u 999 app

ENV HOME /home/app/
COPY docker/.npmrc /home/app/

RUN mkdir -p /home/app/{{{appName}}}
WORKDIR /home/app/{{{appName}}}
COPY package.json /home/app/{{{appName}}}/
COPY package-lock.json /home/app/{{{appName}}}/

RUN npm ci
COPY . /home/app/{{{appName}}}

RUN npm run build
RUN npm prune --production

RUN chown -R app:app /home/app/
COPY run.sh /etc/services.d/{{{appName}}}/run
RUN chmod 755 /etc/services.d/{{{appName}}}/run

EXPOSE 8080
