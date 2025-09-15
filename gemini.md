# Brutal Worlds: AI Engineer Notes

This document outlines the core architectural principles and development patterns for the Brutal Worlds project. Adhering to these guidelines is crucial for maintaining code quality, preventing bugs, and ensuring smooth feature development.

## Core Technologies

- **Frontend:** React with TypeScript
- **State Management:** `useReducer` for centralized state, React Hooks for component logic.
- **3D Rendering:** Three.js
- **Build Tool:** Vite
- **Testing:** Vitest

## Architectural Principles

### 1. State Management: The Reducer is King

All global application state is managed within the `useReducer` hook in `useGameEngine.ts`. This provides a single source of truth and predictable state transitions.

- **Stateless Managers:** Classes like `SfxManager` and `VfxManager` should be stateless. They are "engines" that perform actions based on data passed to them from the React state. They should not hold their own state (e.g., `this.volume`).
- **Data Flow:** State flows from the central reducer down to components and managers. UI interactions dispatch actions to the reducer to update the state.

### 2. Web Worker for Turn Resolution

Game turn logic is computationally intensive and is therefore handled by a Web Worker (`src/logic/turnResolver.ts`) to keep the UI responsive.

- **Communication:** The main thread sends the current game state to the worker. The worker processes the turn and sends the resolved state back.
- **Serialization:** All data passed to and from the worker must be serializable. Complex objects (like `THREE.Vector3`) are serialized before sending and deserialized upon receipt. See `serializeGameStateForWorker` and `deserializeResolvedTurn` in `src/utils/threeUtils.ts`.
- **Debugging:** When debugging turn-related issues, inspect the data being passed to and from the worker at each stage of the serialization/deserialization process.

### 3. Asynchronous Operations and Race Conditions

- **Audio Initialization:** The Web Audio API requires user interaction to initialize. The `handleUserInteraction` function in `useGameEngine.ts` centralizes this initialization. It ensures that the audio context is ready and then immediately applies the current volume and mute settings from the state, preventing race conditions.
- **AI Actions:** AI orders are scheduled with `setTimeout` to simulate human-like delays. These timeouts are managed in `useGameEngine.ts` and are cleared when the game state changes (e.g., paused, new turn).

### 4. Effect Handling (`VFX` and `SFX`)

- **`effectQueue`:** The `turnResolver` worker generates a queue of visual and sound effects (`effectsToPlay`).
- **Direct Playback:** The `useGameEngine` hook processes this `effectQueue` and directly calls the `vfxManager` and `sfxManager` to play the effects. This avoids intermediate state updates and potential race conditions.
- **Real-time vs. Turn-based:**
    - **Turn-based effects** (from the `effectQueue`) are played after a turn is resolved.
    - **Real-time effects** (e.g., UI button clicks) are triggered directly by the component interacting with the user.

## Development Workflow

1.  **Understand the Data Flow:** Before implementing a new feature, trace the data flow from the UI, through the `useGameEngine` hook, to the `turnResolver` worker, and back.
2.  **Update the Reducer:** For new state variables, add them to the `GameState` type and update the reducer in `src/logic/reducers/`.
3.  **Modify the Worker:** If the turn logic needs to be changed, modify the `turnResolver.ts` worker. Ensure any new data is correctly passed to and from the worker.
4.  **Create Components:** Build new UI components in `src/components/` and connect them to the `useGameEngine` hook for state and dispatch functions.
5.  **Add Effects:** For new visual or sound effects, add the assets to the `public/` directory and define their behavior in the appropriate manager or data file.

By following these principles, we can build a robust and maintainable application.

## Developer's Note
When implementing UI changes, always prioritize consistency with the existing design language (fonts, spacing, colors, etc.). If a new component or a significant style modification is required, propose the change to the user for approval before implementation. For minor adjustments, clearly explain the rationale behind the change. This ensures design integrity while still allowing for proactive problem-solving. 