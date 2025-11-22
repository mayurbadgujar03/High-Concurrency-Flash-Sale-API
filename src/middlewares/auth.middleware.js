import { ApiError } from "../utils/api-error.js";

const mockAuth = (req, res, next) => {
  const userId = req.headers["x-user-id"];

  if (!userId) {
    return res
      .status(401)
      .json(new ApiError(401, "Unauthorized: No user ID header found."));
  }

  req.user = { id: userId };

  next();
};

export { mockAuth };
