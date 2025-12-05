import Notes from "../Modals/notes.js";
import { faker } from "@faker-js/faker";

export const generateSandbox = async (req, res) => {
  const { numNotes, useRandomData } = req.body;
  if (numNotes <= 0 || numNotes > 100) {
    res.status(400).json({ message: "numNotes must be between 1 and 100" });
    return;
  } else {
    if (!numNotes) {
      res.status(400).json({ message: "numNotes is required" });
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
        res
          .status(500)
          .json({ message: "Internal Server Error", error: error.message });
      }
    }
  }
};

export const deleteSandbox = async (req, res) => {
  try {
    Notes.destroy({ where: {}, truncate: true });
    res.status(200).json({ message: "Deleted  Notes Successfully" });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
