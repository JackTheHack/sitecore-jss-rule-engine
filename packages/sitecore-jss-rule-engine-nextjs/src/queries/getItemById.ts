var GetItemByIdQuery:string = `query GetItemById($id:String){
 item(language:"en", path:$id)
  {
    id,
    name,
    fields
    {
      name,
      value
    },
    path    
  }
}`

export { GetItemByIdQuery }