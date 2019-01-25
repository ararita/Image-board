DROP TABLE IF EXISTS comments;

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    img_id INTEGER NOT NULL,
    username VARCHAR(150) NOT NULL,
    comment VARCHAR(350) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
