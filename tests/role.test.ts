import Role from '../src/entities/role'
import Game, {NotificationPort} from '../src/state/game'
import Players from '../src/state/Players'

describe('Game entity', () => {

    let notification_adapter_mock: NotificationPort

    beforeEach(() => {
        notification_adapter_mock = {notify_game_created: jest.fn()}
    })

    test('instantiated Game entity should have empty roles', () => {
        const game = new Game(notification_adapter_mock)
        expect(game).not.toBeNull()
        expect(game.players).toEqual(new Players())
    })

    test('instantiated Game entity with roles should initialize roles state', () => {
        const game = new Game(notification_adapter_mock, Role.MERLIN, Role.MORDRED, Role.ASSASSIN, Role.PERCIVAL)
        expect(new Players(Role.MORDRED, Role.MERLIN, Role.ASSASSIN, Role.PERCIVAL)).toEqual(game.players)
    })

    test('instantiated Game entity should notify its creation', () => {
        new Game(notification_adapter_mock, Role.MERLIN, Role.MORDRED, Role.ASSASSIN, Role.PERCIVAL)
        expect(notification_adapter_mock.notify_game_created).toBeCalledTimes(1)
    })

})
