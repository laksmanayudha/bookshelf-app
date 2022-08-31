const books = []
const RENDER_EVENT = 'render-books'
const STORAGE_KEY = 'bookshelf-storage'
const SAVED_EVENT = 'saved-boooks'
const POP_UP_FORM_EVENT = 'pop-up-form'
const UNPOP_UP_FORM_EVENT = 'unpop-up-form'
let searchKeyword = '';
let CURRENT_BOOK_ID = null

function generateId(){
    return +new Date()
}

function generateBookObject(id, title, author, year, isComplete){
    return {
        id,
        title, 
        author, 
        year,
        isComplete
    }
}

function findBook(bookId){
    for(let book of books){
        if(book.id === bookId){
            return book
        }
    }
    return null
}

function findBookIndex(bookId){
    for(let index in books){
        if(books[index].id === bookId){
            return index;
        }
    }
    return -1;
}

function moveBookToCompleted(bookId){
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = true
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

function moveBooktoIncompleted(bookId){
    const bookTarget = findBook(bookId);
    if (bookTarget == null) return;

    bookTarget.isComplete = false
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveBook()
}

function editBook(bookId){
    CURRENT_BOOK_ID = bookId;
    const bookTarget = findBook(bookId);

    document.getElementById("inputBookTitle").value = bookTarget.title
    document.getElementById("inputBookAuthor").value = bookTarget.author
    document.getElementById("inputBookYear").value = bookTarget.year
    document.getElementById("inputBookIsComplete").checked = bookTarget.isComplete

    document.dispatchEvent(new Event(POP_UP_FORM_EVENT))
}

function deleteBook(bookId){
    const index = findBookIndex(bookId)
    if(index === -1) return;

    Swal.fire({
        title: 'Apakah anda yakin?',
        text: "Aksi ini tidak dapat dikembalikan!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Hapus!'
      }).then((result) => {
        if (result.isConfirmed) {

          // delete book
          books.splice(index, 1);

          // fire custom dialog
          Swal.fire(
            'Terhapus!',
            'Buku telah terhapus',
            'success'
          )

          // re-render
          document.dispatchEvent(new Event(RENDER_EVENT));
          saveBook()
        }
    })
}

function saveBook(){
    if(isStrorageExist()){
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStrorageExist(){
    if (typeof(Storage) === undefined){
        alert("Browser tidak mendukung local storage");
        return false;
    }else{
        return true;
    }
}

function loadBooksFromStorage(){
    const serializedBooks = localStorage.getItem(STORAGE_KEY);
    const booksData = JSON.parse(serializedBooks);

    if(booksData !== null){
        for(let book of booksData){
            books.push(book)
        }
    }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject){
    const {id, title, author, year, isComplete} = bookObject;

    //title
    const titleElement = document.createElement("h3")
    titleElement.innerText = title

    //author
    const authorElement = document.createElement("p")
    authorElement.innerText = author

    // year
    const yearElement = document.createElement("p")
    yearElement.innerText = year

    // content container
    const contentContainer = document.createElement("div")
    contentContainer.classList.add('book-item__content')
    contentContainer.append(titleElement, authorElement, yearElement)

    // article
    const article = document.createElement("article")
    article.classList.add("book-item")
    article.setAttribute("id", `book-${id}`)
    article.append(contentContainer)

    // action/button container
    const buttonContainer = document.createElement("div")
    buttonContainer.classList.add("book-item__action")
    if(isComplete){
        // move book
        const moveButton = document.createElement("button")
        moveButton.classList.add("move")
        const readIcon = document.createElement('i')
        readIcon.classList.add('fas')
        readIcon.classList.add('fa-book')
        moveButton.appendChild(readIcon)
        moveButton.addEventListener("click", function(){
            moveBooktoIncompleted(id)
        })
        
        // delete book
        const deleteButton = document.createElement("button")
        deleteButton.classList.add("delete")
        const deleteIcon = document.createElement('i')
        deleteIcon.classList.add('fas')
        deleteIcon.classList.add('fa-trash-alt')
        deleteButton.appendChild(deleteIcon)
        deleteButton.addEventListener("click", function(){
            deleteBook(id)
        })
        
        // edit button
        const editButton = document.createElement("button")
        editButton.classList.add("update")
        const editIcon = document.createElement('i')
        editIcon.classList.add('fas')
        editIcon.classList.add('fa-edit')
        editButton.appendChild(editIcon)
        editButton.addEventListener("click", function(){
            editBook(id)
        })
        buttonContainer.append(moveButton, editButton, deleteButton)
    }else{
        // move book
        const moveButton = document.createElement("button")
        moveButton.classList.add("move")
        const unreadIcon = document.createElement('i')
        unreadIcon.classList.add('fab')
        unreadIcon.classList.add('fa-readme')
        moveButton.appendChild(unreadIcon)
        moveButton.addEventListener("click", function(){
            moveBookToCompleted(id)
        })

        // delete book
        const deleteButton = document.createElement("button")
        deleteButton.classList.add("delete")
        const deleteIcon = document.createElement('i')
        deleteIcon.classList.add('fas')
        deleteIcon.classList.add('fa-trash-alt')
        deleteButton.appendChild(deleteIcon)
        deleteButton.addEventListener("click", function(){
           deleteBook(id)
        })
        
        // edit button
        const editButton = document.createElement("button")
        editButton.classList.add("update")
        const editIcon = document.createElement('i')
        editIcon.classList.add('fas')
        editIcon.classList.add('fa-edit')
        editButton.appendChild(editIcon)
        editButton.addEventListener("click", function(){
           editBook(id)
        })
        buttonContainer.append(moveButton, editButton, deleteButton)
    }
    article.append(buttonContainer)
    return article
}

function makeEmptyMessage(message){
    let emptyMessage = document.createElement("p");
    emptyMessage.innerText = message;
    emptyMessage.classList.add('empty-message')

    return emptyMessage;
}

function addBook(){
    const inputBookTitle = document.getElementById("inputBookTitle").value
    const inputBookAuthor = document.getElementById("inputBookAuthor").value
    const inputBookYear = document.getElementById("inputBookYear").value
    const inputBookIsComplete = document.getElementById("inputBookIsComplete").checked

    if(CURRENT_BOOK_ID === null){
        const bookId = generateId()
        const bookObject = generateBookObject(bookId, inputBookTitle, inputBookAuthor, inputBookYear, inputBookIsComplete)
        books.push(bookObject)
        Swal.fire(
            'Berhasil!',
            'Buku berhasil ditambahkan',
            'success'
        ).then((res) => { document.dispatchEvent(new Event(UNPOP_UP_FORM_EVENT)) })
    }else{
        books.forEach(book => {
            if (book.id === CURRENT_BOOK_ID){
                book.title = inputBookTitle
                book.author = inputBookAuthor
                book.year = inputBookYear
                book.isComplete = inputBookIsComplete
            }
        })
        Swal.fire(
            'Berhasil!',
            'Update buku berhasil',
            'success'
        ).then((res) => { document.dispatchEvent(new Event(UNPOP_UP_FORM_EVENT)) })
    }
    resetInput()
    document.dispatchEvent(new Event(RENDER_EVENT))
    saveBook();
}

function resetInput(){
    document.getElementById("inputBookTitle").value = ''
    document.getElementById("inputBookAuthor").value = ''
    document.getElementById("inputBookYear").value = null
    document.getElementById("inputBookIsComplete").checked = false
    CURRENT_BOOK_ID = null
}

function search(){
    searchKeyword = document.getElementById("searchBookTitle").value
    document.dispatchEvent(new Event(RENDER_EVENT))
}

document.addEventListener("DOMContentLoaded", function(){
    const inputBook = document.getElementById("inputBook")
    const searchBook = document.getElementById("searchBook")
    const createButton = document.getElementById('createButton')
    const bookCancel = document.getElementById('bookCancel')
    const toggleButton = document.querySelector('.toggle-button')
    const headBarSearch = document.querySelector('.head-bar__search')

    createButton.addEventListener("click", function(){
        document.dispatchEvent(new Event(POP_UP_FORM_EVENT))
    })

    bookCancel.addEventListener("click", function(){
        document.dispatchEvent(new Event(UNPOP_UP_FORM_EVENT))
        resetInput()
    })

    inputBook.addEventListener("submit", function(event){
        event.preventDefault();
        addBook();
    })

    searchBook.addEventListener("submit", function(event){
        event.preventDefault();
        search();
    })

    toggleButton.addEventListener('click', function(){
        headBarSearch.classList.toggle('toggle')
    })

    if(isStrorageExist()){
        loadBooksFromStorage();
    }
})

document.addEventListener(RENDER_EVENT, function(){
    const incompleteBookshelfList = document.getElementById("incompleteBookshelfList");
    const completeBookshelfList = document.getElementById("completeBookshelfList");

    // clear book item
    incompleteBookshelfList.innerHTML = "";
    completeBookshelfList.innerHTML = "";

    // filter book
    const completedBooks = books.filter(book => book.isComplete === true && book.title.toLowerCase().includes(searchKeyword.toLowerCase()))
    const inCompletedBooks = books.filter(book => book.isComplete === false && book.title.toLowerCase().includes(searchKeyword.toLowerCase()))

    // render book
    if (completedBooks.length === 0){
        let emptyMessage = makeEmptyMessage("Tidak ada buku")
        completeBookshelfList.append(emptyMessage)
    }else{
        completedBooks.forEach(book => {
            const bookElement = makeBook(book);
            completeBookshelfList.append(bookElement)
        })
    }

    if (inCompletedBooks.length === 0){
        let emptyMessage = makeEmptyMessage("Tidak ada buku")
        incompleteBookshelfList.append(emptyMessage)
    }else{
        inCompletedBooks.forEach(book => {
            const bookElement = makeBook(book);
            incompleteBookshelfList.append(bookElement)
        })
    }
})

document.addEventListener(SAVED_EVENT, function(){
    console.log(localStorage.getItem(STORAGE_KEY))
})

document.addEventListener(POP_UP_FORM_EVENT, function(){
    const inputSection = document.getElementById('inputSection')
    const inputBook = document.getElementById('inputBook')
    inputSection.classList.add('pop-up')
    inputBook.style.marginBottom = '0'
    inputBook.style.transition = '.5s'
})

document.addEventListener(UNPOP_UP_FORM_EVENT, function(){
    const inputSection = document.getElementById('inputSection')
    const inputBook = document.getElementById('inputBook')
    inputSection.classList.remove('pop-up')
    inputBook.style.marginBottom = '200px'
    inputBook.style.transition = '.5s'
})