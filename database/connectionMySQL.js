import{createPool} from "mysql2/promise";

export const pool = createPool({
    host: "localhost",
    port:3307,
    database: "agenda_consultorio",
    user: "root",
    password: "root"
});