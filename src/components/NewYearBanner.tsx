import React from "react";

export const NewYearBanner = () => {
  return (
    <div className="newyear-banner -mt-1">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <span className="badge">🎆 Happy New Year</span>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              Wishing you a prosperous and joyful new year.
            </span>
          </div>
          <div className="confetti-wrapper" aria-hidden>
            <span className="c c1" />
            <span className="c c2" />
            <span className="c c3" />
            <span className="c c4" />
            <span className="c c5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewYearBanner;
