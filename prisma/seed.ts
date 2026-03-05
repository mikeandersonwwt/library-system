import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Authors ────────────────────────────────────────────────────────────────
  const authors = await Promise.all([
    prisma.author.create({
      data: {
        firstName: 'Eleanor',
        lastName: 'Voss',
        bio: 'Award-winning novelist known for sweeping historical fiction set in early 20th century Europe.',
        birthYear: 1962,
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Marcus',
        lastName: 'Thorn',
        bio: 'Former marine biologist turned science fiction author. Known for gripping near-future thrillers.',
        birthYear: 1975,
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Priya',
        lastName: 'Anand',
        bio: 'Celebrated mystery writer and two-time winner of the Chandler Prize.',
        birthYear: 1980,
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Daniel',
        lastName: 'Okafor',
        bio: 'Nigerian-British author writing speculative fiction that explores identity and belonging.',
        birthYear: 1988,
      },
    }),
    prisma.author.create({
      data: {
        firstName: 'Sasha',
        lastName: 'Merritt',
        bio: 'Prolific fantasy author and co-creator of the Ember Kingdoms universe.',
        birthYear: 1971,
      },
    }),
  ]);

  const [eleanor, marcus, priya, daniel, sasha] = authors;
  console.log(`Created ${authors.length} authors.`);

  // ─── Books ───────────────────────────────────────────────────────────────────
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'The Ash Continent',
        isbn: '9781000000001',
        publishedYear: 2004,
        genre: 'Historical Fiction',
        synopsis: 'A sweeping saga of a diplomat family navigating the collapse of an empire between the two great wars.',
        totalCopies: 3,
        availableCopies: 3,
        authors: { create: [{ authorId: eleanor.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Letters from the Winter Palace',
        isbn: '9781000000002',
        publishedYear: 2011,
        genre: 'Historical Fiction',
        synopsis: 'Based on real correspondence, a fictional account of court intrigue in a crumbling monarchy.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: eleanor.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Depth Zero',
        isbn: '9781000000003',
        publishedYear: 2018,
        genre: 'Science Fiction',
        synopsis: 'A deep-sea research station discovers something ancient and dangerous in an unexplored trench.',
        totalCopies: 3,
        availableCopies: 3,
        authors: { create: [{ authorId: marcus.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Carbon Protocol',
        isbn: '9781000000004',
        publishedYear: 2021,
        genre: 'Science Fiction',
        synopsis: 'In a world of mandatory carbon rationing, one scientist discovers the system is being gamed.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: marcus.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Tidal Equation',
        isbn: '9781000000005',
        publishedYear: 2023,
        genre: 'Science Fiction',
        synopsis: 'A joint venture between a marine biologist and an AI oceanographer goes terribly wrong.',
        totalCopies: 1,
        availableCopies: 1,
        authors: { create: [{ authorId: marcus.id }, { authorId: daniel.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Dead Drop in Delhi',
        isbn: '9781000000006',
        publishedYear: 2015,
        genre: 'Mystery',
        synopsis: 'Detective Reena Sharma investigates a murder at an international summit that threatens to derail peace talks.',
        totalCopies: 3,
        availableCopies: 3,
        authors: { create: [{ authorId: priya.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Monsoon Killer',
        isbn: '9781000000007',
        publishedYear: 2019,
        genre: 'Mystery',
        synopsis: 'When bodies begin surfacing during monsoon season, Reena Sharma returns to her hometown.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: priya.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Seven Quiet Streets',
        isbn: '9781000000008',
        publishedYear: 2022,
        genre: 'Mystery',
        synopsis: 'A locked-room mystery set in a remote lakeside village during a snowstorm.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: priya.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Between Two Rivers',
        isbn: '9781000000009',
        publishedYear: 2017,
        genre: 'Literary Fiction',
        synopsis: 'A Nigerian boy grows up across two continents and must choose between the lives that shaped him.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: daniel.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Mirror Tongue',
        isbn: '9781000000010',
        publishedYear: 2020,
        genre: 'Speculative Fiction',
        synopsis: 'In an alternate London, language itself becomes a weapon of colonial control.',
        totalCopies: 3,
        availableCopies: 3,
        authors: { create: [{ authorId: daniel.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Ember and Ash',
        isbn: '9781000000011',
        publishedYear: 2009,
        genre: 'Fantasy',
        synopsis: 'The founding epic of the Ember Kingdoms — a world ruled by elemental guilds on the brink of war.',
        totalCopies: 3,
        availableCopies: 3,
        authors: { create: [{ authorId: sasha.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Smoldering Crown',
        isbn: '9781000000012',
        publishedYear: 2013,
        genre: 'Fantasy',
        synopsis: 'The second Ember Kingdoms novel. A young queen must unite warring guilds against an ancient threat.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: sasha.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Ashfall',
        isbn: '9781000000013',
        publishedYear: 2018,
        genre: 'Fantasy',
        synopsis: 'The Ember Kingdoms trilogy concludes with an epic siege and an unexpected betrayal.',
        totalCopies: 2,
        availableCopies: 2,
        authors: { create: [{ authorId: sasha.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Long Frontier',
        isbn: '9781000000014',
        publishedYear: 2007,
        genre: 'Historical Fiction',
        synopsis: 'Co-authored saga tracing the lives of three generations of settlers on a fictional prairie continent.',
        totalCopies: 1,
        availableCopies: 1,
        authors: { create: [{ authorId: eleanor.id }, { authorId: sasha.id }] },
      },
    }),
    prisma.book.create({
      data: {
        title: 'Null Island',
        isbn: '9781000000015',
        publishedYear: 2016,
        genre: 'Thriller',
        synopsis: 'An intelligence analyst discovers a ghost ship at the geographic origin point of GPS — coordinates 0°N, 0°E.',
        totalCopies: 2,
        availableCopies: 1,
        authors: { create: [{ authorId: marcus.id }, { authorId: priya.id }] },
      },
    }),
  ]);

  console.log(`Created ${books.length} books.`);

  // ─── Users ───────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('password123', 10);

  const librarian = await prisma.user.create({
    data: {
      email: 'librarian@library.com',
      password: passwordHash,
      name: 'Alex Morgan',
      role: 'LIBRARIAN',
    },
  });

  const member1 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: passwordHash,
      name: 'Jane Doe',
      role: 'MEMBER',
    },
  });

  const member2 = await prisma.user.create({
    data: {
      email: 'sam@example.com',
      password: passwordHash,
      name: 'Sam Rivera',
      role: 'MEMBER',
    },
  });

  console.log(`Created 3 users (1 librarian, 2 members).`);

  // ─── Borrow Records ──────────────────────────────────────────────────────────
  const now = new Date();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;

  // jane has 1 active borrow (Null Island — already shows 1 available copy)
  await prisma.borrow.create({
    data: {
      userId: member1.id,
      bookId: books[14].id, // Null Island
      borrowedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      dueAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + fourteenDays),
    },
  });

  // sam has 1 returned borrow
  const returnedBorrowDate = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
  await prisma.borrow.create({
    data: {
      userId: member2.id,
      bookId: books[2].id, // Depth Zero
      borrowedAt: returnedBorrowDate,
      dueAt: new Date(returnedBorrowDate.getTime() + fourteenDays),
      returnedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // returned 7 days ago
    },
  });

  // librarian has 1 active borrow
  await prisma.borrow.create({
    data: {
      userId: librarian.id,
      bookId: books[0].id, // The Ash Continent
      borrowedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
      dueAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + fourteenDays),
    },
  });

  // Update availableCopies for The Ash Continent (borrowed by librarian)
  await prisma.book.update({
    where: { id: books[0].id },
    data: { availableCopies: 2 },
  });

  console.log('Created 3 borrow records (2 active, 1 returned).');
  console.log('\nSeed complete!');
  console.log('\nSeed credentials (all passwords: password123):');
  console.log('  LIBRARIAN: librarian@library.com');
  console.log('  MEMBER:    jane@example.com');
  console.log('  MEMBER:    sam@example.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
