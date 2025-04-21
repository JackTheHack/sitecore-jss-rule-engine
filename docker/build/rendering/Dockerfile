# escape=`

#
# Development-only image for running Next.js in a containerized environment.
# Assumes that the Next.js rendering host source is mounted to c:\app.
#

ARG PARENT_IMAGE
FROM $PARENT_IMAGE

ARG NODEJS_VERSION

USER ContainerAdministrator
WORKDIR c:\build
RUN curl.exe -sS -L -o node.zip https://nodejs.org/dist/v%NODEJS_VERSION%/node-v%NODEJS_VERSION%-win-x64.zip
RUN tar.exe -xf node.zip -C C:\
RUN move C:\node-v%NODEJS_VERSION%-win-x64 c:\node
RUN del node.zip

RUN SETX /M PATH "%PATH%;C:\node\"
RUN icacls.exe C:\node\ /grant "Authenticated Users":(F) /t
USER ContainerUser

WORKDIR /app

EXPOSE 3000
#ENTRYPOINT "npm install && npm install next@canary && yarn run start:connected"
ENTRYPOINT "npm install && npm run start:connected"