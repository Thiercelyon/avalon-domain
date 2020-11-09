import {Message, TextChannel, User} from 'discord.js'
import * as _ from 'lodash'
import Quest from '../entities/quest'
import Role from '../entities/role'
import {client} from '../index'

const roles: Role[] = [
    Role.LOYAL_SERVANT,
    Role.LOYAL_SERVANT,
    Role.LOYAL_SERVANT,
    Role.MERLIN,
    Role.GOOD_LANCELOT,
    Role.EVIL_LANCELOT,
    Role.MORDRED,
    Role.MORGANA,
    Role.PERCIVAL,
    Role.OBERON,
]

export default class RoleAssignmentBot {
    private players: Map<Role, User[]> = new Map<Role, User[]>([
        [Role.LOYAL_SERVANT, []],
        [Role.GOOD_LANCELOT, []],
        [Role.MERLIN, []],
        [Role.PERCIVAL, []],
        [Role.MORDRED, []],
        [Role.MORGANA, []],
        [Role.OBERON, []],
        [Role.EVIL_LANCELOT, []],
    ])
    private roles: Role[] = []
    private quest: Quest[] = []
    private questMembers: User[] = []
    private mainChannel: TextChannel

    constructor() {
        client.on('message', (message: Message) => {
            if (message.content.startsWith('!') && !message.author.bot) {
                try {
                    const [command, ...args] = message.content.substring(1).split(' ')
                    if (this.COMMANDS.get(command))
                        this.COMMANDS.get(command).callback(message, ...args)
                    else message.channel.send(`<${command}> is not a valid command.`)
                } catch (error) {
                    console.error(error)
                    message.channel.send(error.message)
                }
            }
        })
    }

    init = ({channel}: Message) => {
        this.mainChannel = channel as TextChannel
        this.roles = []
        this.players = new Map<Role, User[]>([
            [Role.LOYAL_SERVANT, []],
            [Role.GOOD_LANCELOT, []],
            [Role.MERLIN, []],
            [Role.PERCIVAL, []],
            [Role.MORDRED, []],
            [Role.MORGANA, []],
            [Role.OBERON, []],
            [Role.EVIL_LANCELOT, []],
        ])
        roles.forEach(r => this.roles.push(r))
        this.shuffle(this.roles)
        channel.send(`Initialisation d'une nouvelle session avec ces rôles : [${roles.join(' | ')}]
        Lancez chacun votre tour **ET UNE SEULE FOIS** la commande **!assign** pour obtenir votre rôle.`)
    }

    assign = ({channel, author}: Message) => {
        if (this.roles.length === 0)
            channel.send("Désolé, plus aucun rôle n'est disponible :-(")
        console.log({author})
        channel.send(`Je t'envoie ton rôle en MP ${author.toString()}`)
        const role = this.roles.pop()
        author.send(`Pour cette partie, tu seras : ${role} !`)
        this.players.get(role).push(author)
    }

    cheat = ({channel}: Message) =>
        channel.send(`
    Vassaux : ${this.players.get(Role.LOYAL_SERVANT)},
    Merlin : ${this.players.get(Role.MERLIN)},
    Lancelot gentil : ${this.players.get(Role.GOOD_LANCELOT)},
    Lancelot méchant : ${this.players.get(Role.EVIL_LANCELOT)},
    Perceval : ${this.players.get(Role.PERCIVAL)},
    Mordred : ${this.players.get(Role.MORDRED)},
    Morgane : ${this.players.get(Role.MORGANA)},
    Obeyron : ${this.players.get(Role.OBERON)},
    `)

    night_phase = () => {
        this.merlin()
        this.lancelot_g()
        this.lancelot_m()
        this.perceval()
        this.mechants(Role.MORDRED)
        this.mechants(Role.MORGANA)
        this.mechants(Role.EVIL_LANCELOT)
    }

    merlin = () =>
        this.players
            .get(Role.MERLIN)[0]
            .send(
                `Voici les méchants : ${[
                    this.players.get(Role.MORGANA),
                    this.players.get(Role.EVIL_LANCELOT),
                    this.players.get(Role.OBERON),
                ]}`
            )

    perceval = () =>
        this.players
            .get(Role.PERCIVAL)[0]
            .send(
                `Voici Morgane et Merlin : ${[
                    this.players.get(Role.MORGANA),
                    this.players.get(Role.MERLIN),
                ]}`
            )

    lancelot_g = () =>
        this.players
            .get(Role.GOOD_LANCELOT)[0]
            .send(
                `Voici ton antagoniste : ${[this.players.get(Role.EVIL_LANCELOT)]}`
            )

