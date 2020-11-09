import Role from '../src/entities/role'
import User from '../src/entities/user'
import Game, {NotificationPort} from '../src/state/game'

describe('Game entity', () => {

    let notification_adapter_mock: NotificationPort

    beforeEach(() => {
        notification_adapter_mock = {notify_game_created: jest.fn()}
    })

    test('instantiated Game entity should have empty roles', () => {
        const game = new Game(notification_adapter_mock)
        expect(game).not.toBeNull()
        expect(game.players).toEqual(new Map())
        expect(notification_adapter_mock.notify_game_created).toBeCalledTimes(1)
    })

    test('instantiated Game entity with roles should initialize roles state', () => {
        const game = new Game(notification_adapter_mock, Role.MERLIN, Role.MORDRED, Role.ASSASSIN, Role.PERCIVAL)
        expect(game.players).toEqual(new Map<Role, User[]>([[Role.MORDRED, []], [Role.MERLIN, []], [Role.ASSASSIN, []], [Role.PERCIVAL, []]]))
        expect(notification_adapter_mock.notify_game_created).toBeCalledTimes(1)
    })

    test('adding roles to Game should update roles', () => {
        const game = new Game(notification_adapter_mock)
        game.add_roles(Role.MERLIN, Role.ASSASSIN)
        expect(game.players).toEqual(new Map<Role, User[]>([[Role.MERLIN, []], [Role.ASSASSIN, []]]))
        expect(notification_adapter_mock.notify_game_created).toBeCalledTimes(1)
    })

    test('removing roles to Game should update roles', () => {
        const game = new Game(notification_adapter_mock, Role.MERLIN, Role.LOYAL_SERVANT, Role.EVIL_LANCELOT)
        game.remove_roles(Role.MERLIN, Role.MORDRED)
        expect(game.players).toEqual(new Map<Role, User[]>([[Role.LOYAL_SERVANT, []], [Role.EVIL_LANCELOT, []]]))
        expect(notification_adapter_mock.notify_game_created).toBeCalledTimes(1)
    })
})
