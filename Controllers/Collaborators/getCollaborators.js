import Collaborators from "../../Modals/collaborators.modal.js";

export const getCollaborators = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;

    const collaborators = await Collaborators.findAll({ where: { noteId } });

    res.status(200).json({
      message: "Collaborators fetched successfully",
      collaborators: collaborators,
    });
  } catch (error) {
    next(error);
  }
};
