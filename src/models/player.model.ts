import {Entity, model, property} from '@loopback/repository';

@model({settings: {}})
export class Player extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  playername: string;

  @property({
    type: 'string',
    required: true,
  })
  deckname: string;

  @property({
    type: 'string',
  })
  password?: string;

  @property({
    type: 'object',
    required: true,
  })
  maindeck: object;

  @property({
    type: 'object',
  })
  sideboard?: object;

  @property({
    type: 'object',
  })
  proxyes?: object;


  constructor(data?: Partial<Player>) {
    super(data);
  }
}

export interface PlayerRelations {
  // describe navigational properties here
}

export type PlayerWithRelations = Player & PlayerRelations;
