export const itemDescendantsByIdQuery = `
  query itemDescendantsById($id: String) {
    item(path: $id, language: "en") {
        id,
        name,
        children {
          total,
          results{
            id,
            name,
            url {hostName, path, siteName, url},
            path,
            template {
              id, 
              name            
            }
          }
        }
    }
  }
`;