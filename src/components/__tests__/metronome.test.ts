import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import metronome from '../metronome'

describe('metronome', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('initial state', () => {
        it('starts at 120 BPM', () => {
            const metro = metronome(() => {})
            expect(metro.getTempo()).toBe(120)
        })

        it('isAtMin returns false at default tempo', () => {
            const metro = metronome(() => {})
            expect(metro.isAtMin()).toBe(false)
        })

        it('isAtMax returns false at default tempo', () => {
            const metro = metronome(() => {})
            expect(metro.isAtMax()).toBe(false)
        })
    })

    describe('tempo adjustments', () => {
        it('increaseTempo adds 5 BPM', () => {
            const metro = metronome(() => {})
            metro.increaseTempo()
            expect(metro.getTempo()).toBe(125)
        })

        it('decreaseTempo subtracts 5 BPM', () => {
            const metro = metronome(() => {})
            metro.decreaseTempo()
            expect(metro.getTempo()).toBe(115)
        })

        it('cannot exceed 240 BPM', () => {
            const metro = metronome(() => {})
            for (let i = 0; i < 100; i++) metro.increaseTempo()
            expect(metro.getTempo()).toBe(240)
            expect(metro.isAtMax()).toBe(true)
        })

        it('cannot go below 40 BPM', () => {
            const metro = metronome(() => {})
            for (let i = 0; i < 100; i++) metro.decreaseTempo()
            expect(metro.getTempo()).toBe(40)
            expect(metro.isAtMin()).toBe(true)
        })
    })

    describe('tick behaviour', () => {
        it('calls onTick at the correct interval for 120 BPM', () => {
            const onTick = vi.fn()
            const metro = metronome(onTick)
            metro.start()
            // 120 BPM → interval = 60000 / 120 = 500ms
            vi.advanceTimersByTime(500)
            expect(onTick).toHaveBeenCalledTimes(1)
            vi.advanceTimersByTime(500)
            expect(onTick).toHaveBeenCalledTimes(2)
            metro.stop()
        })

        it('stop prevents further onTick calls', () => {
            const onTick = vi.fn()
            const metro = metronome(onTick)
            metro.start()
            vi.advanceTimersByTime(500)
            expect(onTick).toHaveBeenCalledTimes(1)
            metro.stop()
            vi.advanceTimersByTime(2000)
            expect(onTick).toHaveBeenCalledTimes(1)
        })

        it('calling start twice does not double-fire onTick', () => {
            const onTick = vi.fn()
            const metro = metronome(onTick)
            metro.start()
            vi.advanceTimersByTime(250)
            metro.start() // restart mid-interval — should reset
            vi.advanceTimersByTime(500)
            expect(onTick).toHaveBeenCalledTimes(1)
            metro.stop()
        })

        it('changing tempo while running restarts at the new interval', () => {
            const onTick = vi.fn()
            const metro = metronome(onTick)
            metro.start() // 500ms interval
            metro.increaseTempo() // 125 BPM → 480ms interval
            vi.advanceTimersByTime(480)
            expect(onTick).toHaveBeenCalledTimes(1)
            metro.stop()
        })
    })
})
