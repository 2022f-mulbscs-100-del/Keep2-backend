import passport from "passport";

export const LoginWithGithub = async (req, res, next) => {
  try {
    passport.authenticate("github", {
      scope: ["user:email"],
      prompt: "consent",
      accessType: "offline",
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};
