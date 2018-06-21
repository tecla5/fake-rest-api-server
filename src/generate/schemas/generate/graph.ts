import {
    schemaRefName,
    writeFile,
    serverPath
} from '../util'
const $path = require('path');

class Node {
    type: string = 'default'
    name: string
    many: boolean
    path: boolean
    label: string = '<unknown>'

    constructor(data: any = {}) {
        const {
            type,
            label,
            many,
            path,
            name
        } = data    
        this.label = label
        this.type = type
        this.many = many
        this.path = path
        this.name = name
    }
}

class Connection {
    from: Node
    to: Node

    constructor(from?: Node, to?: Node) {
        this.from = from || new Node()
        this.to = to || new Node()       
    }

    create(fromData: any, toData: any) {
        this.from = new Node(fromData)
        this.to = new Node(toData)
        return this
    }
}

const stylesMap = {
    many: 'filled',
    path: 'bold'
}

export class Graph {
    nodes: Node[] = []
    connections: Connection[] = []
    doc: any = {}

    nodesMap: any = {}

    constructor(doc: any = {}) {
        this.doc = doc
    }

    toString(): string {
        const s = []
        s.push('digraph {') 
        
        for (let conn of this.connections) {
            let style = ''
            let toLabel = conn.to.label
            let fromLabel = conn.from.label
            const { many, name } = conn.to
            const manyStyle = many ? stylesMap.many : ''
            const pathStyle = conn.from.path ? stylesMap.path : ''
            const styles: string = [manyStyle, pathStyle].join(' ').trim()
            const size = styles.trim().length
            if (size > 0) {
                style = `[ ${styles} ]`
            }
            if (many) {
                toLabel = `*${toLabel}`
            }
            if (name) {
                toLabel = toLabel + ` (${name})`
            }

            s.push(`${fromLabel} -> ${toLabel} ${style}`)
        }
        s.push('}')         
        return s.join('\n')
    }

    save(filePath?: string) {
        const fullPath: string = filePath || $path.join(serverPath, 'viz', 'swagger-graph.gv')
        writeFile(fullPath, this.toString())
    }

    addNode(node: Node) {
        this.nodes.push(node)
    }

    addConnection(conn: Connection) {
        this.connections.push(conn)
    }

    addConn(conn: Connection) {
        const {
            from,
            to
        } = conn

        if (!from.label || !to.label) return

        // duplicate connection
        if (this.nodesMap[from.label] === to.label) {
            return
        }        
        this.nodesMap[from.label] = to.label

        this.addNode(conn.from)
        this.addNode(conn.to)
        this.addConnection(conn)
    }

    addConnNodes(from: any, to: any, opts: any = {}) {
        to = {
            ...to,
            ...opts.to || {}
        }
        const conn = new Connection().create(from, to)
        this.addConn(conn)
    }

    // called by schema iterator
    addNodes(data: any) {
        const {
            name,
            schemaName,
            pathKey,
            doc,
        } = data
        this.doc = doc
        this.addConnNodes({
            label: pathKey,
            path: true
        }, {
            label: name
        })
        this.resolveRefToNode(schemaName)
    }

    resolveRefToNode(schemaName: string, opts = {}) {
        if (!schemaName || schemaName === '') return
        const refSchema = this.doc.definitions[schemaName]               
        if (!refSchema) return
        this.addSchemaNode(schemaName, refSchema, opts)    
    }

    resolveRefToItemsNode(name: string, itemsName: string, opts: any = {}) {
        opts = { 
            ...opts,
            many: true
        }
        this.addConnNodes({
            label: name
        }, {
            label: itemsName
        }, {
            to: opts
        })
        this.resolveRefToNode(itemsName, opts)
    }

    getRef(list: any) {
        if (!list) return
        if (!Array.isArray(list)) {
            return list.$ref
        }
        const obj = list.find((item: any) => {
            return item.$ref
        })
        return obj ? obj.$ref : undefined
    }

    addSchemaNode(name: string, schema: any, opts: any = {}) {
        const allOf = schema.allOf
        const items = schema.items
        const properties = schema.properties
        const allRef = this.getRef(allOf)
        const itemsRef = this.getRef(items)
        const $ref = allRef || itemsRef        
        if ($ref) {
            const schemaName = schemaRefName($ref)
            this.resolveRefToItemsNode(name, schemaName)
        }
        if (properties) {
            for (let propName in properties) {
                this.addSchemaPropertyRefNode(name, properties[propName], {
                    ...opts,
                    name: propName
                })
            }
        }
    }

    resolvePropRefToNode(name: string, propName: string, opts: any = {}) {
        this.addConnNodes({
            label: name
        }, {
            label: propName
        }, opts)
        this.resolveRefToNode(propName)
    }

    addSchemaPropertyRefNode(name: string, prop: any, opts: any) {
        const { propName } = opts
        const $ref = this.getRef(prop)
        if ($ref) {    
            const schemaName = schemaRefName($ref)
            this.resolvePropRefToNode(name, schemaName, opts)

            this.addConnNodes({
                label: name
            }, {
                label: propName
            }, opts)
        }
        const items = prop.items
        if (items) {
            const $ref = this.getRef(items)
            if (!$ref) return

            const schemaName = schemaRefName($ref)
            this.resolveRefToItemsNode(name, schemaName, opts)

            this.addConnNodes({
                label: name
            }, {
                label: propName
            }, opts)
        }
    }
}