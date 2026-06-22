import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecording } from '../useRecording'

describe('useRecording', () => {
    beforeEach(() => { vi.useFakeTimers() })
    afterEach(() => { vi.useRealTimers() })

    it('starts inactive with no keys', () => {
        const { result } = renderHook(() => useRecording())
        expect(result.current.recording).toBe(false)
        expect(result.current.recordedKeys).toEqual([])
    })

    it('startRecording sets recording to true', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        expect(result.current.recording).toBe(true)
    })

    it('startRecording clears any previous keys', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        act(() => { result.current.recordKey('A', 'snare.mp3') })
        act(() => { result.current.startRecording() })
        expect(result.current.recordedKeys).toEqual([])
    })

    it('recordKey captures key with elapsed time', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        vi.advanceTimersByTime(200)
        act(() => { result.current.recordKey('A', 'snare.mp3') })
        expect(result.current.recordedKeys).toHaveLength(1)
        expect(result.current.recordedKeys[0]).toMatchObject({ key: 'A', sound: 'snare.mp3' })
        expect(result.current.recordedKeys[0].time).toBeGreaterThanOrEqual(200)
    })

    it('recordKey accumulates multiple keys', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        vi.advanceTimersByTime(100)
        act(() => { result.current.recordKey('A', 'snare.mp3') })
        vi.advanceTimersByTime(150)
        act(() => { result.current.recordKey('S', 'kick.mp3') })
        expect(result.current.recordedKeys).toHaveLength(2)
        expect(result.current.recordedKeys[1].time).toBeGreaterThan(result.current.recordedKeys[0].time)
    })

    it('stopRecording sets recording to false', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        act(() => { result.current.stopRecording() })
        expect(result.current.recording).toBe(false)
    })

    it('stopRecording returns the captured keys', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        act(() => { result.current.recordKey('A', 'snare.mp3') })
        act(() => { result.current.recordKey('D', 'crash.mp3') })
        let returned: ReturnType<typeof result.current.stopRecording>
        act(() => { returned = result.current.stopRecording() })
        expect(returned!).toHaveLength(2)
        expect(returned![0].key).toBe('A')
        expect(returned![1].key).toBe('D')
    })

    it('stopRecording returns an empty array when nothing was recorded', () => {
        const { result } = renderHook(() => useRecording())
        act(() => { result.current.startRecording() })
        let returned: ReturnType<typeof result.current.stopRecording>
        act(() => { returned = result.current.stopRecording() })
        expect(returned!).toEqual([])
    })
})
