import Discord from 'discord.js'
import config from '../config.json'
import RoleAssignmentBot from './services/role-assignment'

export const client = new Discord.Client()
client.login(config.token)

new RoleAssignmentBot()
