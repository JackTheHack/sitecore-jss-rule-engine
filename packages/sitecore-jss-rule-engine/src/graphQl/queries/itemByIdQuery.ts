export const itemByIdQuery = `
  query itemByIdQuery($id: String) {
    item(path: $id, language: "en") {
        id,
        name,
        parent {
          id
        },
        fields {
          name,
          value
        },
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

