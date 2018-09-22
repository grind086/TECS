import { ComponentCollection } from './ComponentCollection';
import { ArgumentsFromCollection, Entity } from './types';
import { World } from './World';

export class EntityBuilder<C extends { [name: string]: ComponentCollection } = {}> {
    private _world: World<C, any>;
    private _entity: Entity;
    private _pendingComponents: { [name: string]: any[] };

    constructor(world: World<C, any>, entity: Entity) {
        this._world = world;
        this._entity = entity;
        this._pendingComponents = {};
    }

    public with<N extends keyof C>(name: N, ...params: ArgumentsFromCollection<C[N]>): this {
        this._pendingComponents[<string>name] = params;
        return this;
    }

    public build(): Entity {
        for (const [name, params] of Object.entries(this._pendingComponents)) {
            this._world.getComponent(name).create(this._entity, ...params);
        }

        return this._entity;
    }
}
