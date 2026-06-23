"use client"

import { useEffect, useRef } from "react"

interface AchievementNotificationProps {
  icon: string | null
  title: string
  onClose: () => void
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const playNote = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.3, start)
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(start)
      osc.stop(start + duration)
    }
    playNote(523.25, ctx.currentTime, 0.2)
    playNote(659.25, ctx.currentTime + 0.12, 0.3)
    playNote(783.99, ctx.currentTime + 0.24, 0.4)
  } catch {
    // Audio not supported
  }
}

export function AchievementNotification({ icon, title, onClose }: AchievementNotificationProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    playChime()
    timerRef.current = setTimeout(onClose, 4000)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-surface rounded-3xl border border-border shadow-xl p-8 text-center space-y-4 animate-scale-in max-w-xs w-full">
        <div className="text-6xl animate-bounce-in">{icon ?? "🏆"}</div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-purple uppercase tracking-wider">nuevo logro</p>
          <h3 className="text-lg font-bold text-text">{title}</h3>
        </div>
        <button
          onClick={onClose}
          className="duo-btn duo-btn-primary w-full text-sm"
        >
          continuar
        </button>
      </div>
    </div>
  )
}
