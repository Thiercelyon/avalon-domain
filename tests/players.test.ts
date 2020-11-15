import Role from '../src/entities/role'
import Players from '../src/state/Players'
import * as _ from 'lodash'

describe('Players entity', () => {

    test('should add players to Players entity', () => {
        const players = new Players()
        players.add_roles(Role.MERLIN, Role.ASSASSIN)
        expect(new Players(Role.MERLIN, Role.ASSASSIN)).toMatchObject(players)
    })

    test('should remove players to Players entity', () => {
        const players = new Players(Role.MERLIN, Role.LOYAL_SERVANT, Role.EVIL_LANCELOT)
        players.remove_roles(Role.MERLIN, Role.MORDRED)
        expect(new Players(Role.LOYAL_SERVANT, Role.EVIL_LANCELOT)).toEqual(players)
    })

})
