import passport from "passport";
import { logger } from "../../utils/Logger.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import { AuthService } from "../../Services/Auth/index.js";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Google Callback Controller
 * Handles Google OAuth callback and creates/authenticates user
 */
export const GoogleCallback = async (req, res, next) => {
  logger.info("Google callback initiated");

  // Authenticate with passport google strategy
  passport.authenticate(
    "google",
    { session: false, failureRedirect: "/" },
    async (err, user) => {
      if (err) {
        logger.error("Google callback error", { error: err.message });
        return next(err);
      }

      if (!user) {
        logger.warn("Google callback: User not authenticated");
        return res.redirect("/");
      }

      try {
        // Create Stripe customer if not exists
        if (!user.stripeCustomerId) {
          try {
            const customer = await stripe.customers.create({
              email: user.email,
              name: user.name,
            });

            user.stripeCustomerId = customer.id;
            await user.save();
            logger.info("Stripe customer created", { email: user.email });
          } catch (stripeErr) {
            logger.error("Stripe customer creation failed", {
              error: stripeErr.message,
            });
          }
        }

        // Generate tokens
        const refreshToken = RefreshToken(user);
        const accessToken = AccessToken(user);

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: "/",
        });

        logger.info("Google login successful", { email: user.email });

        // Send welcome email
        await AuthService.sendWelcomeEmail(user.email, user.name);

        // Respond with token via postMessage
        res.send(`
          <html>
            <body>
              <script>
                window.opener.postMessage(
                  {
                    token: "${accessToken}",
                    user: ${JSON.stringify({
                      id: user.id,
                      email: user.email,
                      name: user.name,
                    })}
                  },
                  "${process.env.FRONTEND_URL}"
                );
                window.close();
              </script>
            </body>
          </html>
        `);
      } catch (error) {
        logger.error("Google callback error", {
          email: user.email,
          message: error.message,
        });
        next(error);
      }
    }
  )(req, res, next);
};
