# Development Workflow

Implement features as vertical slices in this order:

1. Define and implement the backend contract in the deployed backend host.
2. Add backend unit and integration tests.
3. Deploy or validate the backend endpoint in its target environment.
4. Integrate the frontend against the deployed backend contract.
5. Add frontend tests and verify the production build.

Do not add frontend fallbacks, alternate API bases, or UI workarounds for a backend route until the backend route has been implemented, tested, and deployed.
