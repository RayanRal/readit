# Agent Development & Testing Standards

To ensure consistency, reliability, and high code quality in the **Readit** project, all AI agent contributions must adhere to the following rules.

## 1. Code Formatting & Style
- **Language:** TypeScript for both Frontend and Backend.
- **Framework:** Next.js (App Router preferred).
- **Styling:** Tailwind CSS with mobile-first responsive design.
- **Naming Conventions:**
  - PascalCase for React components.
  - camelCase for functions, variables, and file names (except components).
  - kebab-case for directory names.
- **Linting:** Use ESLint and Prettier (standard Next.js configuration).

## 2. API Design
- **RESTful Principles:** Use standard HTTP methods (GET, POST, DELETE).
- **Versioning:** Prefix all API routes with `/api/v1/`.
- **Typing:** Define shared TypeScript interfaces for API requests and responses to be used by both frontend and backend.
- **Validation:** Use `Zod` for runtime schema validation of API inputs.

## 3. Testing Standards
- **Unit Testing:** Use `Vitest` or `Jest` for logic and utility functions.
- **Component Testing:** Use `React Testing Library`.
- **Integration Testing:** Test API endpoints using `Supertest` or Next.js internal test runners.
- **Coverage:** Aim for high coverage on core business logic (URL validation, data transformation).
- **Continuous Integration:** Ensure all tests pass before proposing a final solution.

## 4. Documentation
- **Inline Comments:** Sparingly, focusing on the "why" for complex logic.
- **Self-Documenting Code:** Prioritize clear variable and function names over comments.
- **API Documentation:** Maintain clear descriptions of endpoint structures.
