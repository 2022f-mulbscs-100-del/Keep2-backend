import Notes from "../../Modals/notes.modal.js";
import { faker } from "@faker-js/faker";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";

export const generateSandbox = async (req, res, next) => {
  const { id: userId } = req.user;
  const { numNotes, useRandomData } = req.body;
  logger.info("Sandbox data generation requested", {
    userId,
    numNotes,
    useRandomData,
  });
  if (numNotes <= 0 || numNotes > 100) {
    logger.warn("Invalid numNotes value", { numNotes });
    next(ErrorHandler(400, "numNotes must be between 1 and 100"));
    return;
  } else {
    if (!numNotes) {
      next(ErrorHandler(400, "numNotes is required"));
      return;
    } else {
      try {
        const sandboxNotes = [];
        let notesCount = 0;

        while (notesCount < numNotes) {
          const hasTitle = Math.random() < 0.8;
          const hasDescription = Math.random() < 0.8;
          let hasPinned = Math.random() < 0.8;
          if (!hasTitle && !hasDescription) {
            continue;
          }
          const newNotes = await Notes.create({
            title: hasTitle ? faker.internet.username() : "",
            description: hasDescription ? faker.lorem.paragraph() : "",
            pinned:
              useRandomData && hasPinned ? faker.datatype.boolean() : false,
          });
          notesCount++;
          sandboxNotes.push(newNotes);
        }
        res.status(200).json({
          message: "Generated " + notesCount + " Notes Successfully",
          notes: sandboxNotes,
        });
      } catch (error) {
        next(error);
      }
    }
  }
};

export const deleteSandbox = async (req, res, next) => {
  const { id: userId } = req.user;
  logger.info("Deleting sandbox notes for user", { userId });
  try {
    await Notes.destroy({ where: { userId } });
    res.status(200).json({ message: "Deleted  Notes Successfully" });
  } catch (error) {
    next(error);
  }
};
