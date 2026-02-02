# Code Organization - Quick Reference Guide

## Import Patterns

### Import Services
```javascript
import { NotesService } from '../Services/Notes/index.js';
// or
import NotesService from '../Services/Notes/NotesService.js';
```

### Import Middleware
```javascript
import { 
  authenticateUser, 
  asyncHandler, 
  errorHandler 
} from '../Middleware/index.js';
```

### Import Constants
```javascript
import { 
  HTTP_STATUS, 
  NOTE_MESSAGES,
  COLLABORATOR_ROLES 
} from '../Constants/messages.js';
```

### Import Utilities
```javascript
import { 
  isValidEmail, 
  generateVerificationCode,
  logger 
} from '../Utils/index.js';
```

### Import Models
```javascript
import { User, Note, Collaborator } from '../Modals/index.js';
```

### Import Validation
```javascript
import { CreateNoteValidation } from '../Validation/index.js';
```

## Common Patterns

### Controller Pattern
```javascript
import { NotesService } from '../Services/Notes/index.js';
import { NOTE_MESSAGES, HTTP_STATUS } from '../Constants/messages.js';
import { asyncHandler } from '../Middleware/index.js';

export const createNote = asyncHandler(async (req, res) => {
  const note = await NotesService.createNote(req.user.id, req.validatedData);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: NOTE_MESSAGES.NOTE_CREATED,
    data: note
  });
});
```

### Service Pattern
```javascript
import Note from '../../Modals/notes.modal.js';
import { ErrorHandler } from '../../utils/ErrorHandler.js';
import { logger } from '../../utils/Logger.js';
import { NOTE_MESSAGES } from '../../Constants/messages.js';

class NotesService {
  static async createNote(userId, noteData) {
    try {
      const note = await Note.create({ ...noteData, userId });
      logger.info('Note created', { userId, noteId: note.id });
      return note;
    } catch (error) {
      logger.error('Note creation failed', { userId, error });
      throw ErrorHandler(500, NOTE_MESSAGES.NOTE_NOT_CREATED);
    }
  }
}

export default NotesService;
```

### Route Pattern
```javascript
import express from 'express';
import * as NoteController from '../Controllers/Notes/NotesController.js';
import { authenticateUser, generalRateLimit } from '../Middleware/index.js';
import { validateRequest } from '../Middleware/index.js';
import { CreateNoteValidation } from '../Validation/index.js';

const router = express.Router();

router.post(
  '/notes',
  generalRateLimit,
  authenticateUser,
  validateRequest(CreateNoteValidation),
  NoteController.createNote
);

export default router;
```

### Middleware Pattern
```javascript
import { logger } from '../Utils/Logger.js';

export const requestLogger = (req, res, next) => {
  logger.info('Request', {
    method: req.method,
    path: req.path,
    userId: req.user?.id
  });
  next();
};

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

## Error Handling Flow

```
Controller
  ↓
Service (throws ErrorHandler)
  ↓
asyncHandler (catches error)
  ↓
Next middleware (error handler)
  ↓
errorHandler middleware
  ↓
Client (JSON response)
```

## Data Flow

```
Client Request
  ↓
Route Definition
  ↓
Middleware (auth, validation, rate limit)
  ↓
Controller (thin request handler)
  ↓
Service (business logic)
  ↓
Model (database query)
  ↓
Response back through chain
  ↓
Client Response
```

## Folder Organization Rules

### Services
- Group by domain (Auth, Notes, User, etc.)
- One main service class per folder
- Each service handles related business logic
- Pure functions when possible
- No HTTP concerns

### Controllers
- Group by domain (same as services)
- Call services, don't contain logic
- Format responses
- Handle HTTP concerns only

### Middleware
- Centralized in Middleware/index.js
- Each middleware is a reusable function
- Generic and composable

### Constants
- All app-wide constants in Constants/messages.js
- HTTP status codes
- Error messages
- Enums (roles, states, etc.)

### Utils
- Pure utility functions
- No business logic
- No database access
- No HTTP concerns

### Validation
- Zod schemas for input validation
- Organized by domain
- Reusable across controllers

## Checklist for Adding New Feature

- [ ] Create Service in `Services/{Domain}/`
- [ ] Create/Update Controller in `Controllers/{Domain}/`
- [ ] Add validation schema in `Validation/`
- [ ] Add messages/constants in `Constants/messages.js`
- [ ] Create/Update route in `Routes/`
- [ ] Use middleware in route
- [ ] Add error handling
- [ ] Add logging
- [ ] Update documentation
- [ ] Add tests (if applicable)

## Common Mistakes to Avoid

❌ **DON'T**: Put business logic in controllers
✅ **DO**: Put business logic in services

❌ **DON'T**: Use hardcoded strings for messages
✅ **DO**: Use constants from `Constants/messages.js`

❌ **DON'T**: Forget error handling in services
✅ **DO**: Always throw ErrorHandler in services

❌ **DON'T**: Make services HTTP-aware
✅ **DO**: Keep services pure (no req/res)

❌ **DON'T**: Duplicate validation logic
✅ **DO**: Use centralized Validation schemas

❌ **DON'T**: Access models directly in controllers
✅ **DO**: Call services to access data

## File Naming Conventions

| Type | Format | Example |
|------|--------|---------|
| Services | CapitalCase.js | NotesService.js |
| Controllers | camelCase | createNote |
| Routes | RouteFile.js | NotesRoute.js |
| Constants | UPPER_SNAKE_CASE | NOTE_MESSAGES |
| Utils | camelCase | generateTokens |
| Middleware | camelCase | authenticateUser |

## Performance Tips

1. **Database Queries**: Minimize in services
2. **Error Messages**: Use constants (no string concat)
3. **Logging**: Use structured logging from Logger utility
4. **Caching**: Implement in service layer
5. **Rate Limiting**: Use middleware at route level

## Testing Pattern

```javascript
// Test Service (Unit Test)
describe('NotesService.createNote', () => {
  it('should create a note', async () => {
    const result = await NotesService.createNote('userId', noteData);
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
  });
});

// Test Route (Integration Test)
describe('POST /notes', () => {
  it('should create a note', async () => {
    const res = await request(app)
      .post('/notes')
      .set('Authorization', `Bearer ${token}`)
      .send(noteData);
    expect(res.status).toBe(201);
  });
});
```
