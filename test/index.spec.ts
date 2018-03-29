import { lens } from '../src/index'

interface Root {
  test: string
  users: User[]
}

interface User {
  id: number
  name: string
  child?: User
}

describe('Lens Proxy', () => {
  const root = {
    test: 'hello',
    users: [
      {
        id: 1,
        name: 'Test',
        child: {
          id: 3,
          name: 'Test Child'
        }
      },
      {
        id: 2,
        name: 'Test 2'
      }
    ]
  }

  it('get', () => {
    const childId = lens<Root>().users[0].child.id
    const id = childId()(root)
    expect(id).toBe(3)
  })

  it('set', () => {
    const childName = lens<Root>().users[0].child.name
    const updated = childName('Updated')(root)
    expect(updated).toEqual({
      ...root,
      users: [
        {
          ...root.users[0],
          child: {
            ...root.users[0].child,
            name: 'Updated'
          }
        },
        ...root.users.slice(1)
      ]
    })
  })
})
