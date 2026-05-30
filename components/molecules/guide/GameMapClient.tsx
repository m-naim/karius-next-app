'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Lock } from 'lucide-react'

export function GameMapClient({ curriculum }) {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('academy_progress')
    if (saved) {
      setCompletedSlugs(JSON.parse(saved))
    }
  }, [])

  const markVisited = (slug: string) => {
    const newCompleted = Array.from(new Set([...completedSlugs, slug]))
    setCompletedSlugs(newCompleted)
    localStorage.setItem('academy_progress', JSON.stringify(newCompleted))
  }

  let globalStepCounter = 0

  if (!mounted) return null // Évite le flash d'hydratation

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 sm:px-6">
      {curriculum.map((phase: any, phaseIndex: number) => {
        if (!phase.posts || phase.posts.length === 0) return null

        return (
          <div key={phaseIndex} className="relative mb-16">
            
            {/* Zone Background / Decor */}
            <div className="absolute inset-0 -mx-4 md:-mx-10 -my-4 rounded-3xl border border-border/20 bg-card/30 backdrop-blur-sm z-0" />
            <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${phase.color} blur-[60px] opacity-30 pointer-events-none rounded-full`} />

            {/* Zone Header Condensé */}
            <div className="relative z-10 flex flex-row items-center justify-start gap-4 mb-4 pt-4 text-left max-w-lg mx-auto px-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${phase.borderColor} bg-background shadow-lg`}>
                {phase.icon}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-foreground uppercase">{phase.title}</h2>
                <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-2">
                  {phase.goal}
                </p>
              </div>
            </div>            
            {/* Path and Nodes - Cards Snake Layout */}
            <div className="relative mt-8 mb-12 w-full">
              
              {/* Ligne verticale Mobile (Cachée sur Desktop) */}
              <div className="absolute left-[39px] top-8 bottom-0 w-1 bg-muted-foreground/20 md:hidden z-0 border-l-4 border-dashed border-muted" />

              <div className="flex flex-col gap-6 md:gap-12 relative z-10">
                
                {/* LIGNE 1 : Leçon 1 (Gauche) -> Leçon 2 (Droite) */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12 relative">
                  {/* Ligne Horizontale Desktop (1 -> 2) */}
                  <div className={`hidden md:block absolute top-1/2 left-[25%] right-[25%] -translate-y-1/2 border-t-4 border-dashed transition-colors duration-500 z-[-1] ${completedSlugs.includes(phase.posts[0]?.path) ? 'border-primary border-solid' : 'border-muted'}`} />

                  {phase.posts.slice(0, 2).map((post: any, i: number) => {
                    globalStepCounter++
                    const isCompleted = completedSlugs.includes(post.path)
                    const allPostsFlat = curriculum.flatMap((p: any) => p.posts)
                    const isNextToUnlock = globalStepCounter === 1 || completedSlugs.includes(allPostsFlat[globalStepCounter - 2]?.path)
                    const isLocked = !isCompleted && !isNextToUnlock

                    return (
                      <div key={post.path} className="flex-1 relative flex items-center md:block">
                        {/* Indicateur Mobile */}
                        <div className={`md:hidden shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 z-10 bg-background ${isCompleted ? 'border-primary text-primary' : isLocked ? 'border-muted text-muted-foreground' : 'border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'}`}>
                          {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>

                        <Link 
                          href={`/fr/${post.path}`}
                          onClick={() => markVisited(post.path)}
                          className={`block w-full transition-transform duration-300 ${isLocked ? 'pointer-events-none opacity-60' : 'hover:-translate-y-1'}`}
                        >
                          <div className={`p-5 rounded-2xl border bg-card backdrop-blur-sm transition-all duration-300 ${isCompleted ? 'border-primary/50 shadow-md' : isLocked ? 'border-border/40' : 'border-primary shadow-lg shadow-primary/10'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-black text-muted-foreground uppercase tracking-wider">Mission {globalStepCounter}</span>
                              {isCompleted ? <Check className="w-5 h-5 text-primary" /> : isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>}
                            </div>
                            <h3 className="text-lg font-bold leading-tight mb-2">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {/* Ligne Verticale Droite Desktop (2 -> 3) */}
                {phase.posts.length > 2 && (
                  <div className={`hidden md:block absolute top-[25%] bottom-[25%] right-[25%] -translate-x-[2px] border-l-4 border-dashed transition-colors duration-500 z-[-1] ${completedSlugs.includes(phase.posts[1]?.path) ? 'border-primary border-solid' : 'border-muted'}`} />
                )}

                {/* LIGNE 2 : Leçon 3 (Droite) <- Leçon 4 (Gauche) */}
                {phase.posts.length > 2 && (
                  <div className="flex flex-col md:flex-row-reverse gap-6 md:gap-12 relative">
                    {/* Ligne Horizontale Desktop (3 -> 4) */}
                    <div className={`hidden md:block absolute top-1/2 left-[25%] right-[25%] -translate-y-1/2 border-t-4 border-dashed transition-colors duration-500 z-[-1] ${completedSlugs.includes(phase.posts[2]?.path) ? 'border-primary border-solid' : 'border-muted'}`} />

                    {phase.posts.slice(2, 4).map((post: any, i: number) => {
                      globalStepCounter++
                      const isCompleted = completedSlugs.includes(post.path)
                      const allPostsFlat = curriculum.flatMap((p: any) => p.posts)
                      const isNextToUnlock = globalStepCounter === 1 || completedSlugs.includes(allPostsFlat[globalStepCounter - 2]?.path)
                      const isLocked = !isCompleted && !isNextToUnlock

                      return (
                        <div key={post.path} className="flex-1 relative flex items-center md:block">
                          {/* Indicateur Mobile */}
                          <div className={`md:hidden shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 z-10 bg-background ${isCompleted ? 'border-primary text-primary' : isLocked ? 'border-muted text-muted-foreground' : 'border-primary text-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]'}`}>
                            {isCompleted ? <Check className="w-4 h-4" /> : isLocked ? <Lock className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-primary" />}
                          </div>

                          <Link 
                            href={`/fr/${post.path}`}
                            onClick={() => markVisited(post.path)}
                            className={`block w-full transition-transform duration-300 ${isLocked ? 'pointer-events-none opacity-60' : 'hover:-translate-y-1'}`}
                          >
                            <div className={`p-5 rounded-2xl border bg-card backdrop-blur-sm transition-all duration-300 ${isCompleted ? 'border-primary/50 shadow-md' : isLocked ? 'border-border/40' : 'border-primary shadow-lg shadow-primary/10'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-muted-foreground uppercase tracking-wider">Mission {globalStepCounter}</span>
                                {isCompleted ? <Check className="w-5 h-5 text-primary" /> : isLocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span></span>}
                              </div>
                              <h3 className="text-lg font-bold leading-tight mb-2">{post.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{post.description}</p>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Ligne Verticale Gauche Desktop (4 -> Phase suivante) */}
                {phaseIndex < curriculum.length - 1 && (
                  <div className={`hidden md:block absolute bottom-[-48px] h-[60px] left-[25%] -translate-x-[2px] border-l-4 border-dashed transition-colors duration-500 z-[-1] ${completedSlugs.includes(phase.posts[3]?.path) ? 'border-primary border-solid' : 'border-muted'}`} />
                )}

              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
