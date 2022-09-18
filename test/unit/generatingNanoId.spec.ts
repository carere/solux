import { describe, expect, it } from 'vitest'
import { nanoid } from '../../src'

describe('Generating nanoid', () => {
  const id1 = nanoid()
  const id2 = nanoid()

  it('should produce different Id', () => {
    expect(id1).not.toEqual(id2)
  })
})
