import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import { PollutionLevel, Fish } from '../types';

interface PixiOceanSceneProps {
    pollutionLevel: PollutionLevel;
    activeFish: Fish[];
}

export const PixiOceanScene: React.FC<PixiOceanSceneProps> = ({ pollutionLevel, activeFish }) => {
    const canvasRef = useRef<HTMLDivElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const fishSpritesRef = useRef<Map<string, PIXI.Text>>(new Map());
    const bubblesRef = useRef<PIXI.Container | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        let app: PIXI.Application | null = null;

        // Initialize PixiJS Application (async for v8)
        (async () => {
            app = new PIXI.Application();
            await app.init({
                width: 1000,
                height: 600,
                background: 0x0EA5E9,
                antialias: true,
                resolution: window.devicePixelRatio || 1,
                autoDensity: true,
            });

            if (!canvasRef.current) return;
            canvasRef.current.appendChild(app.canvas);
            appRef.current = app;

            // Create layers
            const waterLayer = new PIXI.Container();
            const coralLayer = new PIXI.Container();
            const fishLayer = new PIXI.Container();
            const bubblesLayer = new PIXI.Container();
            const effectsLayer = new PIXI.Container();

            app.stage.addChild(waterLayer);
            app.stage.addChild(coralLayer);
            app.stage.addChild(fishLayer);
            app.stage.addChild(bubblesLayer);
            app.stage.addChild(effectsLayer);

            bubblesRef.current = bubblesLayer;

            // Create water background with gradient
            const waterGradient = createWaterGradient(app, pollutionLevel);
            waterLayer.addChild(waterGradient);

            // Create sandy bottom
            const sand = new PIXI.Graphics();
            sand.beginFill(0xE6D5B8, 0.7);
            sand.drawRect(0, 520, 1000, 80);
            sand.endFill();
            waterLayer.addChild(sand);

            // Create coral reef
            createCoralReef(coralLayer, pollutionLevel);

            // Create light rays (only in clean water)
            if (pollutionLevel <= 1) {
                createLightRays(effectsLayer, pollutionLevel);
            }

            // Create bubbles
            createBubbles(bubblesLayer, pollutionLevel);

            // Animation loop
            let time = 0;
            app.ticker.add(() => {
                time += 0.016; // ~60fps

                // Animate bubbles
                bubblesLayer.children.forEach((bubble: any) => {
                    if (bubble.vy) {
                        bubble.y -= bubble.vy;
                        bubble.x += Math.sin(time * 2 + bubble.offset) * 0.5;
                        bubble.alpha = Math.max(0, Math.min(1, (600 - bubble.y) / 600));

                        if (bubble.y < -10) {
                            bubble.y = 610;
                            bubble.x = Math.random() * 1000;
                        }
                    }
                });

                // Animate fish
                fishLayer.children.forEach((fish: any, i: number) => {
                    if (fish.baseY !== undefined) {
                        fish.y = fish.baseY + Math.sin(time * 2 + i) * 5;
                        fish.x += fish.direction * 0.3;

                        // Wrap around
                        if (fish.x > 1050) {
                            fish.x = -50;
                        } else if (fish.x < -50) {
                            fish.x = 1050;
                        }
                    }
                });
            });
        })();

        return () => {
            if (app) {
                app.destroy(true, { children: true, texture: true });
            }
        };
    }, [pollutionLevel]);

    // Update fish when they change
    useEffect(() => {
        if (!appRef.current) return;

        const fishLayer = appRef.current.stage.children[2] as PIXI.Container;
        const currentFishIds = new Set(activeFish.map(f => f.id));
        const existingIds = new Set(fishSpritesRef.current.keys());

        // Remove fish that are no longer active
        existingIds.forEach(id => {
            if (!currentFishIds.has(id)) {
                const sprite = fishSpritesRef.current.get(id);
                if (sprite) {
                    fishLayer.removeChild(sprite);
                    fishSpritesRef.current.delete(id);
                }
            }
        });

        // Add new fish
        activeFish.forEach((fish, index) => {
            if (!fishSpritesRef.current.has(fish.id)) {
                const fishText = new PIXI.Text(fish.emoji, {
                    fontSize: fish.size === 'large' ? 48 : fish.size === 'medium' ? 36 : 28,
                    fill: 0xFFFFFF,
                });

                // Position fish
                const hash = fish.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                fishText.x = (hash * 7) % 900 + 50;
                fishText.y = 200 + (hash * 13) % 250;
                (fishText as any).baseY = fishText.y;
                (fishText as any).direction = (hash % 2) * 2 - 1; // -1 or 1

                fishLayer.addChild(fishText);
                fishSpritesRef.current.set(fish.id, fishText);
            }
        });
    }, [activeFish]);

    return (
        <div
            ref={canvasRef}
            className="w-full h-full flex items-center justify-center rounded-xl overflow-hidden shadow-2xl"
            style={{ minHeight: '400px', maxHeight: '600px' }}
        />
    );
};

