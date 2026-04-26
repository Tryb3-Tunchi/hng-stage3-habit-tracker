/// <reference types="vitest/globals" />
import '@testing-library/jest-dom'

// Mock localStorage — override jsdom's version safely
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => { store[key] = value },
    removeItem: (key: string): void => { delete store[key] },
    clear: (): void => { store = {} },
    get length(): number { return Object.keys(store).length },
    key: (i: number): string | null => Object.keys(store)[i] ?? null,
  }
})()

// configurable + writable so jsdom doesn't throw on redefine
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
})

// globals: true in vitest.config gives us beforeEach at file scope
beforeEach(() => {
  localStorage.clear()
})