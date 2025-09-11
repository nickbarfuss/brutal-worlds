This file contains notes and observations about the project.

## Architectural Principles: State Management & Race Conditions

To ensure application stability and prevent difficult-to-trace bugs, we must adhere to the following React-centric architectural principles.

### 1. Managers Must Be Stateless

Any class or "manager" (e.g., `SfxManager`, `VfxManager`) that is instantiated and managed within a React hook (`useRef(new ...())`) should be treated as a stateless "engine." These classes should **not** maintain their own internal state (e.g., `this.isMuted`, `this.volume`). They should only contain methods that perform actions.

### 2. The Reducer is the Single Source of Truth

All application state must reside within the central `useReducer` hook (e.g., in `useGameEngine`). This includes UI state, game logic state, and settings like volumes or mute status. When a manager needs to know whether to perform an action (e.g., play a sound silently), that information must be passed down from the React state at the time the action is called.

### 3. Avoiding Initialization Race Conditions

We have encountered race conditions where a `useEffect` to play a sound runs before the `useEffect` that sets its initial volume/mute state. This is especially problematic for browser APIs that require user interaction to initialize (like Web Audio).

**The Solution Pattern:**

1.  **Centralize Initialization:** Create a single function within the main game engine hook (`useGameEngine`) to handle the first user interaction (e.g., `handleUserInteraction`).
2.  **Synchronous State Push:** This function is responsible for two things, in order:
    a. Calling the manager's one-time initialization method (e.g., `sfxManager.handleUserInteraction()`).
    b. **Immediately after** the initialization `await`s, it must read the current, correct state from the reducer and push it to the manager (e.g., loop through `state.mutedChannels` and call `sfxManager.setVolume()` for each).
3.  **Update UI:** All UI components (e.g., the "Begin Game" button) must call this single, centralized function from the engine hook, rather than interacting with the manager directly.

This pattern makes the data flow explicit and guarantees that the manager's configuration is synchronized with the application state at the exact moment it becomes ready.


## Web Worker Communication

The game uses a web worker to resolve turns in the background. The main thread sends the game state to the worker, and the worker sends back the new state.

It is crucial to ensure that the data sent to and from the worker is correctly serialized and deserialized. Any discrepancies in the data can lead to subtle bugs that are hard to track down.

When debugging issues related to turn resolution, it's important to inspect the data that is being passed to and from the worker.

## Web Worker Data Flow

When debugging issues related to data being unavailable in the `turnResolver` web worker, it's important to trace the data's path from its origin to the worker.

1.  **State Initialization (`/src/logic/reducers/gameFlowReducer.ts`):** The `START_GAME` action handler in this reducer is responsible for setting the initial game state. Any data that needs to be available from the start of the game (like `playerArchetypeKey`, `playerLegacyKey`, etc.) must be correctly placed into the state object here.

2.  **Engine Hook (`/src/hooks/useGameEngine.ts`):** This hook holds the main game state via `useReducer`. The `resolveTurn` function is responsible for gathering all necessary data from the current state and preparing it to be sent to the worker. All data required by the worker must be included in the object passed to `serializeGameStateForWorker` and also added to the `useCallback` dependency array for `resolveTurn`.

3.  **Serialization (`/src/utils/threeUtils.ts`):** The `serializeGameStateForWorker` function acts as a gatekeeper. It takes the state from `useGameEngine` and creates a new, sanitized object to be sent to the worker. **Crucially, any property not explicitly included in the object returned by this function will not reach the worker.** If data is missing in the worker, verify it is being passed through here.

4.  **Worker (`/src/logic/turnResolver.ts`):** The worker receives the serialized state. From here, it passes the data to other resolvers like `attackResolver.ts`.

By checking these files in order, you can trace why data might be missing in the web worker.

## Turn Timing and Web Workers

When implementing features that rely on specific timing within a turn (e.g., playing sounds at the start or end of a turn), it's crucial to understand the asynchronous nature of web workers.

The turn resolution logic runs in a web worker. This means that the main thread continues to run while the worker is processing the turn. When the worker finishes, it sends a message back to the main thread, and the main thread then updates the game state.

This asynchronous behavior can lead to timing issues if not handled carefully. For example, if a sound is triggered at the "end" of a turn in the worker, but the main thread has already advanced to the next turn, the sound might not play or might play at an unexpected time.

To ensure proper timing, consider:

*   **Where effects are generated**: Effects (like sounds or VFX) should be generated in the worker and returned as part of the resolved turn state.
*   **When effects are processed**: The main thread should process these effects immediately after receiving the resolved turn state from the worker, before advancing the game to the next logical step (e.g., incrementing the turn counter).
*   **State synchronization**: Ensure that all relevant state is correctly passed to and from the worker to maintain consistency.

## Archetype Conquest Dialog Not Playing

**Problem:** The archetype-specific conquest dialog sounds were not playing after a conquest, although the generic conquest sound was.

**Root Cause:** The `playerArchetypeKey`, `playerLegacyKey`, `opponentArchetypeKey`, and `opponentLegacyKey` were not being passed from the main thread to the turn resolver web worker. The worker was therefore unable to construct the correct sound effect key for the dialog.

**Solution:**
1.  In `useGameEngine.ts`, within the `resolveTurn` function, the `serializableState` object that is sent to the worker was updated to include the missing archetype and legacy keys from the main game state.
2.  The dependency array for the `resolveTurn` `useCallback` was also updated to include these new state properties.

This ensures the worker has all the necessary information to generate the complete `effectsToPlay` queue, including the archetype-specific dialog.

## Debugging Notes

When debugging, do not remove `console.log` statements prematurely. Wait for confirmation from the user before removing them.
