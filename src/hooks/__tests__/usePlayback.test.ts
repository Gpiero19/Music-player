import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePlayback } from '../usePlayback'
import { RecordedKey } from '../../types'

const KEYS: RecordedKey[] = [
    { key: 'A', sound: 'snare.mp3', time: 0   },
    { key: 'S', sound: 'kick.mp3',  time: 200 },
    { key: 'D', sound: 'crash.mp3', time: 500 },
]

describe('usePlayback', () => {
    let playSound: (key: string) => void
    let flashKey: (key: string) => void

    beforeEach(() => {
        playSound = vi.fn<(key: string) => void>()
        flashKey = vi.fn<(key: string) => void>()
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('starts with isPlaying false', () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        expect(result.current.isPlaying).toBe(false)
    })

    it('playRecording sets isPlaying to true', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        act(() => { result.current.playRecording(KEYS) })
        expect(result.current.isPlaying).toBe(true)
    })

    it('playRecording fires sounds in order with correct delays', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        act(() => { result.current.playRecording(KEYS) })

        // First key fires after its own `time` delay (0ms → immediate after 0ms)
        await act(async () => { await vi.advanceTimersByTimeAsync(0) })
        expect(playSound).toHaveBeenCalledTimes(1)
        expect(playSound).toHaveBeenLastCalledWith('A')

        // Second key fires 200ms after the first
        await act(async () => { await vi.advanceTimersByTimeAsync(200) })
        expect(playSound).toHaveBeenCalledTimes(2)
        expect(playSound).toHaveBeenLastCalledWith('S')

        // Third key fires 300ms after the second (500 - 200)
        await act(async () => { await vi.advanceTimersByTimeAsync(300) })
        expect(playSound).toHaveBeenCalledTimes(3)
        expect(playSound).toHaveBeenLastCalledWith('D')
    })

    it('playRecording also calls flashKey for each sound', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        act(() => { result.current.playRecording(KEYS) })
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
        expect(flashKey).toHaveBeenCalledTimes(3)
    })

    it('sets isPlaying to false when playback completes', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        act(() => { result.current.playRecording(KEYS) })
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
        expect(result.current.isPlaying).toBe(false)
    })

    it('stopPlayback halts playback mid-sequence', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        act(() => { result.current.playRecording(KEYS) })

        // First key fires, then stop before the second
        await act(async () => { await vi.advanceTimersByTimeAsync(0) })
        act(() => { result.current.stopPlayback() })
        expect(result.current.isPlaying).toBe(false)

        // Advance past remaining delays — no further sounds should fire
        await act(async () => { await vi.advanceTimersByTimeAsync(500) })
        expect(playSound).toHaveBeenCalledTimes(1)
    })

    it('does nothing when keys array is empty', async () => {
        const { result } = renderHook(() => usePlayback(playSound, flashKey))
        await act(async () => { await result.current.playRecording([]) })
        expect(result.current.isPlaying).toBe(false)
        expect(playSound).not.toHaveBeenCalled()
    })
})
