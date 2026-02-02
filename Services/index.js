/**
 * Services Organization Root
 * Centralized exports for all services
 */

export { AuthService } from "./Auth/index.js";
export { NotesService } from "./Notes/index.js";
export { UserService } from "./User/index.js";
export { CollaboratorsService } from "./Collaborators/index.js";
export { PaymentService } from "./Payment/index.js";

export default {
  AuthService: import("./Auth/index.js").AuthService,
  NotesService: import("./Notes/index.js").NotesService,
  UserService: import("./User/index.js").UserService,
  CollaboratorsService: import("./Collaborators/index.js").CollaboratorsService,
};
