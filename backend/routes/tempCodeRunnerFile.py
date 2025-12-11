@router.post("/BookUplaod", response_model=BookOut)
def upload_book(book: BookCreate, db: Session=Depends(get_db)):
                #current_user: models.User=Depends(get_current_user)):

    print ('inside upload_book')

    try:
        book_dict = book.model_dump()
        print('after model dump')
        book_dict["name"] = book_dict["name"].capitalize()
        book_dict["category"] = book_dict["category"].capitalize()
        book_dict["author"] = book_dict["author"].capitalize()
        book_dict["langauge"] = book_dict["language"].capitalize()
        book_dict["target_langauge"] = book_dict["target_language"].capitalize()
        print('after inupt capitalization')

        new_book = models.Book(**book_dict)
        print('after creating new_book')
        db.add(new_book)
        print('after adding new book')
        db.commit()
        print('after committing to db')
        db.refresh(new_book)
        print('after refreshing')

        # Add this book to `uploaded_books` table

        uploaded_book_dict = {'user_id': 2, 'book_id':new_book.id}
        new_upload = models.UploadedBooks(**uploaded_book_dict)
        db.add(new_upload)
        db.commit()
        db.refresh(new_upload)

        return new_book
    except Exception:
        print("Some Error Has Occured, Please Check Your Input Validity")
