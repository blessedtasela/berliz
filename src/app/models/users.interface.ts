export interface Users {
    id: number,
    firstname: string,
    lastname: string,
    phone: string,
    dob: string,
    gender: string,
    country: string,
    state: string,
    city: string,
    postalCode: number,
    address: string,
    profilePhoto: any;
    email: string,
    role: string;
    date: string;
    lastUpdate: string;
    status: string;
}

export interface Login {
    email: string,
    password: string
}

export interface Role {
    id: number,
    role: string
}