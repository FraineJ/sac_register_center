interface User {
    id: number;
    name: string;
    email: string;
    documentType: string;
    identification: string;
    address: string;
}

interface Fleet {
    name: string;
    user: User;
}

interface ListDocument {
    name: string;
}

export interface IFleetDocument {
    id: number;
    url: string;
    expirationDate: string; // o Date si lo conviertes
    name: string;
    expires: boolean;
    fleetId: number;
    listDocumentId: number;
    windowStart: string; // o Date si lo conviertes
    windowEnd: string; // o Date si lo conviertes
    fleet: Fleet;
    listDocument: ListDocument;
}