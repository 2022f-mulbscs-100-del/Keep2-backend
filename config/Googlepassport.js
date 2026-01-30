import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../Modals/UserModal.js"; // your user model

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.REDIRECT_URI + "/api/auth/google/callback",
    },

    // Callback function
    async (accessToken, refreshToken, profile, done) => {
      console.log("Google access token:", accessToken);
      console.log("Google refresh token:", refreshToken);
      try {
        // Check if user exists
        let user = await User.findOne({
          where: { email: profile.emails[0].value },
        });

        if (!user) {
          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
          });
          const password = Math.random().toString(36).slice(-8); // Generate a random password
          await user.createAuth({ googleId: accessToken, password });
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
