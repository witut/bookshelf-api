const { nanoid } = require('nanoid');

const books = require('./books');

// 1. menambahkan buku
const addBooksHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const finished = pageCount === readPage;
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // 1.1 ketika client tidak melampirkan property name
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // 1.2 ketika client melampirkan properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // 1.3 ketika client melampirkan semua property dan nilainya sesuai dengan kriteria,
  // maka data disimpan kedalam array, kemudian response akan dikirimkan dengan status code 201
  books.push({
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    finished,
    insertedAt,
    updatedAt,
  });
  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: { bookId: id },
    });
    response.code(201);
    return response;
  }

  // 1.4 Server gagal memasukkan buku karena alasan umum (generic error). Bila hal ini terjadi,
  // maka server akan merespons dengan status code 500
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

// 2. menampilkan seluruh buku
const getAllBooksHandler = (request) => {
  const { reading, finished, name } = request.query;
  let bookCollection = [];
  if (reading !== undefined) {
    if (Number(reading) === 1) {
      books.forEach((book) => {
        if (book.reading) {
          bookCollection.push({
            id: book.id, name: book.name, publisher: book.publisher,
          });
        }
      });
    } else {
      books.forEach((book) => {
        if (!book.reading) {
          bookCollection.push({
            id: book.id, name: book.name, publisher: book.publisher,
          });
        }
      });
    }
  } else if (finished !== undefined) {
    if (Number(finished) === 1) {
      books.forEach((book) => {
        if (book.finished) {
          bookCollection.push({
            id: book.id, name: book.name, publisher: book.publisher,
          });
        }
      });
    } else {
      books.forEach((book) => {
        if (!book.finished) {
          bookCollection.push({
            id: book.id, name: book.name, publisher: book.publisher,
          });
        }
      });
    }
  } else if (name !== undefined) {
    books.forEach((book) => {
      if (book.name.toLowerCase().search(name.toLowerCase()) !== -1) {
        bookCollection.push({
          id: book.id, name: book.name, publisher: book.publisher,
        });
      }
    });
  } else {
    bookCollection = books.map((book) => ({
      id: book.id, name: book.name, publisher: book.publisher,
    }));
  }
  return {
    status: 'success', data: { books: bookCollection },
  };
};

// 3. menampilkan detail buku
const getBookByidHandler = (request, h) => {
  const { id } = request.params;
  const book = books.filter((b) => b.id === id)[0];
  if (book !== undefined) {
    return {
      status: 'success',
      data: { book },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });

  response.code(404);
  return response;
};

// 4. mengubah data buku
const updateBookHandler = (request, h) => {
  const { id } = request.params;
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const updatedAt = new Date().toISOString();
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });

  response.code(404);
  return response;
};
// 5. menghapus buku
const deleteBookHandler = (request, h) => {
  const { id } = request.params;
  const index = books.findIndex((book) => book.id === id);
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};
module.exports = {
  addBooksHandler,
  getAllBooksHandler,
  getBookByidHandler,
  updateBookHandler,
  deleteBookHandler,
};
