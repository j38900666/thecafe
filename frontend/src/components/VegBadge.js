import React from "react";

export function VegBadge({ isVeg, className = "" }) {
  return (
    <span
      data-testid={isVeg ? "veg-badge" : "nonveg-badge"}
      className={`inline-flex items-center justify-center w-4 h-4 border ${
        isVeg ? "border-green-500" : "border-red-500"
      } ${className}`}
      title={isVeg ? "Veg" : "Non-Veg"}
    >
      <span className={`w-2 h-2 rounded-full ${isVeg ? "bg-green-500" : "bg-red-500"}`} />
    </span>
  );
}
