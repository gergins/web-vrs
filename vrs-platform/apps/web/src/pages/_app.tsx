import { useEffect } from "react";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = String(event.reason?.message || event.reason || "");
      const stack = String(event.reason?.stack || "");
      const extensionOrigin = "chrome-extension://";
      const isExtensionError =
        message.includes("MetaMask") ||
        message.includes("Failed to connect to MetaMask") ||
        stack.includes(extensionOrigin);

      if (isExtensionError) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);

  return <Component {...pageProps} />;
}
