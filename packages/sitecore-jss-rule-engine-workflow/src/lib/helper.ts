import { embed } from 'ai';
import { google } from '@ai-sdk/google';

export function cleanId(id: string){

    if(!id)
    {
        return id;
    }

    return id.replace(/[{}]/g, '').replace(/-/g, '');
}

export async function generateEmbeddings(facts: string) {
  console.log('Embedding content - ', facts)
  
  const embedValue = await embed({
    model: google.textEmbeddingModel('text-embedding-004'),
    value: facts,
    maxRetries: 1
  });
  return { content: facts, embedding: embedValue };
};


