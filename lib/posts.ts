import { DocumentSnapshot, Timestamp } from "firebase/firestore";

export interface IPost {
    title: string;
    slug: string;
    content: string;
    published: boolean;
    heartCount: number;
    uid: string;
    username: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface IPostJson {
  title: string;
    slug: string;
    content: string;
    published: boolean;
    heartCount: number;
    uid: string;
    username: string;
    createdAt: number;
    updatedAt: number;
}

/**
 * Uses a lot of complex logic to convert a doc to something with create/update dates
 * 
 * @param doc document to convert to json
 */
 export function postToJson(data: IPost): IPostJson {
    return {
      ... data,
      createdAt: data.createdAt.toMillis(),
      updatedAt: data.updatedAt.toMillis()
    }
  }

  export function jsonToPost(data: IPostJson): IPost {
    return {
      ... data,
      createdAt: Timestamp.fromMillis(data.createdAt),
      updatedAt: Timestamp.fromMillis(data.updatedAt)
    }
  }