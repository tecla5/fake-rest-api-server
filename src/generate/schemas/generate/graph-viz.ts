import {
    schemaFromPath,
    hasDeprecated,    
    nameOf,
    schemaRefName
  } from '../util'

  
  export async function addToGraph(path : any, pathKey : string, doc : any, graph: any) {
    let {schema, method, methodName} = schemaFromPath(path)
  
    const tags = method.tags || {}
    if (hasDeprecated(tags)) {
      return
    }
  
    const docPath = doc.original.paths[pathKey]
    const okResponse = docPath[methodName].responses['200']
    const schemaWithRef = okResponse
      ? okResponse.schema
      : {}
    // use Definitions reference name if present
    const schemaRef = (schemaWithRef || {}).$ref
  
    let schemaName = schemaRefName(schemaRef)  
    const name = schemaName || nameOf(method, tags)

    graph.addNodes({
      doc: doc.original, 
      name,
      schemaName,
      schemaRef,
      pathKey,
      schema
    })
  }