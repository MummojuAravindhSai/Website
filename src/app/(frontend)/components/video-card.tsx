'use client'

import { useState } from 'react'
import Image from 'next/image'

export function VideoCard() {
  const [playing, setPlaying] = useState(false)

  return (
    <button
      type="button"
      onClick={() => setPlaying((value) => !value)}
      aria-label={playing ? 'Pause design process film' : 'Play design process film'}
      className="group relative min-h-[440px] w-full overflow-hidden bg-[#1d1b18] text-left sm:min-h-[580px]"
    >
      <Image
        src="/assets/a48d3.png"
        alt="Sample interior film poster showing a warm, softly lit room"
        fill
        sizes="100vw"
        className={`object-cover transition duration-700 ${playing ? 'scale-[1.03] opacity-60' : 'opacity-80 group-hover:scale-[1.02]'}`}
      />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-20 place-items-center rounded-full bg-[#fbf8f1]/90 font-medium shadow-xl backdrop-blur">
          {playing ? 'Ⅱ' : '▶'}
        </span>
      </span>
      <span className="absolute bottom-5 left-5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
        {playing ? 'Playing sample film · click to pause' : 'Sample film · click to play'}
      </span>
    </button>
  )
}
