"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

const TOUR_STORAGE_KEY = "has_completed_tour"

const TourContext = createContext({
  isTourActive: false,
  currentStep: 1,
  totalSteps: 3,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  endTour: () => {},
  skipTour: () => {},
  hasCompletedTour: false,
})

export function TourProvider({ children }) {
  const [isTourActive, setIsTourActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [hasCompletedTour, setHasCompletedTour] = useState(true)

  useEffect(() => {
    try {
      const completed = localStorage.getItem(TOUR_STORAGE_KEY)
      setHasCompletedTour(completed === "true")
    } catch {
      setHasCompletedTour(false)
    }
  }, [])

  const startTour = () => {
    setCurrentStep(1)
    setIsTourActive(true)
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    } else {
      endTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const endTour = () => {
    setIsTourActive(false)
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true")
      setHasCompletedTour(true)
    } catch {}
  }

  const skipTour = () => {
    endTour()
  }

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStep,
        totalSteps: 3,
        startTour,
        nextStep,
        prevStep,
        endTour,
        skipTour,
        hasCompletedTour,
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTour() {
  const context = useContext(TourContext)
  if (!context) {
    throw new Error("useTour must be used within a TourProvider")
  }
  return context
}

export default TourContext
