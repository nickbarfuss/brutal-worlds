This file contains notes and observations about the project.

## Web Worker Communication

The game uses a web worker to resolve turns in the background. The main thread sends the game state to the worker, and the worker sends back the new state.

It is crucial to ensure that the data sent to and from the worker is correctly serialized and deserialized. Any discrepancies in the data can lead to subtle bugs that are hard to track down.

When debugging issues related to turn resolution, it's important to inspect the data that is being passed to and from the worker.

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
