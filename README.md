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