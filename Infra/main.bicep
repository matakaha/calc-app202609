targetScope = 'resourceGroup'

@description('Name of the Azure Static Web App.')
@minLength(1)
param staticWebAppName string = 'calcweb202609'

@description('Azure region for the Static Web App.')
@minLength(1)
param location string = 'eastasia'

resource staticWebApp 'Microsoft.Web/staticSites@2025-03-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Standard'
    tier: 'Standard'
  }
  properties: {
    publicNetworkAccess: 'Enabled'
  }
}

output staticWebAppResourceId string = staticWebApp.id
output defaultHostname string = staticWebApp.properties.defaultHostname
output defaultUrl string = 'https://${staticWebApp.properties.defaultHostname}'
