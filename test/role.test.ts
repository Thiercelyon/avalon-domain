import {GameState} from '../src/state/game-state'

test('1 + 1 should be equal to 2', () => {
  const gameState = new GameState()
  console.log({gameState: gameState})
  expect(1 + 1).toBe(2)
})