// Helper: Create water gradient background
function createWaterGradient(app: PIXI.Application, pollutionLevel: PollutionLevel): PIXI.Graphics {
    const graphics = new PIXI.Graphics();

    // Define colors for each pollution level
    const colors = [
        [0x38BDF8, 0x0EA5E9, 0x3B82F6, 0x1E3A8A], // Pristine
        [0x34D399, 0x10B981, 0x3B82F6, 0x1E40AF], // Warning
        [0x22C55E, 0x059669, 0x3B82F6, 0x475569], // Polluted
        [0x16A34A, 0x475569, 0x475569, 0x1E293B], // Severely Polluted
        [0x64748B, 0x334155, 0x334155, 0x0F172A], // Dead Zone
    ];

    const levelColors = colors[pollutionLevel];

    // Create vertical gradient by drawing colored rectangles
    for (let y = 0; y < 600; y++) {
        const ratio = y / 600;
        let color;

        if (ratio < 0.33) {
            color = interpolateColor(levelColors[0], levelColors[1], ratio * 3);
        } else if (ratio < 0.66) {
            color = interpolateColor(levelColors[1], levelColors[2], (ratio - 0.33) * 3);
        } else {
            color = interpolateColor(levelColors[2], levelColors[3], (ratio - 0.66) * 3);
        }

        graphics.rect(0, y, 1000, 1);
        graphics.fill(color);
    }

    return graphics;
}

// Helper: Create coral reef
function createCoralReef(container: PIXI.Container, pollutionLevel: PollutionLevel) {
    if (pollutionLevel > 2) return; // No coral in heavy pollution

    const coralColors = pollutionLevel === 0
        ? [0xFF6B9D, 0xFFD93D, 0x6BCF7F, 0xF472B6, 0xFB923C]
        : [0xA78295, 0xB8A880, 0x7A9985, 0x888888, 0x999999];

    const positions = [80, 220, 380, 540, 720, 880];

    positions.forEach((x, i) => {
        // Create coral cluster
        for (let j = 0; j < 3; j++) {
            const coral = new PIXI.Graphics();
            coral.ellipse(
                x + (j - 1) * 30,
                550,
                25 + j * 5,
                35 + j * 8
            );
            coral.fill({ color: coralColors[j % coralColors.length], alpha: 0.8 });
            container.addChild(coral);
        }
    });
}

// Helper: Create light rays
function createLightRays(container: PIXI.Container, pollutionLevel: PollutionLevel) {
    const opacity = pollutionLevel === 0 ? 0.15 : 0.08;

    for (let i = 0; i < 7; i++) {
        const ray = new PIXI.Graphics();
        ray.moveTo(100 + i * 140, 0);
        ray.lineTo(120 + i * 140, 0);
        ray.lineTo(140 + i * 140, 600);
        ray.lineTo(110 + i * 140, 600);
        ray.closePath();
        ray.fill({ color: 0xFFFFFF, alpha: opacity });
        container.addChild(ray);
    }
}

// Helper: Create bubbles
function createBubbles(container: PIXI.Container, pollutionLevel: PollutionLevel) {
    if (pollutionLevel > 1) return; // No bubbles in polluted water

    for (let i = 0; i < 20; i++) {
        const bubble = new PIXI.Graphics();
        const size = 3 + Math.random() * 5;
        bubble.circle(0, 0, size);
        bubble.fill({ color: 0xFFFFFF, alpha: 0.6 });

        bubble.x = Math.random() * 1000;
        bubble.y = Math.random() * 600;
        (bubble as any).vy = 0.5 + Math.random() * 1;
        (bubble as any).offset = Math.random() * Math.PI * 2;

        container.addChild(bubble);
    }
}

// Helper: Interpolate between two colors
function interpolateColor(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 0xFF;
    const g1 = (color1 >> 8) & 0xFF;
    const b1 = color1 & 0xFF;

    const r2 = (color2 >> 16) & 0xFF;
    const g2 = (color2 >> 8) & 0xFF;
    const b2 = color2 & 0xFF;

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
}
