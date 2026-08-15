export interface Wish { id: string; name: string; message: string; createdAt?: string }
export interface GuestbookService { list(): Promise<Wish[]>; submit(input: Pick<Wish, 'name' | 'message'>): Promise<Wish> }
