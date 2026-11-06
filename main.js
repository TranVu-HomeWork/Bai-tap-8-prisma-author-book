const { PrismaClient, Prisma } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Nested write: một lệnh tạo Author và hai Book
  const author = await prisma.author.create({
    data: {
      name: 'Nguyễn Nhật Ánh',
      books: {
        create: [
          { title: 'Mắt Biếc', price: 120000 },
          { title: 'Tôi Thấy Hoa Vàng Trên Cỏ Xanh', price: 135000 }
        ]
      }
    },
    include: {
      books: true
    }
  });

  console.log('Author vừa tạo kèm books:');
  console.log(author);

  // 2. Đọc Author kèm toàn bộ Book
  const authorWithBooks = await prisma.author.findUnique({
    where: { id: author.id },
    include: { books: true }
  });

  console.log('Author và danh sách books:');
  console.log(authorWithBooks);

  // 3. Cập nhật giá Book đầu tiên
  const updatedBook = await prisma.book.update({
    where: { id: author.books[0].id },
    data: { price: 150000 }
  });

  console.log('Book sau cập nhật:');
  console.log(updatedBook);

  // 4. Xóa Book thứ hai
  const deletedBook = await prisma.book.delete({
    where: { id: author.books[1].id }
  });

  console.log('Đã xóa book:');
  console.log(deletedBook);

  // Bắt lỗi khi xóa ID không tồn tại
  try {
    await prisma.book.delete({
      where: { id: 999999 }
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.log('Không thể xóa: Book với ID 999999 không tồn tại.');
    } else {
      throw error;
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });