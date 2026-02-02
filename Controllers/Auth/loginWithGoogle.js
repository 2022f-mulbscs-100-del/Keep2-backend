import passport from "passport";
import { logger } from "../../utils/Logger.js";

/**
 * Login With Google Controller
 * Initiates Google OAuth authentication
 */
export const LoginWithGoogle = (req, res, next) => {
  logger.info("Google login initiated");

  passport.authenticate("google", {
    scope: [
      "openid",
      "email",
      "profile",
      "https://www.googleapis.com/auth/calendar",
    ],
    prompt: "consent",
    accessType: "offline",
  })(req, res, next);
};

// <------------- working explanation ------------->
// Builds a Google OAuth URL

// Adds:

// client_id

// scopes

// redirect_uri

// state

// response_type=code

// Passport responds with:

// 302 Redirect → https://accounts.google.com/...

// it just open the pop up for google login BY USING passport google strategy
// we provide client id, secret and callback url in passport config file
// and then we select account from the front end google call the callback url with code
// then in callback controller we handle that request and generate token and send to front end

// “Passport, give me the auth middleware…
// OK cool, now EXECUTE it with the current request.”

// passport.authenticate(...)
//         ↓
//    returns middleware
//         ↓
//  middleware(req, res, next)

// it is a middleware to add in callback route
// because after login google will redirect to callback url
// so we need to handle that request
