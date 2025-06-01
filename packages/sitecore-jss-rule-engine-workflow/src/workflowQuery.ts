export const sitecoreQuery = async (path: string, language: string = "en") => {
    const { gql } = await import('graphql-request');
    return gql`query {
        item (path: "${path}", language:"${language}") {
            name,
            field(name:"Start State"){
                name,
                value
            }
            stateItems: children {
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
                            }
                            template {
                                id,
                                name
                            }
                        }
                    }
                }
            }
        }
    }`;
}