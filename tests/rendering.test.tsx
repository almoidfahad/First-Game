import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import MainMenu from '../src/pages/MainMenu'
import NewGame from '../src/pages/NewGame'
import { useGameStore } from '../src/store/useGameStore'

beforeEach(() => {
  useGameStore.setState({
    state: null,
    screen: 'menu',
    saves: [],
    toast: null,
    privacySeat: null,
    intentMode: null,
    hydrated: true,
    bootError: null,
  })
})

describe('interface wiring', () => {
  it('opens the campaign setup from the main menu', async () => {
    const user = userEvent.setup()
    render(<MainMenu />)

    expect(screen.getByRole('heading', { name: /shadow city/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /continue game/i })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /new game/i }))
    expect(useGameStore.getState().screen).toBe('new-game')
    expect(useGameStore.getState().intentMode).toBe('solo')
  })

  it('starts a real campaign from the setup screen', async () => {
    const user = userEvent.setup()
    render(<NewGame />)

    await user.click(screen.getByRole('button', { name: /start game/i }))

    await waitFor(() => {
      expect(useGameStore.getState().state).not.toBeNull()
    })
    const state = useGameStore.getState().state
    expect(state?.phase).toBe('event')
    expect(state?.round).toBe(1)
    expect(state?.players).toHaveLength(1)
    expect(useGameStore.getState().screen).toBe('board')
  })
})
