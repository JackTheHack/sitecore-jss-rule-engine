export const conditionActionQuery = async (path: string, language: string = "en") => {
    return `query {
        item (path: "${path}", language:"${language}") {
            id,
            name,            
            actionItems: children {
                results {
                    id,
                    name,
                    children {
                        results {
                            id,
                            name,
                            fields (ownFields: false) {
                                id,
                                name,
                                value
                            },
                            template {
                                id,
                                name
                            },
                            children {
                                id,
                                name,
                                template {
                                    id,
                                    name
                                },
                                fields (ownFields: false) {
                                    id,
                                    name,
                                    value
                                }
                            }
                        }
                    }
                }
            }
        }
    }`;
}