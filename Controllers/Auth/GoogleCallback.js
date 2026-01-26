import passport from "passport";
import { logger } from "../../utils/Logger.js";
import { RefreshToken } from "../../utils/GenerateRefreshToken.js";
import { AccessToken } from "../../utils/GenerateAcessToken.js";
import Stripe from "stripe";
import axios from "axios";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
export const GoogleCallback = async (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false, failureRedirect: "/" },
    async (err, user) => {
      if (err) {
        logger.error("googleCallback error", { error: err.message });
        return next(err);
      }

      if (!user) {
        return res.redirect("/");
      }

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
      const refreshToken = RefreshToken(user);
      const accessToken = AccessToken(user);

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: "/",
      });

      res.send(`
        <html>
          <body>
            <script>
              window.opener.postMessage(
                {
                  token: "${accessToken}",
                  user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name })}
                },
                "http://localhost:5173"
              );
              window.close(); 
            </script>
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
