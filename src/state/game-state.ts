import {TextChannel, User} from 'discord.js'
import {Quest} from '../domain/quest'
import {Role} from '../domain/roles'

export class GameState {
  players: Map<Role, User[]> = new Map<Role, User[]>()
  quest: Quest[] = []
  channel: TextChannel
}
