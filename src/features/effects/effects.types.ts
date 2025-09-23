import * as THREE from 'three';

export interface ActiveEffect {
    key: string;
    video: HTMLVideoElement;
    worldPosition: THREE.Vector3;
    width: number;
    height: number;
    onEnded: () => void;
}
