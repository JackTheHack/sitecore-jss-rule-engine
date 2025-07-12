export const conditionActionQuery = async (path: string, language: string = "en") => {
    return `query {
        item (path: "${path}", language:"${language}") {
            id,
            name,            
            branches: children {
                results {
                    id,
                    name,
                    field (name: "Condition") {
                        id,
                        name,
                        value
                    }                    
                }
            }
        }
    }`;
}