import {User} from 'discord.js'
import QuestStatus from '../entities/quest'
import Role from '../entities/role'
import Players from './Players'

export default class Game {
    players: Players = new Players()
    quest: QuestStatus[] = []
    quest_members: User[] = []

    constructor(notification_port?: NotificationPort, ...roles: Role[]) {
        this.players = new Players(...roles)
        notification_port?.notify_game_created(this.players)
    }

}

export interface NotificationPort {
    notify_game_created: (players: Players) => void
}
