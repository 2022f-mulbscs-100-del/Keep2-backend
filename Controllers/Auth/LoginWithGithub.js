import passport from "passport";

export const LoginWithGithub = async (req, res, next) => {
  try {
    const redirect = req.query?.redirect;

    // For desktop/local callback flow, persist redirect target until OAuth callback.
    if (
      typeof redirect === "string" &&
      redirect.startsWith("http://localhost:")
    ) {
      res.cookie("oauthRedirect", redirect, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
        maxAge: 10 * 60 * 1000,
        path: "/",
      });
    }

    passport.authenticate("github", {
      scope: ["user:email"],
      prompt: "consent",
      accessType: "offline",
    })(req, res, next);
  } catch (error) {
    next(error);
  }
};
