import passport from "passport";
import { logger } from "../../utils/Logger.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import axios from "axios";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import Stripe from "stripe";
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const GithubCallback = (req, res, next) => {
  //------ authenticate with passport github strategy
  passport.authenticate(
    "github",
    { session: false, failureRedirect: "/" },
    async (err, user) => {
      if (err) {
        logger.error("githubCallback error", { error: err.message });
        return next(err);
      }

      // ------ check if user exists
      if (!user) {
        return res.redirect("/");
      }

      // ------ create Stripe customer if not exists
      if (!user.stripeCustomerId) {
        await stripe.customers
          .create({
            email: user.email,
            name: user.name,
          })
          .then(async (customer) => {
            user.stripeCustomerId = customer.id;
            await user.save();
          })
          .catch((stripeErr) => {
            logger.error("Stripe customer creation failed", {
              error: stripeErr.message,
            });
          });
      }

      // ------ generate tokens
      const refreshToken = RefreshToken(user);
      const accessToken = AccessToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "development" ? "lax" : "none", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.send(`
        <html>
          <body>
            <script>
              // Send user info to opener
              window.opener.postMessage(
                {
                  token: "${accessToken}",
                  user: ${JSON.stringify({ email: user.email, name: user.name })}
                },
                "${process.env.FRONTEND_URL}" // your frontend origin
              );
              window.close(); // close the popup
            </script>
            <p>Logging in...</p>
          </body>
        </html>
      `);
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          to: [{ email: user.email, name: user.name || "User" }],
          templateId: 1,
          params: {
            name: user.name || "User",
          },
        },
        {
          timeout: 10000,
          headers: {
            "api-key": process.env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );
    }
  )(req, res, next);
};
