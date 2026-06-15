export class Node<T> {
  value: T
  next: Node<T> | null
  prev: Node<T> | null

  constructor(value: T) {
    this.value = value
    this.next = null
    this.prev = null
  }
}

export class LinkedList<T> {
  ids: Set<string> = new Set()
  head: Node<T> | null
  tail: Node<T> | null
  length: number

  constructor(node?: Node<T> | null) {
    this.head = node || null
    this.tail = node || null
    this.length = node ? 1 : 0
  }

  append(value: T) {
    // This is to not append existing conversations as duplicates
    if (typeof value === "object" && value !== null && "_id" in value) {
      const id = (value as any)._id
      if (this.ids.has(id)) {
        return
      }
      this.ids.add(id)
    }

    let newNode = new Node(value)
    this.length++

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
      return
    }

    if (this.tail) {
      this.tail.next = newNode
      newNode.prev = this.tail
    }
    this.tail = newNode
  }

  iterate(callback: (node: Node<T>) => React.ReactNode): React.ReactNode[] {
    let current = this.head
    let result = []
    while (current) {
      result.push(callback(current))
      current = current.next
    }
    return result
  }

  printList() {
    let current = this.head
    let result = ""
    while (current) {
      result += current.value + "->"
      current = current.next
    }
    console.log(result + "null")
  }
}
