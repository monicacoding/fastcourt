"use client"

import { useState, useEffect, useRef } from "react"

// Color specifications
const COLORS = {
  gray: "#808080",
  darkGray: "#2C2C2C", // Default background
  orange: "#FFA500",
  yellow: "#FFFF00",
  lightBlue: "#ADD8E6",
}

// Sound URL - using relative path to public directory (matches public/sound/beep.mp3)
const BEEP_SOUND = "/sound/beep.mp3"

// Image paths with absolute URLs
const COLOR_MODE_ICON = "/images/color-mode.png"
const REACTION_MODE_ICON = "/images/reaction-mode.png"

type TrainingState = "setup" | "countdown" | "training" | "rest"
type TrainingMode = "color" | "reaction"
type ArrowDirection = "left" | "right"
type ArrowColor = "red" | "green"

// Predefined training drills
interface TrainingDrill {
  id: string
  title: string
  mode: TrainingMode
  interval: string
  duration: string
  rest: string
  sets: string
  description?: string
  image?: string
}

const PREDEFINED_DRILLS: TrainingDrill[] = [
    {
      id: "custom",
      title: "Custom Drill",
      mode: "color",
      interval: "2",
      duration: "60",
      rest: "30",
      sets: "3",
    },
    {
      id: "court-agility",
      title: "Court Agility",
      mode: "color",
      interval: "2.5",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "2-level-lateral-agility",
      title: "2-Level Court Agility",
      mode: "color",
      interval: "3.5",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "hurdle-jump-court-agility",
      title: "Hurdle Jump & Court Agility",
      mode: "color",
      interval: "4.5",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "lateral-court-agility",
      title: "Lateral Court Agility",
      mode: "reaction",
      interval: "3.5",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
        id: "hurdle-jump-lateral-agility",
        title: "Hurdle Jump & Lateral Agility",
        mode: "reaction",
        interval: "4.5",
        duration: "30",
        rest: "30",
        sets: "3",
      },
    {
      id: "sprints-backpedal",
      title: "Sprints & Backpedal",
      mode: "reaction",
      interval: "3.5",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "net-game-quickness",
      title: "Net Game Quickness",
      mode: "reaction",
      interval: "2",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "box-drill",
      title: "Box Drill with Tennis Ball",
      mode: "color",
      interval: "3",
      duration: "30",
      rest: "30",
      sets: "3",
    },
    {
      id: "tennis-ball-drop-and-shuffle",
      title: "Tennis Ball Drop & Shuffle",
      mode: "reaction",
      interval: "2",
      duration: "30",
      rest: "30",
      sets: "3",
    },
  ]

