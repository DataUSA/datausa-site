import { Position, Toaster } from "@blueprintjs/core";

export const ErrorToaster =
  typeof window !== "undefined"
    ? Toaster.create({
        className: "error-toaster",
        position: Position.TOP_CENTER
      })
    : null;
