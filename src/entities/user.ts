export default interface User {
    id: string,
    name: string,

    send: (message: string) => void
}
