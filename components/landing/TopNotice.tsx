'use client';

import React from 'react';

const TopNotice = () => {
  return (
    <div
      className="
        fixed top-0 left-0 right-0 z-50
        bg-[url('/images/gradient.webp')]
        bg-cover bg-center bg-no-repeat
        text-white py-3 text-sm 
      "
    >
      <div className="container flex items-center justify-start gap-x-2 text-sm">
        <span>🎉</span>
        <strong className="font-medium">Early Bird Discount – 20% off!</strong>
        <span className='max-sm:hidden opacity-85'>
            Use code {' '}
            <span className="inline-flex items-center rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs font-medium tabular-nums">
            EARLYBIRD
            </span>
        </span>
      </div>
    </div>
  );
};

export default TopNotice;
