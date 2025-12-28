import { withAuth, successResponse } from "./auth-utils";

export const handler = withAuth(async (event, user) => {
  return successResponse({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
  });
});

