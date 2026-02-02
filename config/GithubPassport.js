import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import User from "../Modals/UserModal.js";
import bcrypt from "bcrypt";
import { logger } from "../utils/Logger.js";

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI + "/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      logger.info("GitHub authentication callback", { profileId: profile.id });

      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        let user = await User.findOne({
          where: {
            email: email || "github_user_" + profile.id + "@example.com",
          },
        });

        if (!user) {
          // Generate random password and hash it
          const randomPassword =
            Math.random().toString(36).slice(-8) +
            Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          user = await User.create({
            name: profile.username || profile.displayName || "GitHub User",
            email: email || "github_user_" + profile.id + "@example.com",
          });

          await user.createAuth({
            githubId: accessToken,
            password: hashedPassword,
            signUpConfirmation: true,
          });

          logger.info("New GitHub user created", { email: user.email });
        } else {
          logger.info("Existing GitHub user found", { email: user.email });
        }

        return done(null, user);
      } catch (err) {
        logger.error("GitHub authentication error", { error: err.message });
        return done(err, null);
      }
    }
  )
);

export default passport;
