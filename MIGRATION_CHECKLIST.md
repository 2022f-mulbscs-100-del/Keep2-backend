# Code Organization Migration Checklist

## Phase 1: Foundation (✅ COMPLETED)

- [x] Create Services/ folder with domain subfolders
- [x] Create Middleware/ folder with centralized middleware
- [x] Create Constants/ folder with messages and enums
- [x] Create Models index.js with centralized exports
- [x] Create Validation index.js with centralized exports
- [x] Create Utils index.js with centralized exports
- [x] Create sample service classes (Auth, Notes, User, Collaborators)
- [x] Create ARCHITECTURE.md documentation
- [x] Create CODE_ORGANIZATION.md documentation
- [x] Create QUICK_REFERENCE.md guide

## Phase 2: Controller Migration (IN PROGRESS)

### Auth Controllers
- [ ] Refactor login.js to use AuthService
- [ ] Refactor signUp.js to use AuthService
- [ ] Refactor logout.js to use AuthService
- [ ] Refactor passwordReset.js to use AuthService
- [ ] Refactor MFA generation/verification to use AuthService
- [ ] Update AuthController.js index file
- [ ] Update AuthRoute.js to use new middleware

### Notes Controllers
- [ ] Refactor createNote.js to use NotesService
- [ ] Refactor getNotes.js to use NotesService
- [ ] Refactor updateNote.js to use NotesService
- [ ] Refactor deleteNote.js to use NotesService
- [ ] Refactor archived/deleted notes to use services
- [ ] Refactor label categories to use services
- [ ] Refactor reminders to use services
- [ ] Update NotesController.js index file
- [ ] Update NotesRoute.js to use new middleware

### User Controllers
- [ ] Refactor getUserProfile.js to use UserService
- [ ] Refactor updateProfile.js to use UserService
- [ ] Refactor deleteProfile.js to use UserService
- [ ] Update UserController.js index file
- [ ] Update UserRoute.js to use new middleware

### Collaborators Controllers
- [ ] Refactor addCollaborator.js to use CollaboratorsService
- [ ] Refactor getCollaborators.js to use CollaboratorsService
- [ ] Refactor deleteCollaborator.js to use CollaboratorsService
- [ ] Update CollaboratorsController.js index file
- [ ] Update CollaboratorsRoute.js to use new middleware

### Payment Controllers
- [ ] Create PaymentService
- [ ] Refactor PaymentController.js to use PaymentService
- [ ] Update paymentRoute.js to use new middleware

## Phase 3: Route Updates

- [ ] Update all routes to import from Middleware/index.js
- [ ] Update all routes to use asyncHandler
- [ ] Update all routes to use validateRequest middleware
- [ ] Update all routes with proper error handling
- [ ] Remove duplicate middleware definitions

## Phase 4: Constants Migration

- [ ] Replace hardcoded strings in controllers with Constants
- [ ] Replace hardcoded HTTP status with HTTP_STATUS constants
- [ ] Replace message strings with message constants
- [ ] Replace enum values with role/state constants

## Phase 5: Error Handling

- [ ] Add error handler middleware to index.js
- [ ] Test error handling flow
- [ ] Ensure consistent error response format
- [ ] Verify all errors use ErrorHandler utility

## Phase 6: Testing

- [ ] Create unit tests for AuthService
- [ ] Create unit tests for NotesService
- [ ] Create unit tests for UserService
- [ ] Create unit tests for CollaboratorsService
- [ ] Create integration tests for routes
- [ ] Test error scenarios

## Phase 7: Documentation & Cleanup

- [ ] Update README.md with new structure
- [ ] Add inline code comments where needed
- [ ] Remove old duplicate code
- [ ] Clean up unused imports
- [ ] Verify all files follow naming conventions

## Phase 8: Validation

- [ ] Run linter (ESLint)
- [ ] Run tests
- [ ] Manual testing of all endpoints
- [ ] Performance testing
- [ ] Security audit

## Phase 9: Deployment

- [ ] Update CI/CD pipeline if needed
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Deploy to production
- [ ] Monitor logs and performance

## Summary of Files to Refactor

### Controllers to Update
- [ ] Controllers/Auth/*.js (18 files)
- [ ] Controllers/Notes/*.js (20 files)
- [ ] Controllers/User/*.js (4 files)
- [ ] Controllers/Collaborators/*.js (3 files)
- [ ] Controllers/PaymentController.js
- [ ] Controllers/EmailController.js
- [ ] Controllers/RefreshController.js
- [ ] Controllers/SandboxController.js
- [ ] Controllers/TurnstileController.js

### Routes to Update
- [ ] Routes/AuthRoute.js
- [ ] Routes/NotesRoute.js
- [ ] Routes/UserRoute.js
- [ ] Routes/CollaboratorsRoute.js
- [ ] Routes/paymentRoute.js
- [ ] Routes/EmailRoute.js
- [ ] Routes/TurnstileRoute.js
- [ ] Routes/Sandbox.js

### Utils to Update
- [ ] Consolidate duplicate utility functions
- [ ] Remove unused utilities

## Services to Create/Complete

### Auth Service ✅
- [x] AuthService.js
- [ ] OAuth Service (Google, GitHub)
- [ ] MFA Service

### Notes Service ✅
- [x] NotesService.js
- [ ] ReminderService
- [ ] LabelService
- [ ] ArchivedNoteService

### User Service ✅
- [x] UserService.js
- [ ] SubscriptionService

### Collaborators Service ✅
- [x] CollaboratorsService.js

### Payment Service
- [ ] PaymentService
- [ ] SubscriptionService

### Other Services
- [ ] EmailService
- [ ] TurnstileService

## Time Estimate

| Phase | Task | Estimated Time |
|-------|------|-----------------|
| 1 | Foundation | ✅ Complete |
| 2 | Controller Migration | 4-6 hours |
| 3 | Route Updates | 1-2 hours |
| 4 | Constants Migration | 2-3 hours |
| 5 | Error Handling | 1 hour |
| 6 | Testing | 3-4 hours |
| 7 | Documentation | 1-2 hours |
| 8 | Validation | 1-2 hours |
| 9 | Deployment | 1-2 hours |
| **TOTAL** | | **14-22 hours** |

## Notes

- Work on one domain at a time (Auth, then Notes, then User, etc.)
- Test each phase before moving to the next
- Keep old code in git history for reference
- Update documentation as you progress
- Communicate changes to team members

## Quick Commands

```bash
# Search for hardcoded strings to replace
grep -r "Login successful" --include="*.js"

# Find all TODO comments
grep -r "TODO" --include="*.js"

# Run linter
npm run lint

# Run tests
npm test

# Check code coverage
npm run coverage
```
