
import * as THREE from 'three';

// Data structure to hold individual star properties for easier state management
interface Star {
    position: THREE.Vector3;
    velocity: number;
    active: boolean;
}

export const createWarpStars = () => {
    const starCount = 1000;
    const spawnRate = 20; // Stars per frame to activate during spawn phase
    const stars: Star[] = [];
    let state: 'idle' | 'spawning' | 'running' | 'ending' = 'idle';
    let activeStarCount = 0;

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 2 * 3);
    const colors = new Float32Array(starCount * 2 * 3);
    const alphas = new Float32Array(starCount * 2);

    const color = new THREE.Color();
    const spawnRange = 2500;
    const spawnZ = -2000;

    // Initialize all stars in an inactive state
    for (let i = 0; i < starCount; i++) {
        stars.push({
            position: new THREE.Vector3(), // Will be set on spawn
            velocity: THREE.MathUtils.randFloat(60, 160), // Use user's preferred speed
            active: false,
        });

        // Initialize vertices to be invisible
        const i2 = i * 2;
        alphas[i2 + 0] = 0.0;
        alphas[i2 + 1] = 0.0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('alpha', new THREE.BufferAttribute(alphas, 1));

    const material = new THREE.ShaderMaterial({
        vertexShader: `
            attribute float alpha;
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                vColor = color;
                vAlpha = alpha;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            void main() {
                gl_FragColor = vec4(vColor, vAlpha);
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
        vertexColors: true
    });

    const lines = new THREE.LineSegments(geometry, material);
    lines.name = "WarpStars";

    const spawnStar = (index: number) => {
        const star = stars[index];
        if (!star) return;

        star.active = true;
        star.position.set(
            THREE.MathUtils.randFloatSpread(spawnRange),
            THREE.MathUtils.randFloatSpread(spawnRange),
            spawnZ
        );
        activeStarCount++;

        const i6 = index * 6;
        const i2 = index * 2;
        
        color.setHSL(THREE.MathUtils.randFloat(0.5, 0.55), 1.0, THREE.MathUtils.randFloat(0.7, 0.9));
        colors[i6 + 0] = colors[i6 + 3] = color.r;
        colors[i6 + 1] = colors[i6 + 4] = color.g;
        colors[i6 + 2] = colors[i6 + 5] = color.b;

        alphas[i2 + 0] = 1.0;
        alphas[i2 + 1] = 0.0;
    };

    const update = () => {
        if (state === 'idle') return;

        if (state === 'spawning') {
            let spawnedThisFrame = 0;
            for (let i = 0; i < starCount && spawnedThisFrame < spawnRate; i++) {
                if (!stars[i].active) {
                    spawnStar(i);
                    spawnedThisFrame++;
                }
            }
            if (activeStarCount >= starCount) {
                state = 'running';
            }
        }

        const posArray = geometry.attributes.position.array as Float32Array;
        const alphaArray = geometry.attributes.alpha.array as Float32Array;
        const cameraZ = 1;
        let visibleStars = 0;

        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            if (!star.active) continue;
            
            visibleStars++;
            star.position.z += star.velocity;

            if (star.position.z > cameraZ) {
                if (state === 'ending') {
                    star.active = false;
                    activeStarCount--;
                    const i2 = i * 2;
                    alphaArray[i2 + 0] = 0;
                    alphaArray[i2 + 1] = 0;
                    continue; 
                } else { // Spawning or Running -> Recycle
                    star.position.x = THREE.MathUtils.randFloatSpread(spawnRange);
                    star.position.y = THREE.MathUtils.randFloatSpread(spawnRange);
                    star.position.z = spawnZ;
                }
            }

            const i6 = i * 6;
            const streakLength = star.velocity * 10;
            posArray[i6 + 0] = star.position.x;
            posArray[i6 + 1] = star.position.y;
            posArray[i6 + 2] = star.position.z;
            posArray[i6 + 3] = star.position.x;
            posArray[i6 + 4] = star.position.y;
            posArray[i6 + 5] = star.position.z - streakLength;
        }

        if (state === 'ending' && visibleStars === 0) {
            state = 'idle';
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.alpha.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
    };

    const start = () => {
        if (state === 'idle') {
            state = 'spawning';
        }
    };
    
    const stop = () => {
        if (state === 'spawning' || state === 'running') {
            state = 'ending';
        }
    };

    const reset = () => {
        state = 'idle';
        activeStarCount = 0;
        for (let i = 0; i < starCount; i++) {
            stars[i].active = false;
            const i2 = i * 2;
            alphas[i2 + 0] = 0.0;
            alphas[i2 + 1] = 0.0;
        }
        geometry.attributes.alpha.needsUpdate = true;
    };

    return { lines, start, stop, update, reset };
};
