DROP TABLE IF EXISTS todolist;

CREATE TABLE todolist(
    id SERIAL PRIMARY KEY,
    task varchar,
    location varchar,
    description text
);