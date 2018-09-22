import { Component, System, SystemWorld, World } from '../src';

// tslint:disable:max-classes-per-file

class Vector3 implements Component {
    constructor(public x: number, public y: number, public z: number) {}
}

type TTimerSystem = System<{}, { timeDelta: number; timeElapsed: number }>;
class TimerSystem implements TTimerSystem {
    private _paused: boolean = true;
    private _lastUpdate: number = 0;
    private _elapsed: number = 0;

    public pause() {
        this._paused = true;
    }

    public resume() {
        if (this._paused) {
            this._lastUpdate = Date.now();
            this._paused = false;
        }
    }

    public run(world: SystemWorld<TTimerSystem>) {
        if (this._paused) {
            return;
        }

        const now = Date.now();
        const delta = (now - this._lastUpdate) / 1000;
        const elapsed = this._elapsed + delta;

        world.setResource('timeDelta', delta);
        world.setResource('timeElapsed', elapsed);

        this._lastUpdate = now;
        this._elapsed = elapsed;
    }
}

type TPhysicsSystem = System<
    {
        position: typeof Vector3;
        velocity: typeof Vector3;
    },
    { timeDelta: number }
>;
class PhysicsSystem implements TPhysicsSystem {
    public run(world: SystemWorld<TPhysicsSystem>) {
        const dt = world.getResource('timeDelta');
        for (const [pos, vel] of world.joinComponents('position', 'velocity')) {
            pos.x += vel.x * dt;
            pos.y += vel.y * dt;
            pos.z += vel.z * dt;
        }
    }
}

const w = World.create()
    .registerComponent('position', Vector3)
    .registerComponent('velocity', Vector3)
    .registerResource('timeDelta', 0)
    .registerResource('timeElapsed', 0)
    .build();

for (let i = 0; i < 100000; i++) {
    w.createEntity()
        .with('position', 0, 0, 0)
        .with('velocity', 0.18, 1, 0.73)
        .build();
}

const timer = new TimerSystem();
const physics = new PhysicsSystem();

const main = () => {
    // Normally this would be `requestAnimationFrame(main)`
    setTimeout(main, 16);
    w.runSystems([timer, physics]);
};

timer.resume();
main();
