# PointMe CI/CD Guidelines

## Commit Guidelines

1. **Follow Conventional Commits Format**
   - Format: `<type>[optional scope]: <description>`
   - Types: feat, fix, docs, style, refactor, perf, test, chore, ci
   - Example: `feat(auth): add email verification flow`

2. **AI-Assisted Commits**
   - Add `[AI-assisted]` tag to commit messages for changes made with AI assistance
   - Example: `feat(auth): improve error handling [AI-assisted]`

3. **Reference Issues**
   - Include issue numbers in commit messages when applicable
   - Format: `#<issue-number>`
   - Example: `fix(onboarding): resolve navigation issue #123`

## Branch Strategy

1. **Main Branches**
   - `main`: Production-ready code
   - `dev`: Development branch, all feature branches merge into this

2. **Feature Branches**
   - Format: `feature/<feature-name>`
   - Example: `feature/email-verification`

3. **Fix Branches**
   - Format: `fix/<issue-number>`
   - Example: `fix/123-navigation-bug`

4. **Refactor Branches**
   - Format: `refactor/<component>`
   - Example: `refactor/auth-service`

## Pull Request Process

1. **PR Title**
   - Follow the same conventional commit format
   - Example: `feat(auth): add email verification flow`

2. **PR Description**
   - Include a summary of changes
   - List any dependencies that were added
   - Reference related issues
   - Include screenshots for UI changes

3. **PR Checks**
   - All CI checks must pass
   - Code must be reviewed by at least one team member
   - All TypeScript and linter errors must be resolved

## CI/CD Workflow

1. **Commit Tracking**
   - All commits are tracked and logged
   - Commit statistics are generated daily
   - AI-assisted commits are specially tracked

2. **Code Quality**
   - ESLint runs on all code changes
   - TypeScript compiler checks for type errors
   - Tests run automatically
   - Code quality reports are generated

3. **Deployment**
   - `dev` branch deploys to staging
   - `main` branch deploys to production
   - Deployment records are maintained

## Error Handling

1. **TypeScript Errors**
   - All TypeScript errors must be resolved before merging
   - The CI pipeline will fail if TypeScript errors are present

2. **Linter Errors**
   - All linter errors must be resolved before merging
   - The CI pipeline will warn if linter errors are present

3. **Test Failures**
   - All tests must pass before merging
   - The CI pipeline will fail if tests fail

## Documentation

1. **Update Documentation**
   - Update relevant documentation when making changes
   - Add comments for complex code
   - Update README.md when adding new features

2. **Changelog**
   - Maintain a changelog for all significant changes
   - Format: `## [version] - YYYY-MM-DD`

## AI Development Guidelines

1. **AI Contribution Tagging**
   - Tag all commits with AI assistance as `[AI-assisted]`
   - Document AI sessions with a summary of changes

2. **AI Session Documentation**
   - Create a summary of AI-assisted changes
   - Include the reasoning behind the changes
   - Document any limitations or future improvements

3. **AI Contribution Reports**
   - Review AI contribution reports regularly
   - Use insights to improve development processes 