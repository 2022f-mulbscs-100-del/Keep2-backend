import passport from "passport";
import { Strategy as GithubStrategy } from "passport-github2";
import User from "../Modals/UserModal.js";

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI + "/api/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log("GitHub access token:", accessToken);
      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        let user = await User.findOne({
          where: {
            email: email || "github_user_" + profile.id + "@example.com",
          },
        });

        if (!user) {
          user = await User.create({
            name: profile.username,
            email: email || "github_user_" + profile.id + "@example.com",
          });
          const password = Math.random().toString(36).slice(-8); // Generate a random password
          await user.createAuth({ githubId: accessToken, password });
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
