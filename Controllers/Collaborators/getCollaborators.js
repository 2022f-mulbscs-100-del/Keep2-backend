import { CollaboratorsService } from "../../Services/Collaborators/index.js";
import { logger } from "../../utils/Logger.js";
import {
  HTTP_STATUS,
  COLLABORATOR_MESSAGES,
} from "../../Constants/messages.js";

/**
 * Get Collaborators Controller
 * Fetches all collaborators for a note
 */
export const getCollaborators = async (req, res, next) => {
  try {
    const { noteId } = req.params;

    logger.info("Get collaborators request", { noteId });

    const collaborators = await CollaboratorsService.getCollaborators(noteId);

    logger.info("Collaborators fetched successfully", {
      noteId,
      count: collaborators.length,
    });

    res.status(HTTP_STATUS.OK).json({
      message: COLLABORATOR_MESSAGES.COLLABORATORS_FETCHED,
      collaborators,
    });
  } catch (error) {
    logger.error("Get collaborators error", {
      noteId: req.params?.noteId,
      message: error.message,
    });
    next(error);
  }
};
