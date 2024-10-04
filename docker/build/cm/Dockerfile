# escape=`

ARG PARENT_IMAGE
ARG SOLUTION_IMAGE
ARG RULEENGINE_IMAGE
ARG TOOLS_IMAGE

FROM ${TOOLS_IMAGE} as tools
FROM ${RULEENGINE_IMAGE} as ruleengine
FROM ${PARENT_IMAGE}


SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

WORKDIR C:\inetpub\wwwroot

# Copy developer tools and entrypoint
COPY --from=tools C:\tools C:\tools
COPY --from=ruleengine C:\itempackages C:\inetpub\wwwroot\App_Data\items\master


