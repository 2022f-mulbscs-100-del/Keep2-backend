import { NotesService } from "../../Services/Notes/index.js";
import { logger } from "../../utils/Logger.js";
import { HTTP_STATUS } from "../../Constants/messages.js";

/**
 * Get Notes Controller
 * Retrieves all notes for the authenticated user (owned and collaborated)
 */
export const getNotes = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Get notes request", { userId });

    // Fetch all notes (owned and collaborated) using service
    const allNotes = await NotesService.getNotesByUserId(userId);

    logger.info("Notes fetched successfully", {
      userId,
      noteCount: allNotes.length,
    });

    res.status(HTTP_STATUS.OK).json(allNotes);
  } catch (error) {
    logger.error("Get notes error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

// 4️⃣ How [Op.in] uses it

// [Op.in] is equivalent to:

// Notes.id IN (101, 103, 107)

// okay so have to find all notes where user is collaborator
// then have to fetch those notes and send to user

// now the next problem is when we show collaborator a note it will be able to
// remove collaborator have to
// okay we do check with user/owner id with  of note with user id it if it matches then only show delete option
// so that only owner remove collaborator not collaborator himself
// also have to hide edit option from collaborator
