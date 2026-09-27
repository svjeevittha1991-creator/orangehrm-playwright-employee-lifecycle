# OrangeHRM Employee Lifecycle Automation

Playwright + TypeScript implementation of the QA Automation Technical Assessment for the public OrangeHRM demo application.

## What is covered

The end-to-end test in `tests/employee-lifecycle.spec.ts` performs the complete employee lifecycle:

1. Logs in with configurable demo credentials and verifies the Dashboard.
2. Adds a data-driven employee from `test-data/employee.json`.
3. Uploads a profile picture fixture.
4. Searches for the employee by Employee ID.
5. Updates Job Title and Employment Status.
6. Verifies the updated fields in the UI.
7. Cross-checks the employee with OrangeHRM's authenticated REST API.
8. Deletes the employee and verifies absence in both the UI and API.
9. Logs out and verifies the login page is displayed again.

The Employee ID includes a runtime suffix so rerunning the test does not collide with a previous record.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Network access to `https://opensource-demo.orangehrmlive.com`
- A Chromium browser. `pnpm exec playwright install chromium` installs one for standard environments.

## Setup

```bash
cd qa-automation
pnpm install
pnpm exec playwright install chromium
cp .env.example .env
```

If the host already provides Chromium and does not expose all libraries required by
the downloaded browser, set `CHROMIUM_PATH` to that executable in `.env`. The
framework leaves this unset by default so it remains portable.

The public demo credentials default to `Admin` / `admin123`. To override them, update `.env`:

```dotenv
ORANGEHRM_USERNAME=Admin
ORANGEHRM_PASSWORD=admin123
BASE_URL=https://opensource-demo.orangehrmlive.com
```

Do not commit `.env`.

## Run the test

Headless execution:

```bash
pnpm test
```

Run with a visible browser:

```bash
pnpm test:headed
```

Run in Playwright debug mode:

```bash
pnpm test:debug
```

Run TypeScript validation:

```bash
pnpm typecheck
```

## Reporting and evidence

- Playwright HTML report: `playwright-report/index.html`
- Video recording: generated under `test-results/` for each test run
- Screenshots and traces: captured on failure
- Included passing report: `evidence/playwright-report/index.html`
- Included passing video: `evidence/employee-lifecycle.webm`

Open the report with:

```bash
pnpm report
```

## Framework structure

```text
qa-automation/
├── playwright.config.ts       # runner, browser, video, report, timeout settings
├── test-data/
│   ├── employee.json          # data-driven employee values
│   └── profile-picture.svg    # upload fixture
├── src/
│   ├── api/
│   │   └── orangehrm-api.ts   # authenticated API validation client
│   ├── pages/
│   │   ├── DashboardPage.ts
│   │   ├── LoginPage.ts
│   │   └── PimPage.ts         # PIM list, add, edit, and delete flows
│   ├── types/
│   │   └── employee.ts
│   └── utils/
│       └── employee-data.ts
└── tests/
    └── employee-lifecycle.spec.ts
```

## Design decisions

- Page Object Model keeps locators and business actions separate from the scenario.
- `test.step` creates readable sections in the HTML report.
- API checks reuse the authenticated browser storage state, avoiding a second login flow.
- Descriptive assertions identify the expected business behavior when a check fails.
- A single worker is used because the public demo environment is shared and the test creates mutable records.