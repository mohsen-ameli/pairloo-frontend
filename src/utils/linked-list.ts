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
  static ids: Set<string> = new Set()
  head: Node<T> | null
  tail: Node<T> | null
  length: number

  constructor(node?: Node<T> | null) {
    this.head = node || null
    this.tail = node || null
    this.length = node ? 1 : 0
  }

  clear() {
    this.head = null
    this.tail = null
    this.length = 0
    LinkedList.ids.clear()
  }

  remove(node: Node<T>) {
    if (!this.head) return

    if (node === this.head) {
      this.head = node.next
    }
    if (node === this.tail) {
      this.tail = node.prev
    }
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
    this.length--
    if (typeof node.value === "object" && node.value !== null && "_id" in node.value) {
      LinkedList.ids.delete((node.value as any)._id)
    }
  }

  moveToFront(node: Node<T>) {
    if (node === this.head) return

    // Detach node
    if (node.prev) {
      node.prev.next = node.next
    }
    if (node.next) {
      node.next.prev = node.prev
    }
    if (node === this.tail) {
      this.tail = node.prev
    }

    // Move to front
    node.next = this.head
    node.prev = null
    if (this.head) {
      this.head.prev = node
    }
    this.head = node
  }

  appendAtHead(value: T) {
    // This is to not append existing conversations as duplicates
    if (typeof value === "object" && value !== null && "_id" in value) {
      const id = (value as any)._id.toString()
      if (LinkedList.ids.has(id)) {
        return
      }
      LinkedList.ids.add(id)
    }

    let newNode = new Node(value)
    this.length++

    if (!this.head) {
      this.head = newNode
      this.tail = newNode
      return
    }

    newNode.next = this.head
    this.head.prev = newNode
    this.head = newNode
  }

  exists(value: T): boolean {
    if (typeof value === "object" && value !== null && "_id" in value) {
      return LinkedList.ids.has((value as any)._id)
    }
    return false
  }

  append(value: T) {
    // This is to not append existing conversations as duplicates
    if (typeof value === "object" && value !== null && "_id" in value) {
      const id = (value as any)._id
      if (LinkedList.ids.has(id)) {
        return
      }
      LinkedList.ids.add(id)
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
      result += (current.value as any)._id + "->"
      current = current.next
    }
    console.log(result + "null")
  }
}
