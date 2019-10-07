import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import { Player } from '../models';
import { PlayerRepository } from '../repositories';
import { main } from '..';

export class PlayerController {
  constructor(
    @repository(PlayerRepository)
    public playerRepository: PlayerRepository,
  ) { }


  getExpandedCardList(player: any): String[] {
    let maindeck = player.maindeck.data
    let sideboard = player.sideboard.data
    let cards = maindeck.concat(sideboard)
    console.log(player.maindeck)
    let totalCards: String[] = []
    cards.forEach((item: { cardJSON: any; quantity: number; }) => {
      for (let i = 0; i < item.quantity; i++) {
        totalCards.push(String(item['cardJSON']['name']))
      }
    });

    return totalCards
  }

  checkEditValidity(playerOld: any, playerNew: any): Boolean {
    let expandedPlayerOld = this.getExpandedCardList(playerOld)
    let expandedPlayerNew = this.getExpandedCardList(playerNew)
    console.log(expandedPlayerOld)
    let diff = expandedPlayerOld.filter(x => !expandedPlayerNew.includes(x));
    return diff.length <= 6
  }

  @post('/players', {
    responses: {
      '200': {
        description: 'Player model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Player) } },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Player, { exclude: ['id'] }),
        },
      },
    })
    player: Omit<Player, 'id'>,
  ): Promise<Player> {
    let p = await this.playerRepository.find({
      where: { playername: player.playername },
      limit: 1,
    });
    //If player Name already exist
    if (p.length > 0) {
      let password = p[0].password
      if (password === player.password) {
        if (!this.checkEditValidity(player, p[0])) {
          throw {
            code: 400,
            message: "You can't edit more than 6 cards at a time, contact the admins for clarification on the league's rules",
            name: "InvalidEditError"
          }
        }
        this.playerRepository.updateById(p[0].id, player)
        return p[0]
      } else {
        throw {
          code: 400,
          message: "Player name already exist",
          name: "UserAlreadyExistError"
        }
      }
    }
    return this.playerRepository.create(player);
  }

  @get('/players/names', {
    responses: {
      '200': {
        description: 'Array of Player model instances',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Player, { exclude: ['id', "deckname", "maindeck", "password", "sideboard", "proxyes"] }),
          },
        },
      },
    },
  })
  async findNames(
    @param.query.object('filter', getFilterSchemaFor(Player))
    filter?: Filter<Player>,
  ): Promise<Object> {
    let p = await this.playerRepository.find(filter);
    let names = p.map(item => {
      return { name: item.playername }
    })
    return names
  }

  @get('/players/count', {
    responses: {
      '200': {
        description: 'Player model count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(Player))
    where?: Where<Player>,
  ): Promise<Count> {
    return this.playerRepository.count(where);
  }

  @get('/players', {
    responses: {
      '200': {
        description: 'Array of Player model instances',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Player) },
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(Player))
    filter?: Filter<Player>,
  ): Promise<Player[]> {
    return this.playerRepository.find(filter);
  }

  @patch('/players', {
    responses: {
      '200': {
        description: 'Player PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Player, { partial: true }),
        },
      },
    })
    player: Player,
    @param.query.object('where', getWhereSchemaFor(Player))
    where?: Where<Player>,
  ): Promise<Count> {
    return this.playerRepository.updateAll(player, where);
  }

  @get('/players/{id}', {
    responses: {
      '200': {
        description: 'Player model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Player) } },
      },
    },
  })
  async findById(@param.path.number('id') id: number): Promise<Player> {
    return this.playerRepository.findById(id);
  }

  @patch('/players/{id}', {
    responses: {
      '204': {
        description: 'Player PATCH success',
      },
    },
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Player, { partial: true }),
        },
      },
    })
    player: Player,
  ): Promise<void> {
    await this.playerRepository.updateById(id, player);
  }

  @put('/players/{id}', {
    responses: {
      '204': {
        description: 'Player PUT success',
      },
    },
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() player: Player,
  ): Promise<void> {
    await this.playerRepository.replaceById(id, player);
  }

  @del('/players/{id}', {
    responses: {
      '204': {
        description: 'Player DELETE success',
      },
    },
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.playerRepository.deleteById(id);
  }
}
