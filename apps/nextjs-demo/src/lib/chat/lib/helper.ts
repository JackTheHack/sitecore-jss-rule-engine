export function cleanId(id: string){

    if(!id)
    {
        return id;
    }

    return id.replace(/[{}]/g, '').replace(/-/g, '');
}