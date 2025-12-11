CREATE TABLE users (
    id INTEGER NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    username VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    password VARCHAR NOT NULL,
    CONSTRAINT pk_users_id PRIMARY KEY (id)
);

CREATE TABLE books (
    id INTEGER NOT NULL,
    name VARCHAR NOT NULL,
    category VARCHAR NOT NULL,
    author VARCHAR,
    language VARCHAR NOT NULL,
    target_language VARCHAR NOT NULL,
    CONSTRAINT pk_books_id PRIMARY KEY (id)
);

CREATE TABLE translations (
    id INTEGER NOT NULL,
    book_id INTEGER,
    user_id INTEGER,
    upload_date DATE NOT NULL,
    CONSTRAINT pk_translations_id PRIMARY KEY (id),
    CONSTRAINT fk_book_id_in_translations FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id_in_translations FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE reviews (
    id INTEGER NOT NULL,
    translation_id INTEGER,
    user_id INTEGER,
    date_issued DATE NOT NULL,
    comment VARCHAR,
    rating INTEGER,
    CONSTRAINT pk_reviews_id PRIMARY KEY (id),
    CONSTRAINT fk_translation_id_in_reviews FOREIGN KEY (translation_id) REFERENCES translations (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_id_in_reviews FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE favorite_books (
    id INTEGER NOT NULL,
    user_id INTEGER,
    book_id INTEGER,
    CONSTRAINT pk_favorite_books_id PRIMARY KEY (id),
    CONSTRAINT fk_user_id_in_favorite_books FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_id_in_favorite_books FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
);

CREATE TABLE uploaded_books (
    id INTEGER NOT NULL,
    user_id INTEGER,
    book_id INTEGER,
    CONSTRAINT pk_uploaded_books_id PRIMARY KEY (id),
    CONSTRAINT fk_user_id_in_uploaded_books FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_book_id_in_uploaded_books FOREIGN KEY (book_id) REFERENCES books (id) ON DELETE CASCADE
);
