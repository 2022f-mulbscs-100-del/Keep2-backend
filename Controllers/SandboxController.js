import Notes from "../Modals/notes.js";
import { faker } from "@faker-js/faker";
import { ErrorHandler } from "../utils/ErrorHandler.js";

export const generateSandbox = async (req, res, next) => {
  const { numNotes, useRandomData } = req.body;
  if (numNotes <= 0 || numNotes > 100) {
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
  try {
    Notes.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: "Deleted  Notes Successfully" });
  } catch (error) {
    next(error);
  }
};
