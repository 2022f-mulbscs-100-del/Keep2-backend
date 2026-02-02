import { faker } from "@faker-js/faker";
import { logger } from "../utils/Logger.js";
import Notes from "../Modals/notes.modal.js";
import { ErrorHandler } from "../utils/ErrorHandler.js";
import { HTTP_STATUS } from "../Constants/messages.js";

/**
 * Generate Sandbox Controller
 * Generates test notes for development/testing
 */
export const generateSandbox = async (req, res, next) => {
  try {
    const { id: userId } = req.user;
    const { numNotes, useRandomData } = req.body;

    logger.info("Sandbox generation request", {
      userId,
      numNotes,
      useRandomData,
    });

    if (!numNotes) {
      logger.warn("numNotes not provided", { userId });
      return next(
        ErrorHandler(HTTP_STATUS.BAD_REQUEST, "numNotes is required")
      );
    }

    if (numNotes <= 0 || numNotes > 100) {
      logger.warn("Invalid numNotes value", { numNotes });
      return next(
        ErrorHandler(
          HTTP_STATUS.BAD_REQUEST,
          "numNotes must be between 1 and 100"
        )
      );
    }
    const sandboxNotes = [];
    let notesCount = 0;

    while (notesCount < numNotes) {
      const hasTitle = Math.random() < 0.8;
      const hasDescription = Math.random() < 0.8;
      const hasPinned = Math.random() < 0.8;

      if (!hasTitle && !hasDescription) {
        continue;
      }

      const newNote = await Notes.create({
        userId,
        title: hasTitle ? faker.internet.username() : "",
        description: hasDescription ? faker.lorem.paragraph() : "",
        pinned: useRandomData && hasPinned ? faker.datatype.boolean() : false,
      });

      notesCount++;
      sandboxNotes.push(newNote);
    }

    logger.info("Sandbox notes generated successfully", {
      userId,
      count: notesCount,
    });

    res.status(HTTP_STATUS.OK).json({
      message: `Generated ${notesCount} notes successfully`,
      notes: sandboxNotes,
    });
  } catch (error) {
    logger.error("Sandbox generation error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};

/**
 * Delete Sandbox Controller
 * Deletes all notes for a user (testing only)
 */
export const deleteSandbox = async (req, res, next) => {
  try {
    const { id: userId } = req.user;

    logger.info("Delete sandbox request", { userId });

    await Notes.destroy({ where: { userId } });

    logger.info("Sandbox notes deleted successfully", { userId });

    res.status(HTTP_STATUS.OK).json({ message: "Notes deleted successfully" });
  } catch (error) {
    logger.error("Sandbox deletion error", {
      userId: req.user?.id,
      message: error.message,
    });
    next(error);
  }
};
