import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success:false,
        message:"Too many login attempts. Try again later."
    }
});