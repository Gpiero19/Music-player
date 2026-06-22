import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRecordingHistory } from '../useRecordingHistory'
import { RecordedKey } from '../../types'

const KEYS: RecordedKey[] = [
    { key: 'A', sound: 'snare.mp3', time: 0 },
    { key: 'S', sound: 'kick.mp3',  time: 200 },
]

describe('useRecordingHistory', () => {
    beforeEach(() => {
        localStorage.clear()
        vi.spyOn(Date, 'now').mockReturnValue(1000)
    })

    afterEach(() => {
        vi.restoreAllMocks()
        localStorage.clear()
    })

    it('starts with an empty history when localStorage is empty', () => {
        const { result } = renderHook(() => useRecordingHistory())
        expect(result.current.recentHistory).toEqual([])
    })

    it('restores history from localStorage on mount', () => {
        const stored = [{ id: 1, keys: KEYS, index: 1, name: 'Recording #1' }]
        localStorage.setItem('recentHistory', JSON.stringify(stored))
        const { result } = renderHook(() => useRecordingHistory())
        expect(result.current.recentHistory).toEqual(stored)
    })

    it('addRecording prepends a new entry', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        expect(result.current.recentHistory).toHaveLength(1)
        expect(result.current.recentHistory[0].keys).toEqual(KEYS)
        expect(result.current.recentHistory[0].name).toBe('Recording #1')
    })

    it('addRecording persists to localStorage', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        const saved = JSON.parse(localStorage.getItem('recentHistory')!)
        expect(saved).toHaveLength(1)
        expect(saved[0].keys).toEqual(KEYS)
    })

    it('addRecording with empty keys does nothing', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording([]) })
        expect(result.current.recentHistory).toHaveLength(0)
    })

    it('addRecording caps history at 5 entries', () => {
        const { result } = renderHook(() => useRecordingHistory())
        for (let i = 0; i < 7; i++) {
            act(() => { result.current.addRecording(KEYS) })
        }
        expect(result.current.recentHistory).toHaveLength(5)
    })

    it('addRecording increments the counter for each entry', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        act(() => { result.current.addRecording(KEYS) })
        const names = result.current.recentHistory.map(r => r.name)
        expect(names).toContain('Recording #1')
        expect(names).toContain('Recording #2')
    })

    it('deleteRecording removes the entry by id', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        const id = result.current.recentHistory[0].id
        act(() => { result.current.deleteRecording(id) })
        expect(result.current.recentHistory).toHaveLength(0)
    })

    it('deleteRecording persists the removal to localStorage', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        const id = result.current.recentHistory[0].id
        act(() => { result.current.deleteRecording(id) })
        const saved = JSON.parse(localStorage.getItem('recentHistory')!)
        expect(saved).toHaveLength(0)
    })

    it('renameRecording updates the name of the matching entry', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        const id = result.current.recentHistory[0].id
        act(() => { result.current.renameRecording(id, 'My Beat') })
        expect(result.current.recentHistory[0].name).toBe('My Beat')
    })

    it('renameRecording persists the new name to localStorage', () => {
        const { result } = renderHook(() => useRecordingHistory())
        act(() => { result.current.addRecording(KEYS) })
        const id = result.current.recentHistory[0].id
        act(() => { result.current.renameRecording(id, 'My Beat') })
        const saved = JSON.parse(localStorage.getItem('recentHistory')!)
        expect(saved[0].name).toBe('My Beat')
    })
})
