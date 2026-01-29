import Collaborators from "../../Modals/collaborators.modal.js";

export const deleteCollaborator = async (req, res, next) => {
  const { noteId, collaborator } = req.body;
  try {
    const deleted = await Collaborators.destroy({
      where: { collaborator, noteId },
    });
    if (deleted) {
      res.status(200).json({
        message: "Collaborator deleted successfully",
      });
    } else {
      res.status(404).json({
        message: "Collaborator not found",
      });
    }
  } catch (error) {
    next(error);
  }
};
