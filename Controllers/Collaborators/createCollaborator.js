import { CollaboratorsService } from "../../Services/Collaborators/index.js";
import { logger } from "../../utils/Logger.js";
import {
  HTTP_STATUS,
  COLLABORATOR_MESSAGES,
} from "../../Constants/messages.js";

/**
 * Add Collaborator Controller
 * Adds a collaborator to a note and sends notification email
 */
export const addCollaborator = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { noteId, collaborator, role } = req.body;

    logger.info("Add collaborator request", {
      userId,
      noteId,
      collaborator,
      role,
    });

    const newCollaborator =
      await CollaboratorsService.addCollaboratorWithNotification(
        userId,
        noteId,
        collaborator,
        role || "viewer"
      );

    logger.info("Collaborator added successfully", { noteId, collaborator });

    res.status(HTTP_STATUS.CREATED).json({
      message: COLLABORATOR_MESSAGES.COLLABORATOR_ADDED,
      collaborator: newCollaborator,
    });
  } catch (error) {
    logger.error("Add collaborator error", {
      userId: req.user?.id,
      noteId: req.body?.noteId,
      message: error.message,
    });
    next(error);
  }
};
