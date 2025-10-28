'use client';

import React from 'react'
import Image from "next/image";
function ExploreBtn() {
  return (
    <button className="mt-5" type="button" id="explore-btn" onClick={() => console.log('CLICK')}>
        <a href="#events">
            ExploreBtn
            <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24}></Image>
        </a>
    </button>
  )
}

export default ExploreBtn