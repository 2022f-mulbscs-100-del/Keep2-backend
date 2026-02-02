import { CollaboratorsService } from "../../Services/Collaborators/index.js";
import { logger } from "../../utils/Logger.js";
import {
  HTTP_STATUS,
  COLLABORATOR_MESSAGES,
} from "../../Constants/messages.js";

/**
 * Delete Collaborator Controller
 * Removes a collaborator from a note
 */
export const deleteCollaborator = async (req, res, next) => {
  try {
    const { noteId, collaborator } = req.body;

    logger.info("Delete collaborator request", { noteId, collaborator });

    const deleted = await CollaboratorsService.deleteCollaboratorByEmail(
      noteId,
      collaborator
    );

    if (deleted) {
      logger.info("Collaborator deleted successfully", {
        noteId,
        collaborator,
      });
      res.status(HTTP_STATUS.OK).json({
        message: COLLABORATOR_MESSAGES.COLLABORATOR_REMOVED,
      });
    } else {
      logger.warn("Collaborator not found", { noteId, collaborator });
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: COLLABORATOR_MESSAGES.COLLABORATOR_NOT_FOUND,
      });
    }
  } catch (error) {
    logger.error("Delete collaborator error", {
      noteId: req.body?.noteId,
      collaborator: req.body?.collaborator,
      message: error.message,
    });
    next(error);
  }
};
