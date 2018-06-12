export const listSchema = {
    type: "array",
    uniqueItems: true,
    items: {
        type: "object",
        required: ["id", "name"],
        properties: {
        id: {
            type: "string",
            faker: "random.uuid"
        },
        name: {
            type: "string",
            faker: "commerce.productName"
        }
        },
        
    }
}

