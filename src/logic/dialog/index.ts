import * as THREE from 'three';
import { GameState, ConquestEvent, PlayerIdentifier } from '@/types/game';

export const selectConquestDialog = (
  conquestEvents: ConquestEvent[],
  gameState: GameState,
): { dialogKey: string; position: THREE.Vector3, conqueror: PlayerIdentifier } | null => {
  if (conquestEvents.length === 0) {
    return null;
  }

  const firstConquerors = conquestEvents
    .map(event => event.conqueror)
    .filter(playerId => !gameState.conquestDialogState[playerId]?.hasHadFirstConquestDialog);

  const uniqueFirstConquerors = [...new Set(firstConquerors)];

  const humanPlayerId = 'player-1';
  if (uniqueFirstConquerors.includes(humanPlayerId)) {
    const humanConquestEvent = conquestEvents.find(e => e.conqueror === humanPlayerId)!;
    const enclave = gameState.enclaveData[humanConquestEvent.enclaveId];
    return {
      dialogKey: `archetype-${humanConquestEvent.archetypeKey}-${humanConquestEvent.legacyKey}-dialog-conquest`,
      position: enclave.center,
      conqueror: humanPlayerId,
    };
  } else if (uniqueFirstConquerors.length > 0) {
    const aiConquerorId = uniqueFirstConquerors[0] as PlayerIdentifier;
    const aiConquestEvent = conquestEvents.find(e => e.conqueror === aiConquerorId)!;
    const enclave = gameState.enclaveData[aiConquestEvent.enclaveId];
    return {
      dialogKey: `archetype-${aiConquestEvent.archetypeKey}-${aiConquestEvent.legacyKey}-dialog-conquest`,
      position: enclave.center,
      conqueror: aiConquerorId,
    };
  }

  const conquestCounts = conquestEvents.reduce((acc, event) => {
    acc[event.conqueror] = (acc[event.conqueror] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxConquests = Math.max(...Object.values(conquestCounts));
  const topConquerors = Object.keys(conquestCounts).filter(
    id => conquestCounts[id] === maxConquests
  );

  const chosenConquerorId = topConquerors[Math.floor(Math.random() * topConquerors.length)] as PlayerIdentifier;

  // With no first-time conquerors, there's a 50% chance to play a dialog from the top conqueror
  if (Math.random() < 0.5) {
    const chosenConquestEvent = conquestEvents.find(e => e.conqueror === chosenConquerorId)!;
    const enclave = gameState.enclaveData[chosenConquestEvent.enclaveId];
    return {
      dialogKey: `archetype-${chosenConquestEvent.archetypeKey}-${chosenConquestEvent.legacyKey}-dialog-conquest`,
      position: enclave.center,
      conqueror: chosenConquerorId,
    };
  }

  return null;
};
