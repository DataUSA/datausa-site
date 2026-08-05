import React from "react";

/**
 * @typedef {{ openForm: () => void, unlocked: boolean, userId: number | null }} PrismContextValue
 */

/** @type {React.Context<PrismContextValue | null>} */
export const PrismContext = React.createContext(null);
