# MVP smoke tests

The project intentionally keeps the test harness dependency-free at this stage.
Run the app first, then:

```bash
npm run dev
node scripts/smoke-test.mjs
```

The smoke suite verifies the production boundaries that matter most for the JSON/GitHub MVP:

- health endpoint
- public catalog availability
- protected account boundary
- malformed authentication request rejection

For the next infrastructure increment, replace this smoke harness with Playwright and add authenticated checkout E2E coverage.
