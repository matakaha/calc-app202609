# Calculator Web App

[![Pull request validation](https://github.com/matakaha/calc-app202609/actions/workflows/azure-static-web-apps.yml/badge.svg?event=pull_request)](https://github.com/matakaha/calc-app202609/actions/workflows/azure-static-web-apps.yml?query=event%3Apull_request)
[![Production deployment](https://github.com/matakaha/calc-app202609/actions/workflows/azure-static-web-apps.yml/badge.svg?branch=main&event=push)](https://github.com/matakaha/calc-app202609/actions/workflows/azure-static-web-apps.yml?query=branch%3Amain+event%3Apush)

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
workflow runs for pull requests targeting `main` and for pushes to `main`. Its
jobs are chained with `needs` to execute the following gates serially and stop
when any gate fails:

1. CodeQL code scanning for JavaScript and TypeScript
2. Dependency review, failing for vulnerabilities of any severity
3. The Playwright E2E test suite in `tests`

Pull request runs stop after validation. A push to `main`, including a merged
pull request, continues by building `src`, authenticating to Azure through OIDC,
retrieving and masking the deployment token for `calcweb202609`, and deploying
the prebuilt `src/dist` output with the official Azure Static Web Apps action.
The badges above link to the filtered workflow history for pull request
validation and production deployment.

The workflow requires these GitHub repository secrets:

- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_SUBSCRIPTION_ID`

The corresponding Microsoft Entra identity must have a federated credential
matching this repository and the `main` branch. The workflow grants the OIDC
permission only to its production deployment job. At the narrowest practical
Azure scope, the identity must also be allowed to read the deployment token for
`rg-calc202609`/`calcweb202609`, including the
`Microsoft.Web/staticSites/listSecrets/action` permission. GitHub Dependency
Graph and code scanning must be enabled for the repository; private repository
availability depends on the enabled GitHub security products.
