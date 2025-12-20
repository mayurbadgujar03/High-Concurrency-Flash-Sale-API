import { ApiError } from "../utils/api-error.js";
import { AsyncHandler } from "../utils/async-handler.js";
import fetch from "node-fetch";

export const verifyJWT = AsyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const response = await fetch(`${config.authServiceUrl}/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,
      }),
    });

    if (!response.data?.data?.isValid) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = response.data.data.user;

    next();
  } catch (error) {
    throw new ApiError(
      401,
      error?.response?.data?.message || "Invalid Access Token",
    );
  }
});
