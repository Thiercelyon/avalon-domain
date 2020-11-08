import {Message, TextChannel, User} from 'discord.js'
import {Quest} from '../domain/quest'
import {Role} from '../domain/roles'
import {client} from '../index'

const roles: Role[] = [
    Role.SIMPLE_VASSAL,
    Role.SIMPLE_VASSAL,
    Role.SIMPLE_VASSAL,
    Role.MERLIN,
    Role.LANCELOT_GENTIL,
    Role.LANCELOT_MECHANT,
    Role.MORDRED,
    Role.MORGANE,
    Role.PERCEVAL,
    Role.OBEYRON,
]

export default class RoleAssignmentBot {
    private players: Map<Role, User[]> = new Map<Role, User[]>([
        [Role.SIMPLE_VASSAL, []],
        [Role.LANCELOT_GENTIL, []],
        [Role.MERLIN, []],
        [Role.PERCEVAL, []],
        [Role.MORDRED, []],
        [Role.MORGANE, []],
        [Role.OBEYRON, []],
        [Role.LANCELOT_MECHANT, []],
    ])
    private roles: Role[] = []
    private quest: Quest[] = []
    private questMembersCount = 0
    private mainChannel: TextChannel

    constructor() {
        client.on('message', (message: Message) => {
            console.log('received message')
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
            [Role.SIMPLE_VASSAL, []],
            [Role.LANCELOT_GENTIL, []],
            [Role.MERLIN, []],
            [Role.PERCEVAL, []],
            [Role.MORDRED, []],
            [Role.MORGANE, []],
            [Role.OBEYRON, []],
            [Role.LANCELOT_MECHANT, []],
        ])
        roles.forEach(r => this.roles.push(r))
        this.shuffle(this.roles)
        channel.send(`Initialisation d'une nouvelle session avec ces rôles : [${roles.join(
            ' | '
        )}]
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
    Vassaux : ${this.players.get(Role.SIMPLE_VASSAL)},
    Merlin : ${this.players.get(Role.MERLIN)},
    Lancelot gentil : ${this.players.get(Role.LANCELOT_GENTIL)},
    Lancelot méchant : ${this.players.get(Role.LANCELOT_MECHANT)},
    Perceval : ${this.players.get(Role.PERCEVAL)},
    Mordred : ${this.players.get(Role.MORDRED)},
    Morgane : ${this.players.get(Role.MORGANE)},
    Obeyron : ${this.players.get(Role.OBEYRON)},
    `)

    night_phase = () => {
        this.merlin()
        this.lancelot_g()
        this.lancelot_m()
        this.perceval()
        this.mechants(Role.MORDRED)
        this.mechants(Role.MORGANE)
        this.mechants(Role.LANCELOT_MECHANT)
    }

    merlin = () =>
        this.players
            .get(Role.MERLIN)[0]
            .send(
                `Voici les méchants : ${[
                    this.players.get(Role.MORGANE),
                    this.players.get(Role.LANCELOT_MECHANT),
                    this.players.get(Role.OBEYRON),
                ]}`
            )

    perceval = () =>
        this.players
            .get(Role.PERCEVAL)[0]
            .send(
                `Voici Morgane et Merlin : ${[
                    this.players.get(Role.MORGANE),
                    this.players.get(Role.MERLIN),
                ]}`
            )

    lancelot_g = () =>
        this.players
            .get(Role.LANCELOT_GENTIL)[0]
            .send(
                `Voici ton antagoniste : ${[this.players.get(Role.LANCELOT_MECHANT)]}`
            )

    lancelot_m = () =>
        this.players
            .get(Role.LANCELOT_MECHANT)[0]
            .send(
                `Voici ton antagoniste : ${[this.players.get(Role.LANCELOT_GENTIL)]}`
            )

    mechants = (role: Role) =>
        this.players
            .get(role)[0]
            .send(
                `Voici l'équipe de bad guys : ${[
                    this.players.get(Role.MORDRED),
                    this.players.get(Role.MORGANE),
                    this.players.get(Role.LANCELOT_MECHANT),
                ]}`
            )

    initQuest = ({channel}: Message, ...players: User[]) => {
        channel.send(`J'ai reçu un équipage comprenant : ${players.join(' | ')}`)
        channel.send(`Un équipage de **${players.length} aventuriers** part en quête !
            Aventuriers ! Envoyez moi un **UNIQUE** MP avec la commande **!quest <SUCCESS|FAIL>** pour contribuer à sa réussite... Ou son échec...`)
        this.quest = []
        this.questMembersCount = players.length
    }

    achieveQuest = (message: Message, quest: Quest) => {
        this.quest.push(quest)
        --this.questMembersCount
        if (this.questMembersCount > 0)
            this.mainChannel.send(
                `Il nous manque encore ${this.questMembersCount} vote(s).`
            )
        else if (this.questMembersCount === 0) {
            this.mainChannel.send(`La quête est terminée !
            ${this.shuffle(this.quest).join(' | ')}`)
        } else {
            this.mainChannel.send(
                "Mais virez moi ce clampin qui continue à voter alors que c'est fini !"
            )
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
