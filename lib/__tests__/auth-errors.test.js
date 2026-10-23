import { authErrorMessage } from "@/lib/auth-errors";

describe("authErrorMessage", () => {
  it("maps known Firebase codes to friendly text", () => {
    expect(authErrorMessage({ code: "auth/email-already-in-use" })).toBe(
      "An account already exists for that email.",
    );
  });

  it("gives the same message for wrong password and unknown user", () => {
    // Not revealing which one failed keeps accounts from being enumerated.
    expect(authErrorMessage({ code: "auth/wrong-password" })).toBe(
      authErrorMessage({ code: "auth/user-not-found" }),
    );
  });

  it("falls back for unknown codes and non-Firebase errors", () => {
    const fallback = "Something went wrong. Please try again.";
    expect(authErrorMessage({ code: "auth/something-new" })).toBe(fallback);
    expect(authErrorMessage(new Error("boom"))).toBe(fallback);
    expect(authErrorMessage(undefined)).toBe(fallback);
  });
});
