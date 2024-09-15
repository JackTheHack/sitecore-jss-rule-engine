# XM Cloud Starter Kit (Next JS)

## QUICK START

1. In an ADMIN terminal:

    ```ps1
    .\init.ps1 -InitEnv -LicenseXmlPath "C:\path\to\license.xml" -AdminPassword "DesiredAdminPassword"
    ```

2. Restart your terminal and run:

    ```ps1
    .\up.ps1
    ```

3. Follow the instructions to [deploy to XM Cloud](#deploy-to-xmcloud)

4. Create Edge token and [query from edge](#query-edge)

*** 

## About this Solution
This solution is designed to help developers learn and get started quickly
with XMCLoud + SXA.

# Sitecore.JSS-Rule-Engine
Javascript library to parse Sitecore rules and run them in JS

# Accessing rules from GraphQL

Rule XML could be retrieved through GraphQL query to the item in Sitecore playground:
https://xmcloudcm.localhost/sitecore/api/graph/edge/ide

```
# Write your query or mutation here
{
 item(language:"en", path:"/sitecore/content/Home")
  {
    name,
    field(name:"Rules")
    {
      name,
      value
    }  
	}
}
```

# How to use
test.js contains unit tests (in Ava) with examples of rules being parsed and executed.

# Developer docs
https://github.com/JackTheHack/Sitecore.JSS-Rule-Engine/wiki