export default function RacketTrainingApp() {
  // State for selected drill and parameters
  const [selectedDrillId, setSelectedDrillId] = useState<string>("custom")
  const [selectedDrill, setSelectedDrill] = useState<TrainingDrill>(PREDEFINED_DRILLS[0])

  // State for interval and duration selections
  const [intervalTime, setIntervalTime] = useState("2")
  const [roundDuration, setRoundDuration] = useState("60")
  const [restTime, setRestTime] = useState("30")
  const [numSets, setNumSets] = useState("3")
  const [trainingMode, setTrainingMode] = useState<TrainingMode>("color")

  // State for randomized intervals
  const [randomizeIntervals, setRandomizeIntervals] = useState(false)

  // State for sound
  const [soundEnabled, setSoundEnabled] = useState(true)

  // State for image loading errors
  const [colorModeIconError, setColorModeIconError] = useState(false)
  const [reactionModeIconError, setReactionModeIconError] = useState(false)

  // State for training session
  const [trainingState, setTrainingState] = useState<TrainingState>("setup")
  const [timeRemaining, setTimeRemaining] = useState(Number.parseInt(roundDuration))
  const [currentColor, setCurrentColor] = useState(COLORS.darkGray)
  const [currentSet, setCurrentSet] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [countdownValue, setCountdownValue] = useState(5)

  // State for reaction mode
  const [arrowDirection, setArrowDirection] = useState<ArrowDirection>("right")
  const [arrowColor, setArrowColor] = useState<ArrowColor>("green")

  // Debug state for monitoring transitions
  const [debugMessage, setDebugMessage] = useState("")

  // Refs for timers and state tracking
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const colorIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastColorRef = useRef(COLORS.darkGray)
  const lastArrowRef = useRef({ direction: "right", color: "green" })

  // Ref for audio element
  const beepSoundRef = useRef<HTMLAudioElement | null>(null)

  // Use refs to track current state to avoid closure issues
  const trainingStateRef = useRef<TrainingState>("setup")
  const currentSetRef = useRef(1)
  const numSetsRef = useRef("3")
  const roundDurationRef = useRef("60")
  const restTimeRef = useRef("30")
  const intervalTimeRef = useRef("2")
  const trainingModeRef = useRef<TrainingMode>("color")
  const selectedDrillRef = useRef<TrainingDrill>(PREDEFINED_DRILLS[0])
  const randomizeIntervalsRef = useRef(false)
  const soundEnabledRef = useRef(true)

  // Initialize audio element
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        console.log("Initializing beep sound...")

        // Create audio element
        beepSoundRef.current = new Audio()

        // Set source
        const beepUrl = new URL(BEEP_SOUND, window.location.origin).href
        if (beepSoundRef.current) beepSoundRef.current.src = beepUrl

        console.log("Beep sound URL:", beepUrl)

        // Set volume
        if (beepSoundRef.current) beepSoundRef.current.volume = 0.7
      } catch (error: unknown) {
        console.error("Error initializing beep sound:", error)
      }
    }

    return () => {
      // Clean up audio element
      if (beepSoundRef.current) {
        beepSoundRef.current.pause()
        beepSoundRef.current.src = ""
        beepSoundRef.current = null
      }
    }
  }, [])

  // Function to play beep sound
  const playBeep = () => {
    if (!soundEnabledRef.current || !beepSoundRef.current) {
      return
    }

    try {
      console.log("Playing beep sound...")

      // Reset the audio to the beginning
      beepSoundRef.current.currentTime = 0

      // Play the sound
      const playPromise = beepSoundRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Beep sound played successfully")
          })
          .catch((error) => {
            console.error("Error playing beep sound:", error)
          })
      }
    } catch (error: unknown) {
      console.error("Error playing beep sound:", error)
    }
  }

  // Update refs when state changes to avoid closure issues
  useEffect(() => {
    trainingStateRef.current = trainingState
  }, [trainingState])

  useEffect(() => {
    currentSetRef.current = currentSet
  }, [currentSet])

  useEffect(() => {
    numSetsRef.current = numSets
  }, [numSets])

  useEffect(() => {
    roundDurationRef.current = roundDuration
  }, [roundDuration])

  useEffect(() => {
    restTimeRef.current = restTime
  }, [restTime])

  useEffect(() => {
    intervalTimeRef.current = intervalTime
  }, [intervalTime])

  useEffect(() => {
    trainingModeRef.current = trainingMode
  }, [trainingMode])

  useEffect(() => {
    selectedDrillRef.current = selectedDrill
  }, [selectedDrill])

  useEffect(() => {
    randomizeIntervalsRef.current = randomizeIntervals
  }, [randomizeIntervals])

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
  }, [soundEnabled])

  // Handle drill selection
  useEffect(() => {
    const drill = PREDEFINED_DRILLS.find((d) => d.id === selectedDrillId) || PREDEFINED_DRILLS[0]
    setSelectedDrill(drill)

    // Only update parameters if not in custom mode or if switching to a predefined drill
    if (selectedDrillId !== "custom") {
      setTrainingMode(drill.mode)
      setIntervalTime(drill.interval)
      setRoundDuration(drill.duration)
      setRestTime(drill.rest)
      setNumSets(drill.sets)
    }
  }, [selectedDrillId])

  // Generate interval options from 0.5 to 10 seconds
  const intervalOptions = Array.from({ length: 20 }, (_, i) => ((i + 1) * 0.5).toString())

  // Generate duration options from 30 to 300 seconds in 30-second increments
  const durationOptions = Array.from({ length: 10 }, (_, i) => ((i + 1) * 30).toString())

  // Generate rest time options from 0 to 120 seconds in 15-second increments
  // Include 0 as an option for immediate transition
  const restTimeOptions = ["0", ...Array.from({ length: 8 }, (_, i) => ((i + 1) * 15).toString())]

  // Generate set number options from 1 to 10
  const setOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString())

  // Function to get a random color different from the last one
  const getRandomColor = () => {
    // Only use the training colors (not darkGray)
    const colorKeys = Object.keys(COLORS).filter(
      (key) => key !== "darkGray" && COLORS[key as keyof typeof COLORS] !== lastColorRef.current,
    ) as Array<keyof typeof COLORS>

    const randomIndex = Math.floor(Math.random() * colorKeys.length)
    const newColorKey = colorKeys[randomIndex]

    lastColorRef.current = COLORS[newColorKey]
    return COLORS[newColorKey]
  }

  // Function to get a random arrow configuration
  const getRandomArrow = () => {
    const directions: ArrowDirection[] = ["left", "right"]
    const colors: ArrowColor[] = ["red", "green"]

    // Get a random direction and color, but avoid the exact same combination
    let newDirection: ArrowDirection, newColor: ArrowColor

    do {
      newDirection = directions[Math.floor(Math.random() * directions.length)]
      newColor = colors[Math.floor(Math.random() * colors.length)]
    } while (newDirection === lastArrowRef.current.direction && newColor === lastArrowRef.current.color)

    lastArrowRef.current = { direction: newDirection, color: newColor }
    return { direction: newDirection, color: newColor }
  }

  // Function to get a randomized interval time
  const getRandomizedInterval = () => {
    if (!randomizeIntervalsRef.current) {
      return Number.parseFloat(intervalTimeRef.current) * 1000
    }

    const baseInterval = Number.parseFloat(intervalTimeRef.current)
    // Randomize by ±0.5 to 1 second, but ensure it's at least 0.5 seconds
    const randomVariation = Math.random() * 1.5 - 0.75 // -0.75 to +0.75 seconds
    const randomizedInterval = Math.max(0.5, baseInterval + randomVariation)
    return randomizedInterval * 1000
  }

  // Clear all timers
  const clearAllTimers = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (colorIntervalRef.current) {
      clearTimeout(colorIntervalRef.current)
      colorIntervalRef.current = null
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
      countdownRef.current = null
    }
  }

  // Log state transitions with timestamp for debugging
  const logTransition = (message: string) => {
    const timestamp = new Date().toISOString().substr(11, 8)
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugMessage(logMessage)
  }

  // Start the training session with countdown
  const startTraining = () => {
    // Clear any existing intervals first
    clearAllTimers()

    // Set initial countdown state
    setTrainingState("countdown")
    trainingStateRef.current = "countdown"
    setCountdownValue(5)
    setCurrentColor(COLORS.darkGray)

    logTransition(`Starting 5-second countdown for ${selectedDrill.title}`)

    // Start countdown timer
    countdownRef.current = setInterval(() => {
      setCountdownValue((prev: number) => {
        if (prev <= 1) {
          // When countdown reaches zero, start the actual training
          clearInterval(countdownRef.current!)
          startFirstSet()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Start the first training set after countdown
  const startFirstSet = () => {
    // Play beep sound to signal start of training
    playBeep()

    // Set initial training state
    setTrainingState("training")
    trainingStateRef.current = "training"
    setCurrentSet(1)
    currentSetRef.current = 1
    setTimeRemaining(Number.parseInt(roundDuration))

    // Initialize based on selected mode
    if (trainingModeRef.current === "color") {
      setCurrentColor(getRandomColor())
    } else {
      setCurrentColor(COLORS.darkGray)
      const newArrow = getRandomArrow()
      setArrowDirection(newArrow.direction)
      setArrowColor(newArrow.color)
    }

    logTransition(`Starting training session - Set 1 - Mode: ${trainingModeRef.current}`)

    // Start stimulus changes
    startStimulusChanges()

    // Start countdown timer
    startCountdownTimer()
  }

  // Start stimulus changes (color or arrow) based on selected mode
  const startStimulusChanges = () => {
    // Clear any existing interval
    if (colorIntervalRef.current) {
      clearTimeout(colorIntervalRef.current)
    }

    // Function to schedule the next stimulus change
    const scheduleNextChange = () => {
      if (trainingStateRef.current === "training") {
        // Get a randomized interval if enabled, otherwise use the fixed interval
        const intervalDuration = getRandomizedInterval()

        // Schedule the next change
        colorIntervalRef.current = setTimeout(() => {
          if (trainingStateRef.current === "training") {
            if (trainingModeRef.current === "color") {
              // Color mode: change background color
              setCurrentColor(getRandomColor())
            } else {
              // Reaction mode: change arrow
              const newArrow = getRandomArrow()
              setArrowDirection(newArrow.direction)
              setArrowColor(newArrow.color)
            }
            // Schedule the next change
            scheduleNextChange()
          }
        }, intervalDuration)
      }
    }

    // Start the first change
    scheduleNextChange()
  }

  // Start countdown timer
  const startCountdownTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Set up new countdown timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev: number) => {
        // When timer reaches zero
        if (prev <= 1) {
          // Prevent multiple transitions by checking if already transitioning
          if (isTransitioning) return 0

          setIsTransitioning(true)

          const currentTrainingState = trainingStateRef.current
          const currentSetNumber = currentSetRef.current
          const maxSets = Number.parseInt(numSetsRef.current)
          const restTimeDuration = Number.parseInt(restTimeRef.current)

          setTimeout(() => {
            // Handle different state transitions
            if (currentTrainingState === "training") {
              // Training → Rest or Next Set
              if (restTimeDuration > 0) {
                // If rest time > 0, go to rest period
                startRestPeriod()
              } else if (currentSetNumber < maxSets) {
                // If rest time = 0 and more sets remain, go directly to next set
                startNextTrainingSet()
              } else {
                // If rest time = 0 and no more sets, finish training
                finishTraining()
              }
            } else if (currentTrainingState === "rest") {
              // Rest → Training or End
              if (currentSetNumber < maxSets) {
                // If more sets remain, start next training set
                startNextTrainingSet()
              } else {
                // If no more sets, finish training
                finishTraining()
              }
            }

            setIsTransitioning(false)
          }, 100) // Small delay to ensure state updates properly

          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Start rest period
  const startRestPeriod = () => {
    // Play beep sound to signal start of rest period
    playBeep()

    // Update state for rest period
    setTrainingState("rest")
    trainingStateRef.current = "rest"
    setCurrentColor(COLORS.darkGray)
    setTimeRemaining(Number.parseInt(restTimeRef.current))

    // Stop stimulus changes during rest
    if (colorIntervalRef.current) {
      clearTimeout(colorIntervalRef.current)
      colorIntervalRef.current = null
    }

    logTransition(`Starting rest period after set ${currentSetRef.current}`)
  }

  // Skip rest period and immediately start next set
  const skipRestPeriod = () => {
    // Play beep sound to signal skipping rest
    playBeep()

    // Log the action
    logTransition(`Skipping rest period after set ${currentSetRef.current}`)

    // Check if there are more sets
    if (currentSetRef.current < Number.parseInt(numSetsRef.current)) {
      // If more sets remain, start next training set immediately
      startNextTrainingSet()
    } else {
      // If no more sets, finish training
      finishTraining()
    }
  }

  // Start next training set
  const startNextTrainingSet = () => {
    // Play beep sound to signal start of next training set
    playBeep()

    // Increment set counter
    const newSetNumber = currentSetRef.current + 1
    setCurrentSet(newSetNumber)
    currentSetRef.current = newSetNumber

    // Update state for training
    setTrainingState("training")
    trainingStateRef.current = "training"

    // Initialize based on selected mode
    if (trainingModeRef.current === "color") {
      setCurrentColor(getRandomColor())
    } else {
      setCurrentColor(COLORS.darkGray)
      const newArrow = getRandomArrow()
      setArrowDirection(newArrow.direction)
      setArrowColor(newArrow.color)
    }

    setTimeRemaining(Number.parseInt(roundDurationRef.current))

    // Restart stimulus changes
    startStimulusChanges()

    logTransition(`Starting training set ${newSetNumber}`)
  }

  // Finish the entire training session
  const finishTraining = () => {
    // Play beep sound to signal completion
    playBeep()

    clearAllTimers()

    setTrainingState("setup")
    trainingStateRef.current = "setup"
    setCurrentSet(1)
    currentSetRef.current = 1
    setCurrentColor(COLORS.darkGray)

    logTransition("Training session completed")
  }

  // Manual stop button handler
  const endTraining = () => {
    // Play beep sound to signal manual stop
    playBeep()

    clearAllTimers()

    setTrainingState("setup")
    trainingStateRef.current = "setup"
    setCurrentSet(1)
    currentSetRef.current = 1
    setCurrentColor(COLORS.darkGray)

    logTransition("Training session manually stopped")
  }

  // Clean up intervals on component unmount
  useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [])

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle custom parameter changes
  const handleParameterChange = (param: string, value: string) => {
    // If we're changing parameters, switch to custom drill
    if (selectedDrillId !== "custom") {
      setSelectedDrillId("custom")
    }

    // Update the specific parameter
    switch (param) {
      case "mode":
        setTrainingMode(value as TrainingMode)
        break
      case "interval":
        setIntervalTime(value)
        break
      case "duration":
        setRoundDuration(value)
        break
      case "rest":
        setRestTime(value)
        break
      case "sets":
        setNumSets(value)
        break
    }
  }

  // Render mode icon based on drill mode with fallback to Lucide icons
  const renderModeIcon = (mode: TrainingMode) => {
    if (mode === "color") {
      return colorModeIconError ? (
        <span className="inline-block w-4 h-4 bg-blue-500 mr-1" aria-hidden />
      ) : (
        <img
          src={COLOR_MODE_ICON}
          alt="Color Mode"
          width={16}
          height={16}
          className="inline-block mr-1 align-[-2px]"
          onError={() => setColorModeIconError(true)}
        />
      )
    } else {
      return reactionModeIconError ? (
        <span className="inline-block w-4 h-4 bg-purple-500 mr-1" aria-hidden />
      ) : (
        <img
          src={REACTION_MODE_ICON}
          alt="Reaction Mode"
          width={16}
          height={16}
          className="inline-block mr-1 align-[-2px]"
          onError={() => setReactionModeIconError(true)}
        />
      )
    }
  }

  // Render drill item without tooltip
  const renderDrillItem = (drill: TrainingDrill) => {
    if (drill.id === "custom") {
      return drill.title
    }

    return (
      <div className="flex items-center">
        {renderModeIcon(drill.mode)}
        <span>{drill.title}</span>
      </div>
    )
  }

  const isActive = trainingState !== "setup"
  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen w-full p-6 sm:p-8 transition-colors duration-300"
      style={isActive ? { backgroundColor: currentColor } : undefined}
    >
      <div className="container-card">
        {trainingState !== "setup" && <div className="text-xl font-bold text-center mb-4">{selectedDrill.title}</div>}

        {trainingState === "setup" ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="h-8 w-8 grid place-items-center rounded hover:bg-gray-100"
                title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              >
                <img
                  src={soundEnabled ? "/images/sound-on.png" : "/images/sound-off.png"}
                  alt={soundEnabled ? "Sound on" : "Sound off"}
                  width={16}
                  height={16}
                  className="opacity-90"
                />
              </button>
            </div>

            <div className="space-y-2">
              <label className="section-label" htmlFor="drill-select">Training Drill</label>
              <select
                id="drill-select"
                className="select"
                value={selectedDrillId}
                onChange={(e) => setSelectedDrillId(e.target.value)}
              >
                {PREDEFINED_DRILLS.map((drill) => (
                  <option key={drill.id} value={drill.id}>
                    {drill.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="hr" />

            <div className="space-y-2">
              <div className="flex items-center">
                <label className="text-sm font-medium flex-1">Training Mode</label>
                <span className="text-xs text-muted-foreground">{selectedDrillId !== "custom" && "Preset"}</span>
              </div>
              <div className="flex space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mode"
                    value="color"
                    checked={trainingMode === "color"}
                    onChange={(e) => handleParameterChange("mode", e.target.value)}
                    disabled={selectedDrillId !== "custom"}
                  />
                  <span className="flex items-center">{renderModeIcon("color")} Color Mode</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="mode"
                    value="reaction"
                    checked={trainingMode === "reaction"}
                    onChange={(e) => handleParameterChange("mode", e.target.value)}
                    disabled={selectedDrillId !== "custom"}
                  />
                  <span className="flex items-center">{renderModeIcon("reaction")} Reaction Mode</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
              <label className="section-label">Interval Time (seconds)</label>
                <span className="text-xs text-muted-foreground">{selectedDrillId !== "custom" && "Preset"}</span>
              </div>
              <select
                className="select"
                value={intervalTime}
                onChange={(e) => handleParameterChange("interval", e.target.value)}
                disabled={selectedDrillId !== "custom"}
              >
                {intervalOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}s
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between pt-1">
                <label htmlFor="randomize-intervals" className="text-xs">
                  Randomize Intervals (±0.75s)
                </label>
                <input
                  id="randomize-intervals"
                  type="checkbox"
                  checked={randomizeIntervals}
                  onChange={(e) => setRandomizeIntervals(e.target.checked)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
              <label className="section-label">Round Duration (seconds)</label>
                <span className="text-xs text-muted-foreground">{selectedDrillId !== "custom" && "Preset"}</span>
              </div>
              <select
                className="select"
                value={roundDuration}
                onChange={(e) => handleParameterChange("duration", e.target.value)}
                disabled={selectedDrillId !== "custom"}
              >
                {durationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}s
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
              <label className="section-label">Rest Duration (seconds)</label>
                <span className="text-xs text-muted-foreground">{selectedDrillId !== "custom" && "Preset"}</span>
              </div>
              <select
                className="select"
                value={restTime}
                onChange={(e) => handleParameterChange("rest", e.target.value)}
                disabled={selectedDrillId !== "custom"}
              >
                {restTimeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}s
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
              <label className="section-label">Number of Sets</label>
                <span className="text-xs text-muted-foreground">{selectedDrillId !== "custom" && "Preset"}</span>
              </div>
              <select
                className="select"
                value={numSets}
                onChange={(e) => handleParameterChange("sets", e.target.value)}
                disabled={selectedDrillId !== "custom"}
              >
                {setOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : trainingState === "countdown" ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="text-sm font-medium mb-2">GET READY</div>
            <div className="text-6xl font-bold">{countdownValue}</div>
          </div>
        ) : trainingState === "training" ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-2 text-green-700 font-semibold tracking-wide">TRAINING</div>

            <div className="text-5xl font-bold mb-4">{formatTime(timeRemaining)}</div>

            {trainingMode === "reaction" && (
              <div className="flex flex-col items-center mb-4">
                <div className={`p-6 rounded-full ${arrowColor === "red" ? "bg-red-500" : "bg-green-500"}`}>
                  <span className="block text-white text-5xl">
                    {arrowDirection === "left" ? "←" : "→"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: Number.parseInt(numSets) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 === currentSet
                      ? "bg-primary animate-pulse"
                      : i + 1 < currentSet
                        ? "bg-primary/70"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="text-sm">
              Set {currentSet} of {numSets}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="mb-2 text-blue-700 font-semibold tracking-wide">REST</div>

            <div className="text-5xl font-bold mb-4">{formatTime(timeRemaining)}</div>

            <div className="flex items-center justify-center gap-2 mb-2">
              {Array.from({ length: Number.parseInt(numSets) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i + 1 === currentSet
                      ? "bg-primary animate-pulse"
                      : i + 1 < currentSet
                        ? "bg-primary/70"
                        : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            <div className="text-sm mb-4">
              Set {currentSet} of {numSets}
            </div>

            <button
              onClick={skipRestPeriod}
              className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mt-2 focus:outline-none"
              aria-label="Skip rest period"
            >
              <span className="text-xs"></span>
              <span>SKIP REST</span>
              <span className="text-xs"></span>
            </button>
          </div>
        )}

        <div className="mt-6 flex justify-center">
          {trainingState === "setup" ? (
            <button className="btn-primary" onClick={startTraining}>
              START
            </button>
          ) : (
            <button className="btn-danger" onClick={endTraining}>
              STOP
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