    lancelot_m = () =>
        this.players
            .get(Role.EVIL_LANCELOT)[0]
            .send(
                `Voici ton antagoniste : ${[this.players.get(Role.GOOD_LANCELOT)]}`
            )

    mechants = (role: Role) =>
        this.players
            .get(role)[0]
            .send(
                `Voici l'équipe de bad guys : ${[
                    this.players.get(Role.MORDRED),
                    this.players.get(Role.MORGANA),
                    this.players.get(Role.EVIL_LANCELOT),
                ]}`
            )

    initQuest = ({channel}: Message, ...playerIds: string[]) => {
        if (_.uniq(playerIds).length !== playerIds.length)
            throw Error('ERREUR: Chaque joueur ne peut être présent qu\'une fois dans la quête !')
        let players: User[] = playerIds
            .map((playerId: string) => {
                if (!playerId.startsWith('<@!')) {
                    throw Error('ERREUR: Il ne faut me donner que des joueurs valides, dont le nom doit être en surbrillance en bleu (sélectionnés par autocomplétion et touche ENTREE).')
                }
                return this.mainChannel.members.get(playerId.slice(3, playerId.length - 1)).user
            })
        channel.send(`Un équipage de **${players.length} aventuriers** part en quête !
            Il est composé de **${players.join(' | ')}** !
            Aventuriers ! Envoyez moi un **UNIQUE** MP avec la commande **!quest <SUCCESS|FAIL>** pour contribuer à sa réussite... Ou son échec...`)
        this.quest = []
        this.questMembers = players
    }

    achieveQuest = ({author}: Message, quest: Quest) => {
        if (!Object.keys(Quest).includes(quest)) {
            throw Error('Merci de ne m\'envoyer que des valeurs valides: `!quest SUCCESS` ou `!quest FAIL`')
        }
        this.quest.push(quest)
        _.remove(this.questMembers, member => {
            return member.id === author.id
        })
        if (this.questMembers.length > 0)
            this.mainChannel.send(
                `Il nous manque encore ${this.questMembers.length} vote(s) (${this.questMembers.join(' | ')}).`
            )
        else if (this.questMembers.length === 0) {
            this.mainChannel.send(`La quête est terminée !
            ${this.shuffle(this.quest).join(' | ')}`)
        } else {
            this.mainChannel.send('Mais virez moi ce clampin qui continue à voter alors que c\'est fini !')
        }
    }

    help = (channel: TextChannel, command: string) =>
        this.COMMANDS.get(command)
            ? channel.send(
                `${this.COMMANDS.get(command).doc}\n${this.COMMANDS.get(command).help || ''
                }`
            )
            : channel.send(`I don't know this command : '${command}'`)

    COMMANDS = new Map<string, {
        callback: (...args: any[]) => void;
        doc: string;
        help?: string
    }>
        ([
            [
                'assign',
                {
                    callback: this.assign,
                    doc: '',
                },
            ],
            [
                'init',
                {
                    callback: this.init,
                    doc: '',
                },
            ],
            [
                'cheat',
                {
                    callback: this.cheat,
                    doc: '',
                },
            ],
            [
                'initQuest',
                {
                    callback: this.initQuest,
                    doc: '',
                },
            ],
            [
                'quest',
                {
                    callback: this.achieveQuest,
                    doc: '',
                },
            ],
            [
                'night',
                {
                    callback: this.night_phase,
                    doc: '',
                },
            ],
            [
                'perceval',
                {
                    callback: this.perceval,
                    doc: '',
                },
            ],
            [
                'lancelot_g',
                {
                    callback: this.lancelot_g,
                    doc: '',
                },
            ],
            [
                'lancelot_m',
                {
                    callback: this.lancelot_m,
                    doc: '',
                },
            ],
            [
                'perceval',
                {
                    callback: this.perceval,
                    doc: '',
                },
            ],
            [
                'merlin',
                {
                    callback: this.merlin,
                    doc: '',
                },
            ],
            [
                'mechants',
                {
                    callback: this.merlin,
                    doc: '',
                },
            ],
            [
                'help',
                {
                    callback: this.help,
                    doc: `- Help
                !help COMMAND : show the help documentation for the provided command.`,
                },
            ],
        ])

    /**
     * Shuffles array in place.
     * @param {Array} a items An array containing the items.
     */
    private shuffle = a => {
        let j, x, i
        for (i = a.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1))
            x = a[i]
            a[i] = a[j]
            a[j] = x
        }
        return a
    }
}
