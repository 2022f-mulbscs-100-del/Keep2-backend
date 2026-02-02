/**
 * User Service
 * Contains all user business logic
 */

import User from "../../Modals/UserModal.js";
import Auth from "../../Modals/AuthModal.js";
import bcrypt from "bcrypt";
import { ErrorHandler } from "../../utils/ErrorHandler.js";
import { logger } from "../../utils/Logger.js";
import { sanitizeObject } from "../../utils/index.js";
import { USER_MESSAGES, HTTP_STATUS } from "../../Constants/messages.js";

class UserService {
  /**
   * Get user by ID
   * @param {string} userId - User ID
   * @returns {object} User object
   */
  static async getUserById(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw ErrorHandler(404, USER_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      logger.error("Failed to fetch user", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {object} User object
   */
  static async getUserByEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        throw ErrorHandler(404, USER_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      logger.error("Failed to fetch user by email", {
        email,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {object} updateData - Data to update
   * @returns {object} Updated user object
   */
  static async updateUserProfile(userId, updateData) {
    try {
      const user = await this.getUserById(userId);

      // Don't allow changing email through this method
      //eslint-disable-next-line
      const { email, password, ...safeData } = updateData;

      await user.update(safeData);

      logger.info("User profile updated", { userId });

      return sanitizeObject(user.toJSON());
    } catch (error) {
      logger.error("Failed to update user profile", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete user account and all associated data
   * @param {string} userId - User ID
   */
  static async deleteUserAccount(userId) {
    try {
      const user = await this.getUserById(userId);

      // Delete user (cascading deletes should handle related data)
      await user.destroy();

      logger.info("User account deleted", { userId });
    } catch (error) {
      logger.error("Failed to delete user account", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user public profile
   * @param {string} userId - User ID
   * @returns {object} Public user data
   */
  static async getUserPublicProfile(userId) {
    try {
      const user = await this.getUserById(userId);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
      };
    } catch (error) {
      logger.error("Failed to fetch user public profile", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Check if user exists
   * @param {string} email - User email
   * @returns {boolean}
   */
  static async userExists(email) {
    try {
      const user = await User.findOne({ where: { email } });
      return !!user;
    } catch (error) {
      logger.error("User existence check failed", {
        email,
        reason: error.message,
      });
      return false;
    }
  }

  /**
   * Get user with subscription info
   * @param {string} userId - User ID
   * @returns {object} User with subscription
   */
  static async getUserWithSubscription(userId) {
    try {
      const user = await User.findByPk(userId, {
        include: [
          {
            model: "Subscription",
            as: "subscription",
          },
        ],
      });

      if (!user) {
        throw ErrorHandler(404, USER_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      logger.error("Failed to fetch user with subscription", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user profile with auth data (for authenticated requests)
   * @param {string} userId - User ID
   * @returns {object} User profile with auth data
   */
  static async getUserProfile(userId) {
    try {
      let user;
      if (process.env.NODE_ENV === "development") {
        user = await User.findByPk(userId, {
          include: [
            { model: Auth, as: "auth", attributes: { exclude: ["password"] } },
          ],
        });
      } else {
        user = await User.findByPk(userId);
      }

      if (!user) {
        throw ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
      }

      return user;
    } catch (error) {
      logger.error("Failed to fetch user profile", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }

  /**
   * Delete user account with password verification
   * @param {string} userId - User ID
   * @param {string} password - User password for verification
   * @returns {string} Stripe customer ID
   */
  static async deleteUserAccountWithPassword(userId, password) {
    try {
      const user = await User.findByPk(userId, {
        include: [{ model: Auth, as: "auth" }],
      });

      if (!user) {
        throw ErrorHandler(HTTP_STATUS.NOT_FOUND, USER_MESSAGES.USER_NOT_FOUND);
      }

      // Verify password
      const isPasswordCorrect = await bcrypt.compare(
        password,
        user.auth.password
      );
      if (!isPasswordCorrect) {
        throw ErrorHandler(
          HTTP_STATUS.BAD_REQUEST,
          USER_MESSAGES.INVALID_PASSWORD
        );
      }

      const stripeCustomerId = user.stripeCustomerId;

      // Delete user (cascading deletes should handle related data)
      await user.destroy();

      logger.info("User account deleted", { userId });

      return stripeCustomerId;
    } catch (error) {
      logger.error("Failed to delete user account", {
        userId,
        reason: error.message,
      });
      throw error;
    }
  }
}

export default UserService;
