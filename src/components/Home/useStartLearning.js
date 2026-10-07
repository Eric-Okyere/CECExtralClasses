// Where "start learning" buttons should go: the subjects page when signed in,
// otherwise the sign-in page.
export function isSignedIn() {
  try {
    return Boolean(localStorage.getItem("token") && localStorage.getItem("user"));
  } catch {
    return false;
  }
}

export function startPath() {
  return isSignedIn() ? "/subjects" : "/login";
}
