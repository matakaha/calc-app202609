# Azure Deployment Plan

## Status

Validated

## Objective

Create one Azure Static Web App with Bicep in the existing `rg-calc202609`
resource group.

## Azure Context

- Subscription: `ME-MngEnvMCAP989261-matakaha-2`
  (`2d478ba1-771f-4cc1-89ed-fd671a6881d5`), selected by the later GitHub Actions
  workflow through `AZURE_SUBSCRIPTION_ID`
- Resource group: `rg-calc202609` (existing; not created by this template)
- Location: `eastasia`

## Architecture

| Resource | Name | SKU | Quantity |
| --- | --- | --- | --- |
| Azure Static Web Apps | `calcweb202609` | Standard | 1 |

The Static Web App uses its public default HTTPS endpoint. The template does not
configure repository integration, a custom domain, an API backend, authentication,
managed identity, Application Insights, Log Analytics, or other monitoring
resources.

## Infrastructure

- Deployment scope: resource group
- Template: `Infra/main.bicep`
- Static Web App API: `Microsoft.Web/staticSites@2025-03-01`
- Parameters:
  - `staticWebAppName`, default `calcweb202609`
  - `location`, default `eastasia`
- Outputs:
  - Static Web App resource ID
  - Default hostname
  - Default HTTPS URL

## GitHub Actions and OIDC Boundary

The GitHub Actions workflow is intentionally outside this change. A later workflow
will authenticate with `azure/login` by using `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, and `AZURE_SUBSCRIPTION_ID`, then run a group-scope deployment
against `rg-calc202609`.

The Azure identity must have a matching GitHub federated credential and sufficient
RBAC at the resource group or a parent scope. The workflow must grant
`id-token: write`.

## Planned Changes

1. Add the minimal Bicep template under `Infra/`.
2. Document the template and deployment boundary in the root README.
3. Compile and inspect the generated ARM template.
4. Hand off to Azure validation without deploying resources.

## Validation

- Compile and lint `Infra/main.bicep`.
- Verify exactly one `Microsoft.Web/staticSites` resource is generated.
- Verify the generated resource uses the Standard SKU.
- Verify no excluded resources or GitHub workflow files are introduced.
- Do not execute an Azure deployment.

### Preparation Results

- Bicep compilation: passed
- Editor diagnostics: no errors
- Generated resource count: 1
- Generated resource: `Microsoft.Web/staticSites@2025-03-01`
- Generated SKU: `Standard` / `Standard`
- Generated outputs: `staticWebAppResourceId`, `defaultHostname`, `defaultUrl`

### All validation checks pass

- [x] 1. Core validation (Azure CLI, authentication, Bicep build, resource-group
      validation, and what-if) using `Infra/main.bicep` against `rg-calc202609`
- [x] 2. Bicep linting
- [x] 3. Azure Policy validation

## Role Assignment Verification

- Status: Verified; no application identity or role assignment is required
- Identities checked: none declared by this template
- Roles confirmed: none declared by this template
- Deployment identity prerequisite: the later GitHub OIDC identity must have
  sufficient management-plane permissions on `rg-calc202609` or a parent scope

## Section 7: Validation Proof

| Check | Command or method | Result |
| --- | --- | --- |
| Bicep core validation | `validate-deployment.ps1 -Scope group -ResourceGroup rg-calc202609 -Template .\Infra\main.bicep -Subscription 2d478ba1-771f-4cc1-89ed-fd671a6881d5` | PASS: authenticated, compiled, Azure validation passed, what-if passed |
| What-if summary | Azure CLI group-scope what-if | Create: 2, Modify: 0, Delete: 0 |
| Bicep lint | `az bicep lint --file .\Infra\main.bicep` | PASS: no lint diagnostics |
| Azure Policy | Policy assignments at the target resource-group scope plus Azure deployment validation | PASS: no policy conflict blocked validation or what-if |
| Static RBAC review | Search of `Infra/*.bicep` for identities and role assignments | PASS: none required or declared |
| Application build | `npm run build --prefix .\src` | PASS: TypeScript and Vite production build completed |
| Editor diagnostics | VS Code Problems check for Bicep and README | PASS: no errors |

The first online validation attempt used the local Azure CLI default subscription,
where `rg-calc202609` does not exist. Azure Resource Graph located the resource
group in `ME-MngEnvMCAP989261-matakaha-2`; rerunning with that subscription
explicitly produced the passing results above.

## References

- [Microsoft.Web staticSites 2025-03-01](https://learn.microsoft.com/azure/templates/microsoft.web/2025-03-01/staticsites)
- [Deploy to Azure infrastructure with GitHub Actions](https://learn.microsoft.com/devops/deliver/iac-github-actions)
