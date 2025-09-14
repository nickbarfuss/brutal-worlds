import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ARCHETYPES } from '@/data/archetypes';
import { WORLD_LIBRARY } from '@/data/worlds';
import ButtonBasic from '@/components/ui/ButtonBasic';
import ArchetypeSelectionCard from '@/components/ArchetypeSelectionCard';
import WorldSelectionCard from '@/components/WorldSelectionCard';
import { AudioChannel } from '@/types/game';
import { ASSETS } from '@/data/assets';

interface GameStartDialogProps {
    onConfirm: (archetypeKey: string, worldKey: string, legacyIndex: number) => void;
    onClose: () => void;
    isClosing: boolean;
    //Gemini note: need to alloe playsound to to be a key from ASSETS
    playSound: (key: string, channel?: AudioChannel) => void;
}

type DialogStep = 'archetype' | 'world';

const GameStartDialog: React.FC<GameStartDialogProps> = ({ onConfirm, onClose, isClosing, playSound }) => {
    const [step, setStep] = useState<DialogStep>('archetype');
    const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string | null>(null);
    const [selectedLegacyIndex, setSelectedLegacyIndex] = useState<number | null>(null);
    const [selectedWorldKey, setSelectedWorldKey] = useState<string | null>(null);

    const sliderRef = useRef<HTMLDivElement>(null);
    const archetypeCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    const worldCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const allLegacies = useMemo(() => {
        return Object.values(ARCHETYPES)
            .flatMap(archetype => 
                archetype.legacies.map((legacy, index) => ({
                    archetype,
                    legacy,
                    legacyIndex: index
                }))
            )
            .sort((a, b) => {
                if (a.archetype.name !== b.archetype.name) {
                    return a.archetype.name.localeCompare(b.archetype.name);
                }
                return a.legacy.name.localeCompare(b.legacy.name);
            });
    }, []);

    const sortedWorlds = useMemo(() => [...WORLD_LIBRARY].sort((a, b) => a.name.localeCompare(b.name)), []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const handleSelectLegacy = (archetypeKey: string, legacyIndex: number) => {
        playSound(ASSETS.ui.common.buttonDialogNav, 'ui');

        const isAlreadySelected = selectedArchetypeKey === archetypeKey && selectedLegacyIndex === legacyIndex;

        if (isAlreadySelected) {
            setSelectedArchetypeKey(null);
            setSelectedLegacyIndex(null);
        } else {
            setSelectedArchetypeKey(archetypeKey);
            setSelectedLegacyIndex(legacyIndex);
            
            // Gemini note: these sounds shoud not be hardcoded here.
            // they should be loaded from assets
            let soundKeys: string[] = [];
            switch (archetypeKey) {
                case 'first-sword': soundKeys = ['archetype-first-sword-1', 'archetype-first-sword-2', 'archetype-first-sword-3', 'archetype-first-sword-4']; break;
                case 'pact-whisperer': soundKeys = ['archetype-pact-whisperer-1', 'archetype-pact-whisperer-2', 'archetype-pact-whisperer-3', 'archetype-pact-whisperer-4']; break;
                case 'labyrinthine-ghost': soundKeys = ['archetype-labyrinthine-ghost-1', 'archetype-labyrinthine-ghost-2', 'archetype-labyrinthine-ghost-3', 'archetype-labyrinthine-ghost-4']; break;
                case 'resonance-warden': soundKeys = ['archetype-resonance-warden-1', 'archetype-resonance-warden-2', 'archetype-resonance-warden-3', 'archetype-resonance-warden-4', 'archetype-resonance-warden-5']; break;
            }
            if (soundKeys.length > 0) {
                const randomKey = soundKeys[Math.floor(Math.random() * soundKeys.length)];
                playSound(randomKey, 'fx');
            }
        }
    };

    const handleSelectWorld = (key: string) => {
        playSound('ui-button-dialog-nav', 'ui');
        const newKey = selectedWorldKey === key ? null : key;
        setSelectedWorldKey(newKey);
    };
    
    const scrollToCard = (key: string | null, cardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>) => {
        if (!key) return;
    
        const container = sliderRef.current;
        if (!container) return;
    
        const UNSELECTED_WIDTH = 448; // w-[28rem]
        const SELECTED_WIDTH = 960;   // w-[60rem]
        const GAP = 24;               // gap-6
        const PADDING_LEFT = 32;      // pl-8
        const PADDING_RIGHT = 8;      // w-2 spacer, gives 24px gap before it
    
        const allKeys = Object.keys(cardRefs.current);
        const selectedIndex = allKeys.findIndex(k => k === key);
        if (selectedIndex === -1) return;
    
        const finalOffsetLeft = PADDING_LEFT + selectedIndex * (UNSELECTED_WIDTH + GAP);
        const totalCards = allKeys.length;
        const totalCardWidths = (totalCards - 1) * UNSELECTED_WIDTH + SELECTED_WIDTH;
        const totalGapWidths = (totalCards - 1) * GAP;
        const finalScrollWidth = PADDING_LEFT + totalCardWidths + totalGapWidths + PADDING_RIGHT;
        const containerWidth = container.clientWidth;
        const targetScrollLeft = finalOffsetLeft - (containerWidth / 2) + (SELECTED_WIDTH / 2);
        const maxScrollLeft = finalScrollWidth - containerWidth;
        const finalScrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
    
        container.scrollTo({
            left: finalScrollLeft,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        if (step === 'archetype') {
            const selectedLegacy = allLegacies.find(item => item.archetype.key === selectedArchetypeKey && item.legacyIndex === selectedLegacyIndex);
            scrollToCard(selectedLegacy?.legacy.key ?? null, archetypeCardRefs);
        }
    }, [selectedArchetypeKey, selectedLegacyIndex, step, allLegacies]);
    
    useEffect(() => {
        if (step === 'world') {
            scrollToCard(selectedWorldKey, worldCardRefs);
        }
    }, [selectedWorldKey, step]);


    const handleNext = () => {
        if (selectedArchetypeKey) {
            playSound(ASSETS.ui.common.buttonDialogComplete, 'ui');
            setStep('world');
        }
    };

    const handleBack = () => {
        playSound(ASSETS.ui.common.buttonDialogComplete, 'ui');
        setStep('archetype');
    };

    const handleConfirm = () => {
        if (selectedArchetypeKey && selectedLegacyIndex !== null && selectedWorldKey) {
            onConfirm(selectedArchetypeKey, selectedWorldKey, selectedLegacyIndex);
        }
    };
    
    const renderHeader = () => {
        if (step === 'archetype') {
            return (
                <>
                    <h2 className="text-3xl font-bold">Choose Your Legacy</h2>
                    <p className="text-lg text-neutral-400">Step 1 of 2</p>
                </>
            );
        }
        if (step === 'world') {
            return (
                <>
                    <h2 className="text-3xl font-bold">Select a World</h2>
                    <p className="text-lg text-neutral-400">Step 2 of 2</p>
                </>
            );
        }
    };
    
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (sliderRef.current) {
            sliderRef.current.scrollLeft += e.deltaY;
        }
    };
    
    const animationClass = isClosing ? 'animate-close-dialog' : 'animate-open-dialog';

    return (
        <div className={`fixed inset-0 flex items-center justify-center z-50 ${animationClass}`}>
            <div className="bg-neutral-900 relative flex flex-col w-4/5 max-w-[1880px] min-w-[800px] h-4/5 min-h-[960px] rounded-2xl border border-neutral-700/50 shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-start px-8 py-4 border-b border-neutral-700 flex-shrink-0">
                    <div>
                        {renderHeader()}
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors duration-200">
                        <span className="material-symbols-outlined text-4xl">close</span>
                    </button>
                </div>
                
                <div 
                    ref={sliderRef}
                    key={step} 
                    className="flex-grow overflow-x-auto no-scrollbar py-8 pl-8"
                    onWheel={handleWheel}
                >
                    <div className="flex flex-row items-stretch gap-6 h-full">
                        {step === 'archetype' && allLegacies.map(({ archetype, legacy, legacyIndex }) => (
                            <div key={legacy.key} ref={el => { archetypeCardRefs.current[legacy.key] = el; }}>
                                <ArchetypeSelectionCard
                                    archetype={archetype}
                                    legacy={legacy}
                                    isSelected={selectedArchetypeKey === archetype.key && selectedLegacyIndex === legacyIndex}
                                    onClick={() => handleSelectLegacy(archetype.key, legacyIndex)}
                                />
                            </div>
                        ))}
                        {step === 'world' && sortedWorlds.map(world => (
                           <div key={world.key} ref={el => { worldCardRefs.current[world.key] = el; }}>
                               <WorldSelectionCard
                                   world={world}
                                   isSelected={selectedWorldKey === world.key}
                                   onClick={() => handleSelectWorld(world.key)}
                               />
                           </div>
                       ))}
                       <div aria-hidden="true" className="w-2 flex-shrink-0" />
                    </div>
                </div>

                <div className="px-8 py-4 mt-auto border-t border-neutral-700 flex justify-between items-center flex-shrink-0">
                    {step === 'world' ? (
                        <button onClick={handleBack} className="text-neutral-400 hover:text-white font-semibold px-4 py-3 rounded-full transition">
                            Back
                        </button>
                    ) : (
                        <div /> // Placeholder
                    )}
                    
                    {step === 'archetype' ? (
                         <ButtonBasic onClick={handleNext} disabled={!selectedArchetypeKey}>
                            Continue
                        </ButtonBasic>
                    ) : (
                         <ButtonBasic onClick={handleConfirm} disabled={!selectedWorldKey}>
                            Begin Conquest
                        </ButtonBasic>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameStartDialog;