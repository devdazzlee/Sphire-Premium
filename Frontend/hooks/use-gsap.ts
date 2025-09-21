"use client"

import { useRef } from "react"

// Mock GSAP functionality for the preview
const mockGsap = {
  context: (fn: Function, scope?: any) => {
    const ctx = {
      revert: () => {},
    }
    fn()
    return ctx
  },
  fromTo: (target: any, from: any, to: any) => {},
  to: (target: any, vars: any) => {},
  set: (target: any, vars: any) => {},
  timeline: () => ({
    set: (target: any, vars: any) => mockGsap.timeline(),
    to: (target: any, vars: any, position?: any) => mockGsap.timeline(),
    fromTo: (target: any, from: any, to: any, position?: any) => mockGsap.timeline(),
  }),
  utils: {
    toArray: (target: any) => {
      if (Array.isArray(target)) return target
      if (typeof target === "string") {
        return Array.from(document.querySelectorAll(target))
      }
      return [target]
    },
  },
}

export function useGSAP() {
  const ref = useRef<HTMLElement>(null)

  return {
    ref,
    gsap: mockGsap,
  }
}
