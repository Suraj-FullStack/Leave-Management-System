// RTK Query base API — every other API slice extends this.
// The baseQuery automatically attaches the Bearer token from Redux.

import { createApi, fetchBaseQuery, BaseQueryFn } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";
import { logout } from "../store/authSlice";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

// Standard fetch, injects the Authorization header from the store
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// Wraps rawBaseQuery to handle 401 — logs the user out if the token is invalid
const baseQueryWithReauth: BaseQueryFn = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && (result.error as FetchBaseQueryError).status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["LeaveRequest", "Notification", "User", "LeaveBalance"],
  endpoints: () => ({}),
});
