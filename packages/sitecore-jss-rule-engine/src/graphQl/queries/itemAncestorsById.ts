export const itemAncestorsByIdQuery = `
  query itemAncestorsById($id: String) {
    item(path: $id, language: "en") {
        id,
        name,
        ancestors {
          id,
          name,
          url {hostName, path, siteName, url},
          path,
          template {
            id,
            name
          }
        },
    }
  }
`;