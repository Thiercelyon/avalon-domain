import Role from '../entities/role'
import User from '../entities/user'

/**
 * Representation of the set of Players.
 * This entity is instantiated with optional roles not associated to any User at first.
 */
export default class Players {
    private _players: Map<Role, User[]>

    constructor(...roles: Role[]) {
        this._players = roles.reduce((acc, role) => acc.set(role, []), new Map<Role, User[]>())
    }

    /** Add new roles to the Players state */
    add_roles(...roles: Role[]) {
        roles.forEach(role => this._players.set(role, []))
        return this
    }

    /** Remove roles from the Players state */
    remove_roles(...roles: Role[]) {
        roles.forEach(role => this._players.delete(role))
        return true
    }

    /** Add a user to the set of users associated to the provided role */
    set_user(user: User, role: Role) {
        this._players.get(role).push(user)
    }

    /** Retrieve the set of Users by role */
    get_users(role: Role) {
        return this._players.get(role)
    }

}
