/**
 * Collaborators Service
 * Contains all collaborator business logic
 */

import Collaborator from "../../Modals/collaborators.modal.js";
import Note from "../../Modals/notes.modal.js";
import User from "../../Modals/UserModal.js";
import axios from "axios";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import {
  COLLABORATOR_MESSAGES,
  COLLABORATOR_ROLES,
} from "../../Constants/messages.js";

class CollaboratorsService {
  /**
   * Add a collaborator to a note
   * @param {string} noteId - Note ID
   * @param {string} collaboratorId - Collaborator user ID
   * @param {string} role - Collaborator role (viewer, editor, admin)
   * @returns {object} Created collaborator record
   */
  static async addCollaborator(noteId, collaboratorId, role = "editor") {
    try {
      // Validate role
      if (!Object.values(COLLABORATOR_ROLES).includes(role)) {
        throw ErrorHandler(400, COLLABORATOR_MESSAGES.INVALID_ROLE);
      }

      // Check if note exists
      const note = await Note.findByPk(noteId);
      if (!note) {
        throw ErrorHandler(404, "Note not found");
      }

      // Check if already a collaborator
      const existing = await Collaborator.findOne({
        where: {
          noteId,
          collaborator: collaboratorId,
        },
      });

      if (existing) {
        throw ErrorHandler(409, COLLABORATOR_MESSAGES.ALREADY_COLLABORATOR);
      }

      const collaboration = await Collaborator.create({
        noteId,
        collaborator: collaboratorId,
        role,
      });

      logger.info("Collaborator added", {
        noteId,
        collaboratorId,
        role,
      });

      return collaboration;
    } catch (error) {
      logger.error("Failed to add collaborator", {
        noteId,
        collaboratorId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get all collaborators for a note
   * @param {string} noteId - Note ID
   * @returns {array} Array of collaborators
   */
  static async getCollaborators(noteId) {
    try {
      const collaborators = await Collaborator.findAll({
        where: { noteId },
        order: [["createdAt", "ASC"]],
      });

      return collaborators;
    } catch (error) {
      logger.error("Failed to fetch collaborators", {
        noteId,
        reason: error.message,
      });
      throw ErrorHandler(500, "Failed to fetch collaborators");
    }
  }

  /**
   * Remove a collaborator
   * @param {string} collaborationId - Collaboration record ID
   * @param {string} userId - User removing the collaborator (for auth check)
   */
  static async removeCollaborator(collaborationId, userId) {
    try {
      const collaboration = await Collaborator.findByPk(collaborationId);

      if (!collaboration) {
        throw ErrorHandler(404, "Collaborator not found");
      }

      // Get the note to check ownership
      const note = await Note.findByPk(collaboration.noteId);
      if (note.userId !== userId) {
        throw ErrorHandler(
          403,
          "You cannot remove collaborators from this note"
        );
      }

      await collaboration.destroy();

      logger.info("Collaborator removed", {
        collaborationId,
        userId,
      });
    } catch (error) {
      logger.error("Failed to remove collaborator", {
        collaborationId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update collaborator role
   * @param {string} collaborationId - Collaboration record ID
   * @param {string} newRole - New role
   * @returns {object} Updated collaboration record
   */
  static async updateCollaboratorRole(collaborationId, newRole) {
    try {
      // Validate role
      if (!Object.values(COLLABORATOR_ROLES).includes(newRole)) {
        throw ErrorHandler(400, COLLABORATOR_MESSAGES.INVALID_ROLE);
      }

      const collaboration = await Collaborator.findByPk(collaborationId);

      if (!collaboration) {
        throw ErrorHandler(404, "Collaborator not found");
      }

      await collaboration.update({ role: newRole });

      logger.info("Collaborator role updated", {
        collaborationId,
        newRole,
      });

      return collaboration;
    } catch (error) {
      logger.error("Failed to update collaborator role", {
        collaborationId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if user has access to note
   * @param {string} userId - User ID
   * @param {string} noteId - Note ID
   * @returns {object} Access info { canAccess, role, isOwner }
   */
  static async checkUserAccess(userId, noteId) {
    try {
      const note = await Note.findByPk(noteId);

      if (!note) {
        return { canAccess: false };
      }

      // Owner has full access
      if (note.userId === userId) {
        return {
          canAccess: true,
          isOwner: true,
          role: "admin",
        };
      }

      // Check if user is a collaborator
      const collaboration = await Collaborator.findOne({
        where: {
          noteId,
          collaborator: userId,
        },
      });

      if (collaboration) {
        return {
          canAccess: true,
          isOwner: false,
          role: collaboration.role,
        };
      }

      return { canAccess: false };
    } catch (error) {
      logger.error("Failed to check user access", {
        userId,
        noteId,
        reason: error.message,
      });
      return { canAccess: false };
    }
  }

  /**
   * Add collaborator with email notification
   * @param {string} ownerId - Owner user ID
   * @param {string} noteId - Note ID
   * @param {string} collaboratorEmail - Collaborator email
   * @param {string} role - Collaborator role
   * @returns {object} Created collaborator record
   */
  static async addCollaboratorWithNotification(
    ownerId,
    noteId,
    collaboratorEmail,
    role = "viewer"
  ) {
    try {
      // Get collaborator user
      const collaboratorUser = await User.findOne({
        where: { email: collaboratorEmail },
      });
      if (!collaboratorUser) {
        throw ErrorHandler(404, "Collaborator user not found");
      }

      // Get owner user
      const owner = await User.findByPk(ownerId);
      if (!owner) {
        throw ErrorHandler(404, "Owner user not found");
      }

      // Create collaboration
      const newCollaborator = await this.addCollaborator(
        noteId,
        collaboratorEmail,
        role
      );

      // Update note with owner attributes
      const note = await Note.findByPk(noteId);
      note.OwnerAttributes = {
        id: owner.id,
        email: owner.email,
        name: owner.name,
      };
      await note.save();

      // Send notification email
      try {
        await axios.post(
          "https://api.brevo.com/v3/smtp/email",
          {
            to: [{ email: collaboratorEmail }],
            templateId: 5,
            params: {
              noteLink: `${process.env.FRONTEND_URL}/notes/${noteId}`,
              email: collaboratorEmail,
            },
          },
          {
            headers: {
              "api-key": process.env.BREVO_API_KEY,
              "Content-Type": "application/json",
            },
          }
        );
        logger.info("Collaborator notification email sent", {
          collaboratorEmail,
          noteId,
        });
      } catch (emailError) {
        logger.warn("Failed to send collaborator notification email", {
          collaboratorEmail,
          reason: emailError.message,
        });
      }

      return newCollaborator;
    } catch (error) {
      logger.error("Failed to add collaborator with notification", {
        noteId,
        collaboratorEmail,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete collaborator by note and email
   * @param {string} noteId - Note ID
   * @param {string} collaboratorEmail - Collaborator email
   * @returns {boolean} True if deleted
   */
  static async deleteCollaboratorByEmail(noteId, collaboratorEmail) {
    try {
      const deleted = await Collaborator.destroy({
        where: { collaborator: collaboratorEmail, noteId },
      });

      if (deleted) {
        logger.info("Collaborator deleted", { noteId, collaboratorEmail });
        return true;
      }

      return false;
    } catch (error) {
      logger.error("Failed to delete collaborator", {
        noteId,
        collaboratorEmail,
        reason: error.message,
      });
      throw error;
    }
  }
}

export default CollaboratorsService;
