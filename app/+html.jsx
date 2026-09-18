import { ScrollViewStyleReset } from "expo-router/html";

// Wraps every web page during static rendering. This runs in Node, not in the
// browser, so it has no access to the DOM or to client-side state.
export default function Root({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        {/* Keeps the body from scrolling so RN ScrollViews behave on web. */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
