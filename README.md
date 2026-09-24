# Calculator Web App

`src` contains a Vite + React + TypeScript calculator for Azure Static Web Apps.

## Local development

```powershell
Set-Location .\src
npm install
npm run dev
```

Run the focused tests and production build with:

```powershell
Set-Location .\src
npm test
npm run build
```

The production files are generated in `src/dist`. The later Static Web Apps GitHub
Actions workflow can use `src` as the app location and `dist` as the output location.

## End-to-end tests

Install the application and Playwright dependencies, then run the Edge-only test suite:

```powershell
Set-Location .\src
npm install
Set-Location ..
npm install
npm run test:e2e
```

## Azure infrastructure

[`Infra/main.bicep`](Infra/main.bicep) creates one Azure Static Web App on the
Standard plan. It targets an existing resource group and defaults to:

- Resource group selected by the deployment command: `rg-calc202609`
- Static Web App name: `calcweb202609`
- Azure region: `eastasia`

For example, after signing in to Azure, the resource can be provisioned with a
group-scope deployment:

```powershell
az deployment group create `
  --name calcweb202609-infra `
  --resource-group rg-calc202609 `
  --template-file .\Infra\main.bicep
```

The GitHub Actions workflow is intentionally separate from this template. That
workflow will need `id-token: write` and can authenticate with `azure/login` by
using the registered `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, and
`AZURE_SUBSCRIPTION_ID` secrets. The Azure identity must also have a matching
federated credential and permission to deploy to `rg-calc202609`.