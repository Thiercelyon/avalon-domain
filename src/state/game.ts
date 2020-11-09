import {User} from 'discord.js'
import Quest from '../entities/quest'
import Role from '../entities/role'

export type Players = Map<Role, User[]>

export default class Game {
    players: Players = new Map()
    quest: Quest[] = []
    quest_members: User[]

    constructor(notification_port?: NotificationPort, ...roles: Role[]) {
        this.players = !!roles ?
        roles.reduce((acc, role) => acc.set(role, []), new Map<Role, User[]>())
        : this.players = new Map<Role, User[]>()
        notification_port?.notify_game_created(this.players)
    }

    add_roles = (...roles: Role[]) => roles.forEach(role => this.players.set(role, []))
    remove_roles = (...roles: Role[]) => roles.forEach(role => this.players.delete(role))


}

export interface NotificationPort {
    notify_game_created: (players: Players) => void
}
