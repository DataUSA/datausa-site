import React from "react";

/**
 * @typedef {{ userId: number | null, refreshPrismUser: () => void }} PrismUserContextValue
 */

/** @type {React.Context<PrismUserContextValue>} */
export const PrismUserContext = React.createContext({ userId: null, refreshPrismUser: () => {} });
