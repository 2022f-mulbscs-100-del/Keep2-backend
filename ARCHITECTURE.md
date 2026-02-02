# Code Organization Refactoring

## Overview
This refactoring improves code organization by implementing a layered architecture with clear separation of concerns. The codebase is now organized into logical layers that follow the Single Responsibility Principle.

## New Structure

```
backend-todo-app/
├── Controllers/          # Request handlers - thin layer that delegates to services
├── Services/             # Business logic layer - core application logic
│   ├── Auth/
│   ├── Notes/
│   ├── User/
│   ├── Payment/
│   └── Collaborators/
├── Middleware/          # Express middleware - auth, validation, error handling
├── Routes/              # API route definitions
├── Models/ (Modals/)    # Database models - schema definitions
├── Validation/          # Input validation schemas (Zod)
├── Utils/               # Utility functions and helpers
├── Constants/           # Application constants and messages
├── Config/              # Configuration files
├── Socket/              # WebSocket event handlers
├── Cron/                # Scheduled tasks
└── index.js             # Application entry point
```

## Layer Responsibilities

### Controllers
- Handle HTTP requests and responses
- Call appropriate services
- Return formatted responses
- Minimal business logic

### Services
- Contain all business logic
- Interact with models/database
- Handle data transformation
- Reusable across different interfaces (REST, GraphQL, etc.)

### Middleware
- Authentication & authorization
- Request validation
- Rate limiting
- Error handling
- CORS & security headers

### Models
- Database schema definitions
- Model relationships and associations
- Database queries (when using ORM like Sequelize)

### Validation
- Input validation schemas (Zod)
- Request body/parameter validation
- Custom validators

### Utils
- Helper functions
- Common utilities (string manipulation, formatting, etc.)
- Third-party integrations

### Constants
- Application messages
- Status codes
- Enum values (roles, states, etc.)
- Configuration constants

## Benefits

✅ **Separation of Concerns** - Each layer has a single responsibility
✅ **Reusability** - Services can be reused across different interfaces
✅ **Testability** - Easier to unit test when logic is in services
✅ **Maintainability** - Clear structure makes code easier to understand and modify
✅ **Scalability** - Easy to add new features without modifying existing code
✅ **Error Handling** - Centralized error handling in middleware

## Usage Examples

### Controller Using Service
```javascript
import NotesService from '../Services/Notes/NotesService.js';
import { asyncHandler } from '../Middleware/index.js';

export const getNotes = asyncHandler(async (req, res) => {
  const notes = await NotesService.getNotesByUserId(req.user.id);
  res.json({
    success: true,
    data: notes,
  });
});
```

### Service with Database Interaction
```javascript
import Note from '../../Modals/notes.modal.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';

static async createNote(userId, noteData) {
  const note = await Note.create({
    ...noteData,
    userId,
  });
  return note;
}
```

### Using Constants
```javascript
import { NOTE_MESSAGES, HTTP_STATUS } from '../../Constants/messages.js';

if (!note) {
  throw ErrorHandler(HTTP_STATUS.NOT_FOUND, NOTE_MESSAGES.NOTE_NOT_FOUND);
}
```

### Using Middleware
```javascript
import { authenticateUser, validateRequest } from '../Middleware/index.js';
import { CreateNoteValidation } from '../validation/index.js';

router.post(
  '/notes',
  authenticateUser,
  validateRequest(CreateNoteValidation),
  getNotes
);
```

## Migration Guide

### Converting Controllers to Use Services

**Before:**
```javascript
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create({
      title: req.body.title,
      content: req.body.content,
      userId: req.user.id
    });
    res.json(note);
  } catch (error) {
    next(error);
  }
};
```

**After:**
```javascript
import NotesService from '../Services/Notes/NotesService.js';

export const createNote = asyncHandler(async (req, res) => {
  const note = await NotesService.createNote(req.user.id, req.body);
  res.status(201).json({
    success: true,
    message: 'Note created',
    data: note
  });
});
```

## Next Steps

1. **Create Service Classes** - Extract business logic from controllers (IN PROGRESS)
2. **Refactor Controllers** - Update to use services instead of models directly
3. **Consolidate Error Handling** - Use middleware error handler consistently
4. **Add Request Validation** - Use middleware validation for all inputs
5. **Add Unit Tests** - Test services independently from controllers

## File Naming Conventions

- **Controllers**: Use PascalCase for files and functions
  - Example: `createNote`, `getNoteById`
- **Services**: Use PascalCase for class names, `.js` extension
  - Example: `NotesService.js`, `AuthService.js`
- **Middleware**: Use camelCase for functions
  - Example: `authenticateUser`, `validateRequest`
- **Constants**: Use UPPER_SNAKE_CASE
  - Example: `AUTH_MESSAGES`, `COLLABORATOR_ROLES`
- **Utils**: Use camelCase for functions
  - Example: `generateVerificationCode`, `sanitizeObject`
