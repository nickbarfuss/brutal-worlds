

import * as THREE from 'three';

export const createStarfield = (count: number, radius: number, baseSize: number) => {
    const positions: number[] = [];
    const colors: number[] = [];
    const sizes: number[] = [];
    const color = new THREE.Color();

    const milkyWayStars = Math.floor(count * 0.60);
    const fieldStars = count - milkyWayStars;

    const galaxyLength = radius * 1.5;
    const galaxyHeight = radius * 0.4;
    const galaxyThickness = radius * 0.1;

    for (let i = 0; i < milkyWayStars; i++) {
        let x, y, z, dSq;
        do {
            x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
            dSq = x * x + y * y + z * z;
        } while (dSq > 1);

        const pointInEllipsoid = new THREE.Vector3(x * galaxyLength, y * galaxyHeight, z * galaxyThickness);
        pointInEllipsoid.normalize().multiplyScalar(radius * (1 + Math.random() * 0.1));
        
        positions.push(pointInEllipsoid.x, pointInEllipsoid.y, pointInEllipsoid.z);
        color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.7 + Math.random() * 0.3);
        colors.push(color.r, color.g, color.b);
        sizes.push((Math.random() * 0.8 + 0.2) * baseSize * 2);
    }
    
    for (let i = 0; i < fieldStars; i++) {
        const vertex = new THREE.Vector3((Math.random() * 2 - 1), (Math.random() * 2 - 1), (Math.random() * 2 - 1)).normalize();
        vertex.multiplyScalar(radius * (1 + Math.random() * 0.1));
        positions.push(vertex.x, vertex.y, vertex.z);
        color.setHSL(0.55 + Math.random() * 0.1, 0.8, 0.7 + Math.random() * 0.3);
        colors.push(color.r, color.g, color.b);
        sizes.push((Math.random() * 0.8 + 0.2) * baseSize * 2);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('customColor', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const randomRotation = new THREE.Euler(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    geometry.applyMatrix4(new THREE.Matrix4().makeRotationFromEuler(randomRotation));

    const material = new THREE.ShaderMaterial({
        uniforms: { globalOpacity: { value: 1.0 } },
        vertexShader: `
            attribute float size; attribute vec3 customColor; varying vec3 vColor;
            void main() {
                vColor = customColor; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (200.0 / -mvPosition.z); gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform float globalOpacity; varying vec3 vColor;
            void main() {
                float d = distance(gl_PointCoord, vec2(0.5, 0.5)); if (d > 0.5) discard;
                float alpha = 1.0 - smoothstep(0.4, 0.5, d);
                gl_FragColor = vec4(vColor, alpha * globalOpacity);
            }
        `,
        blending: THREE.AdditiveBlending, depthWrite: false, transparent: true,
    });
    
    const points = new THREE.Points(geometry, material);
    points.renderOrder = -10;
    return points;
};
